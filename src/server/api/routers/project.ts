import z from "zod";
import { createTRPCRouter, protectedProcedure, projectProcedure } from "../trpc";
import { pollCommits, octokit, checkCredits, getPullRequests, analyzePullRequest } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { aiSummarizeChangesSinceLastVisit, generateEmbedding } from "@/lib/gemini";


const githubUrlSchema = z.string().url().refine(
    (url) => {
        try {
            const parsed = new URL(url);
            return parsed.hostname === 'github.com' && parsed.pathname.split('/').filter(Boolean).length >= 2;
        } catch {
            return false;
        }
    },
    { message: 'Must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)' }
);

export const projectRouter = createTRPCRouter({
    // 1. Create Project
    createProject: protectedProcedure.input(
        z.object({
            name: z.string().min(1).max(100),
            githubUrl: githubUrlSchema,
            githubToken: z.string().optional(),
            branch: z.string().optional(),
        })
    ).mutation(async ({ ctx, input }) => {
        const fileCount = await checkCredits(input.githubUrl, input.githubToken, input.branch);
        const project = await ctx.db.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: ctx.user.userId },
                select: { credits: true },
            });
            if (!user || (user.credits || 0) < fileCount) {
                throw new Error('Insufficient Credits');
            }

            const newProject = await tx.project.create({
                data: {
                    githubUrl: input.githubUrl,
                    name: input.name,
                    indexingStatus: 'PENDING',
                    branch: input.branch || undefined,
                    userToProjects: {
                        create: { userId: ctx.user.userId },
                    },
                },
            });

            await tx.user.update({
                where: { id: ctx.user.userId },
                data: { credits: { decrement: fileCount } },
            });

            return newProject;
        });

        // Fire-and-forget: don't block the response
        // Process indexing first, then commits (sequential to avoid double rate-limiting)
        indexGithubRepo(project.id, input.githubUrl, input.githubToken, input.branch)
            .then(() => pollCommits(project.id, input.githubToken))
            .catch((err) => console.error('Background processing failed:', err));

        return project;
    }),

    // 2. Get Projects (Active only)
    getProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: { some: { userId: ctx.user.userId } },
                deletedAt: null,
            },
        });
    }),

    // 3. Get Commits (Secured with project membership)
    getCommits: projectProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        return await ctx.db.commit.findMany({
            where: { projectId: input.projectId },
            orderBy: { commitDate: 'desc' },
        });
    }),

    // 4. Save Answer
    saveAnswer: projectProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any(),
        chatSessionId: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data: {
                answer: input.answer,
                filesReferences: input.filesReferences ?? null,
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId,
                chatSessionId: input.chatSessionId ?? null,
            },
        });
    }),

    // 5. Get Questions
    getQuestions: projectProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.question.findMany({
            where: { projectId: input.projectId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
    }),

    // 6. Upload Meeting
    uploadMeeting: projectProcedure.input(z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.meeting.create({
            data: {
                meetingUrl: input.meetingUrl,
                projectId: input.projectId,
                name: input.name,
                status: "PROCESSING",
            },
        });
    }),

    // 7. Get Meetings
    getMeetings: projectProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findMany({
            where: { projectId: input.projectId },
            include: { issues: true },
        });
    }),

    // 8. Delete Meeting
    deleteMeeting: protectedProcedure.input(z.object({
        meetingId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        // Verify ownership through project membership
        const meeting = await ctx.db.meeting.findUnique({
            where: { id: input.meetingId },
            select: { projectId: true },
        });
        if (!meeting) throw new Error('Meeting not found');

        const membership = await ctx.db.userToProject.findUnique({
            where: {
                userId_projectId: {
                    userId: ctx.user.userId,
                    projectId: meeting.projectId,
                },
            },
        });
        if (!membership) throw new Error('You do not have access to this meeting');

        return await ctx.db.meeting.delete({ where: { id: input.meetingId } });
    }),

    // 9. Get Single Meeting
    getMeetingById: protectedProcedure.input(z.object({
        meetingId: z.string(),
    })).query(async ({ ctx, input }) => {
        const meeting = await ctx.db.meeting.findUnique({
            where: { id: input.meetingId },
            include: { issues: true },
        });
        if (!meeting) throw new Error('Meeting not found');

        const membership = await ctx.db.userToProject.findUnique({
            where: {
                userId_projectId: {
                    userId: ctx.user.userId,
                    projectId: meeting.projectId,
                },
            },
        });
        if (!membership) throw new Error('You do not have access to this meeting');

        return meeting;
    }),

    // 10. Archive Project (Soft Delete)
    archiveProject: projectProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({
            where: { id: input.projectId },
            data: {
                deletedAt: new Date(),
                status: "ARCHIVED",
            },
        });
    }),

    // 11. Restore Project
    restoreProject: projectProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
        });
        if (!project) throw new Error('Project not found');

        await ctx.db.project.update({
            where: { id: input.projectId },
            data: {
                deletedAt: null,
                status: "ACTIVE",
                indexingStatus: "PENDING",
            },
        });

        // Fire-and-forget background re-indexing
        indexGithubRepo(input.projectId, project.githubUrl)
            .then(() => pollCommits(input.projectId))
            .catch(console.error);

        return { restored: true };
    }),

    // 11.5 Sync/Refresh Project
    syncProject: projectProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
        });
        if (!project) throw new Error('Project not found');

        await ctx.db.project.update({
            where: { id: input.projectId },
            data: {
                indexingStatus: "PENDING",
                indexingProgress: 0,
            },
        });

        // Fire-and-forget background re-indexing
        indexGithubRepo(input.projectId, project.githubUrl)
            .then(() => pollCommits(input.projectId))
            .catch(console.error);

        return { syncing: true };
    }),

    // 12. PERMANENT DELETE (Only allowed on archived projects)
    deleteProject: projectProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { deletedAt: true },
        });

        if (!project?.deletedAt) {
            throw new Error('Project must be archived before permanent deletion');
        }

        return await ctx.db.project.delete({ where: { id: input.projectId } });
    }),

    // 13. Get Archived Projects
    getArchivedProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                deletedAt: { not: null },
                userToProjects: { some: { userId: ctx.user.userId } },
            },
            orderBy: { deletedAt: 'desc' },
        });
    }),

    // 14. Get Team Members
    getTeamMembers: projectProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.userToProject.findMany({
            where: { projectId: input.projectId },
            include: { user: true },
        });
    }),

    // 15. Github stars (fixed repo name typo)
    getMyRepoStats: protectedProcedure.query(async () => {
        const OWNER = "Adityazzzzz";
        const REPO = "GitBrain-AI-Studio";

        try {
            const { data } = await octokit.rest.repos.get({ owner: OWNER, repo: REPO });
            return {
                stars: data.stargazers_count,
                forks: data.forks_count,
                url: data.html_url,
            };
        } catch (error) {
            console.error('Failed to fetch global stats:', error);
            return null;
        }
    }),

    // 16. Get user credits
    getMyCredits: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.user.findUnique({
            where: { id: ctx.user.userId },
            select: { credits: true },
        });
    }),

    // 17. Check credits
    checkCredits: protectedProcedure.input(z.object({
        githubUrl: githubUrlSchema,
        githubToken: z.string().optional(),
        branch: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
        const fileCount = await checkCredits(input.githubUrl, input.githubToken, input.branch);
        const user = await ctx.db.user.findUnique({
            where: { id: ctx.user.userId },
            select: { credits: true },
        });
        return { fileCount, userCredits: user?.credits || 0 };
    }),

    // 18. Get Indexing Status (NEW)
    getIndexingStatus: projectProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: {
                indexingStatus: true,
                indexingProgress: true,
                totalFiles: true,
                branch: true,
            },
        });
        return project;
    }),

    // 19. Get Chat Sessions (NEW)
    getChatSessions: projectProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.chatSession.findMany({
            where: { projectId: input.projectId, userId: ctx.user.userId },
            orderBy: { updatedAt: 'desc' },
            include: { _count: { select: { questions: true } } },
        });
    }),

    // 20. Create Chat Session (NEW)
    createChatSession: projectProcedure.input(z.object({
        projectId: z.string(),
        name: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.chatSession.create({
            data: {
                projectId: input.projectId,
                userId: ctx.user.userId,
                name: input.name ?? 'New Chat',
            },
        });
    }),

    // 21. Get Chat History for a session (NEW)
    getChatHistory: protectedProcedure.input(z.object({
        chatSessionId: z.string(),
    })).query(async ({ ctx, input }) => {
        const session = await ctx.db.chatSession.findUnique({
            where: { id: input.chatSessionId },
            select: { userId: true },
        });
        if (!session || session.userId !== ctx.user.userId) {
            throw new Error('Chat session not found');
        }
        return await ctx.db.question.findMany({
            where: { chatSessionId: input.chatSessionId },
            orderBy: { createdAt: 'asc' },
        });
    }),

    // 22. Get Source Code Files (for file tree) (NEW)
    getSourceCodeFiles: projectProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.sourceCodeEmbedding.findMany({
            where: { projectId: input.projectId },
            select: {
                id: true,
                fileName: true,
                summary: true,
            },
            orderBy: { fileName: 'asc' },
        });
    }),

    // 23. Get file details (for file tree click) (NEW)
    getFileDetails: projectProcedure.input(z.object({
        projectId: z.string(),
        fileId: z.string(),
    })).query(async ({ ctx, input }) => {
        return await ctx.db.sourceCodeEmbedding.findFirst({
            where: { id: input.fileId, projectId: input.projectId },
        });
    }),

    // 24. Generate changelog from commits (NEW)
    getChangelog: projectProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        const commits = await ctx.db.commit.findMany({
            where: { projectId: input.projectId },
            orderBy: { commitDate: 'desc' },
            take: 50,
        });

        // Group by date
        const grouped: Record<string, typeof commits> = {};
        for (const commit of commits) {
            const date = commit.commitDate.toISOString().split('T')[0]!;
            if (!grouped[date]) grouped[date] = [];
            grouped[date]!.push(commit);
        }
        return grouped;
    }),

    // 25. Get project insights / stats (NEW)
    getProjectInsights: projectProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        const [fileCount, commitCount, questionCount, meetingCount, files] = await Promise.all([
            ctx.db.sourceCodeEmbedding.count({ where: { projectId: input.projectId } }),
            ctx.db.commit.count({ where: { projectId: input.projectId } }),
            ctx.db.question.count({ where: { projectId: input.projectId } }),
            ctx.db.meeting.count({ where: { projectId: input.projectId } }),
            ctx.db.sourceCodeEmbedding.findMany({
                where: { projectId: input.projectId },
                select: { fileName: true },
            }),
        ]);

        // Language breakdown from file extensions
        const extensions: Record<string, number> = {};
        for (const file of files) {
            const ext = file.fileName.split('.').pop()?.toLowerCase() ?? 'unknown';
            extensions[ext] = (extensions[ext] ?? 0) + 1;
        }

        // Top contributors from commits
        const recentCommits = await ctx.db.commit.findMany({
            where: { projectId: input.projectId },
            select: { commitAuthorName: true, commitAuthorAvatar: true },
        });
        const contributors: Record<string, { count: number; avatar: string }> = {};
        for (const c of recentCommits) {
            if (!contributors[c.commitAuthorName]) {
                contributors[c.commitAuthorName] = { count: 0, avatar: c.commitAuthorAvatar };
            }
            contributors[c.commitAuthorName]!.count++;
        }

        return {
            fileCount,
            commitCount,
            questionCount,
            meetingCount,
            languageBreakdown: extensions,
            contributors,
        };
    }),

    // 26. Get changes summary since last visit (NEW)
    getChangesSummarySinceLastVisit: projectProcedure.input(z.object({
        projectId: z.string(),
        lastVisitedAt: z.string(),
    })).query(async ({ ctx, input }) => {
        const lastVisited = new Date(input.lastVisitedAt);
        const commits = await ctx.db.commit.findMany({
            where: {
                projectId: input.projectId,
                commitDate: { gt: lastVisited },
            },
            orderBy: { commitDate: 'desc' },
            select: {
                commitMessage: true,
                summary: true,
            },
        });

        if (commits.length === 0) return null;

        const commitSummaries = commits.map(c => `- ${c.commitMessage}: ${c.summary}`).join('\n');
        const summary = await aiSummarizeChangesSinceLastVisit(commitSummaries);
        return { summary, unreadCount: commits.length };
    }),

    // 27. Get open pull requests (NEW)
    getPullRequests: projectProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true },
        });
        if (!project) throw new Error('Project not found');

        // Retrieve tokens if stored or use default GITHUB_TOKEN
        // Wait, how do we get the token if stored? Wait, is githubToken stored on Project?
        // Let's check schema.prisma... no, it's not stored. So we just use process.env.GITHUB_TOKEN.
        return await getPullRequests(project.githubUrl);
    }),

    // 28. Analyze a pull request (NEW)
    analyzePullRequest: projectProcedure.input(z.object({
        projectId: z.string(),
        prNumber: z.number(),
    })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true },
        });
        if (!project) throw new Error('Project not found');

        return await analyzePullRequest(project.githubUrl, input.prNumber);
    }),

    // 29. Get dependency graph for codebase (NEW)
    getDependencyGraph: projectProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        const files = await ctx.db.sourceCodeEmbedding.findMany({
            where: { projectId: input.projectId },
            select: { fileName: true, sourceCode: true },
        });

        const nodes: Array<{ id: string; label: string }> = [];
        const edges: Array<{ id: string; source: string; target: string; animated?: boolean }> = [];
        const fileNames = files.map(f => f.fileName);

        const resolveImport = (currentFile: string, importPath: string): string | null => {
            if (!importPath.startsWith('.')) return null;
            const normalizedCurrent = currentFile.replace(/\\/g, '/');
            const parts = normalizedCurrent.split('/');
            parts.pop();
            
            const importParts = importPath.split('/');
            for (const part of importParts) {
                if (part === '.') continue;
                if (part === '..') {
                    parts.pop();
                } else {
                    parts.push(part);
                }
            }
            
            const resolvedPath = parts.join('/');
            const match = fileNames.find(name => {
                const normName = name.replace(/\\/g, '/');
                return normName === resolvedPath || normName.startsWith(resolvedPath + '.');
            });
            return match || null;
        };

        const importRegex = /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;
        const requireRegex = /const\s+.*=\s+require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

        for (const file of files) {
            nodes.push({
                id: file.fileName,
                label: file.fileName.split('/').pop() || file.fileName,
            });

            const code = file.sourceCode;
            let match;

            // Reset regex lastIndex
            importRegex.lastIndex = 0;
            requireRegex.lastIndex = 0;

            // ES Imports
            while ((match = importRegex.exec(code)) !== null) {
                const importPath = match[1];
                if (importPath) {
                    const target = resolveImport(file.fileName, importPath);
                    if (target && target !== file.fileName) {
                        const edgeId = `${file.fileName}-${target}`;
                        if (!edges.some(e => e.id === edgeId)) {
                            edges.push({
                                id: edgeId,
                                source: file.fileName,
                                target,
                                animated: true,
                            });
                        }
                    }
                }
            }

            // CommonJS Requires
            while ((match = requireRegex.exec(code)) !== null) {
                const importPath = match[1];
                if (importPath) {
                    const target = resolveImport(file.fileName, importPath);
                    if (target && target !== file.fileName) {
                        const edgeId = `${file.fileName}-${target}`;
                        if (!edges.some(e => e.id === edgeId)) {
                            edges.push({
                                id: edgeId,
                                source: file.fileName,
                                target,
                                animated: true,
                            });
                        }
                    }
                }
            }
        }

        return { nodes, edges };
    }),

    // 30. Semantic search across codebase (NEW)
    semanticSearch: projectProcedure.input(z.object({
        projectId: z.string(),
        query: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
        const queryVector = await generateEmbedding(input.query);
        const vectorQuery = `[${queryVector.join(',')}]`;

        const results = await ctx.db.$queryRaw`
            SELECT "id", "fileName", "summary", "sourceCode",
            1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
            FROM "SourceCodeEmbedding"
            WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.35
            AND "projectId" = ${input.projectId}
            ORDER BY similarity DESC
            LIMIT 5` as { id: string; fileName: string; summary: string; sourceCode: string; similarity: number }[];

        return results.map(r => ({
            id: r.id,
            fileName: r.fileName,
            summary: r.summary,
            sourceCode: r.sourceCode,
            similarity: Number(r.similarity),
        }));
    }),

    // 31. Codebase Health Score
    getCodebaseHealthScore: projectProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        const files = await ctx.db.sourceCodeEmbedding.findMany({
            where: { projectId: input.projectId },
            select: { fileName: true, sourceCode: true, summary: true },
        });

        const commitCount = await ctx.db.commit.count({ where: { projectId: input.projectId } });
        const questionCount = await ctx.db.question.count({ where: { projectId: input.projectId } });

        // Metric calculations
        let totalLines = 0;
        let todoCount = 0;
        let longFileCount = 0;
        let deepNestCount = 0;
        let emptyFiles = 0;
        let documentedFiles = 0;
        const MAX_IDEAL_FILE_LENGTH = 300;

        for (const file of files) {
            const lines = file.sourceCode.split('\n');
            totalLines += lines.length;

            if (lines.length > MAX_IDEAL_FILE_LENGTH) longFileCount++;
            if (lines.length === 0) emptyFiles++;
            if (file.summary && file.summary.length > 10) documentedFiles++;

            // Count TODOs, FIXMEs, HACKs
            const todoMatches = file.sourceCode.match(/(?:TODO|FIXME|HACK|XXX|WORKAROUND)[\s:]/gi);
            todoCount += todoMatches?.length ?? 0;

            // Count deep nesting (lines with 4+ levels of indentation)
            for (const line of lines) {
                const indent = line.match(/^(\s+)/);
                if (indent && indent[1]!.length >= 16) deepNestCount++;
            }
        }

        const fileCount = files.length || 1;

        // Calculate individual scores (0-100)
        const docCoverage = Math.round((documentedFiles / fileCount) * 100);
        const todoRatio = Math.min(todoCount / fileCount, 1);
        const todoScore = Math.round((1 - todoRatio) * 100);
        const longFileRatio = Math.min(longFileCount / fileCount, 1);
        const fileLengthScore = Math.round((1 - longFileRatio) * 100);
        const nestRatio = Math.min(deepNestCount / (totalLines || 1), 0.05) / 0.05;
        const complexityScore = Math.round((1 - nestRatio) * 100);
        const avgFileLength = Math.round(totalLines / fileCount);
        const commitFrequency = Math.min(commitCount / 10, 1);
        const commitScore = Math.round(commitFrequency * 100);

        // Weighted overall score
        const overallScore = Math.round(
            docCoverage * 0.25 +
            todoScore * 0.2 +
            fileLengthScore * 0.2 +
            complexityScore * 0.2 +
            commitScore * 0.15
        );

        return {
            overallScore: Math.max(0, Math.min(100, overallScore)),
            metrics: {
                documentationCoverage: { score: docCoverage, detail: `${documentedFiles}/${fileCount} files documented` },
                techDebt: { score: todoScore, detail: `${todoCount} TODO/FIXME/HACK markers found` },
                fileLength: { score: fileLengthScore, detail: `${longFileCount} files over ${MAX_IDEAL_FILE_LENGTH} lines (avg: ${avgFileLength})` },
                codeComplexity: { score: complexityScore, detail: `${deepNestCount} deeply nested code blocks` },
                commitActivity: { score: commitScore, detail: `${commitCount} commits tracked` },
            },
            summary: {
                totalFiles: fileCount,
                totalLines,
                avgFileLength,
                todoCount,
                longFileCount,
                deepNestCount,
                emptyFiles,
                questionCount,
            },
        };
    }),

    // 32. Security Scanner
    scanSecurity: projectProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        const files = await ctx.db.sourceCodeEmbedding.findMany({
            where: { projectId: input.projectId },
            select: { fileName: true, sourceCode: true },
        });

        type Finding = {
            id: string;
            severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
            category: string;
            title: string;
            description: string;
            fileName: string;
            lineNumber: number;
            lineContent: string;
        };

        const findings: Finding[] = [];
        let findingId = 0;

        const patterns: Array<{
            regex: RegExp;
            severity: Finding['severity'];
            category: string;
            title: string;
            description: string;
        }> = [
            {
                regex: /(?:api[_-]?key|apikey|secret[_-]?key|auth[_-]?token|access[_-]?token|private[_-]?key)\s*[:=]\s*['"][A-Za-z0-9_\-/.]{8,}['"]/gi,
                severity: 'CRITICAL',
                category: 'Hardcoded Secrets',
                title: 'Potential hardcoded API key or secret',
                description: 'API keys and secrets should be stored in environment variables, not in source code.',
            },
            {
                regex: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{3,}['"]/gi,
                severity: 'CRITICAL',
                category: 'Hardcoded Secrets',
                title: 'Hardcoded password detected',
                description: 'Passwords must never be hardcoded. Use environment variables or a secrets manager.',
            },
            {
                regex: /eval\s*\(/g,
                severity: 'HIGH',
                category: 'Code Injection',
                title: 'Use of eval() detected',
                description: 'eval() can execute arbitrary code and is a major security risk. Consider using safer alternatives.',
            },
            {
                regex: /innerHTML\s*=/g,
                severity: 'MEDIUM',
                category: 'XSS Vulnerability',
                title: 'Direct innerHTML assignment',
                description: 'Setting innerHTML directly can lead to XSS attacks. Use textContent or sanitize input.',
            },
            {
                regex: /dangerouslySetInnerHTML/g,
                severity: 'MEDIUM',
                category: 'XSS Vulnerability',
                title: 'dangerouslySetInnerHTML usage',
                description: 'Using dangerouslySetInnerHTML can expose your app to XSS attacks. Ensure content is sanitized.',
            },
            {
                regex: /\$\{.*\}\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)/gi,
                severity: 'HIGH',
                category: 'SQL Injection',
                title: 'Potential SQL injection via template literal',
                description: 'SQL queries built with template literals are vulnerable to injection. Use parameterized queries.',
            },
            {
                regex: /(?:console\.log|console\.debug)\s*\(\s*(?:.*(?:token|secret|key|password|credential))/gi,
                severity: 'MEDIUM',
                category: 'Information Leak',
                title: 'Sensitive data logged to console',
                description: 'Logging sensitive information can lead to credential exposure in production.',
            },
            {
                regex: /cors\(\s*\{\s*origin\s*:\s*['"]?\*/g,
                severity: 'MEDIUM',
                category: 'CORS Misconfiguration',
                title: 'Wildcard CORS origin',
                description: 'Using wildcard CORS origin allows any domain to access your API.',
            },
            {
                regex: /new Function\s*\(/g,
                severity: 'HIGH',
                category: 'Code Injection',
                title: 'Dynamic Function constructor',
                description: 'The Function constructor can execute arbitrary code similar to eval().',
            },
            {
                regex: /(?:http:\/\/(?!localhost|127\.0\.0\.1))/g,
                severity: 'LOW',
                category: 'Insecure Protocol',
                title: 'HTTP URL detected (not HTTPS)',
                description: 'Using HTTP instead of HTTPS may expose data in transit.',
            },
        ];

        for (const file of files) {
            // Skip binary-like or config files
            if (/\.(png|jpg|svg|ico|woff|ttf|eot)$/i.test(file.fileName)) continue;

            const lines = file.sourceCode.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i]!;
                for (const pattern of patterns) {
                    pattern.regex.lastIndex = 0;
                    if (pattern.regex.test(line)) {
                        findings.push({
                            id: `SEC-${++findingId}`,
                            severity: pattern.severity,
                            category: pattern.category,
                            title: pattern.title,
                            description: pattern.description,
                            fileName: file.fileName,
                            lineNumber: i + 1,
                            lineContent: line.trim().slice(0, 200),
                        });
                    }
                }
            }
        }

        // Sort by severity
        const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        findings.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

        const summary = {
            total: findings.length,
            critical: findings.filter(f => f.severity === 'CRITICAL').length,
            high: findings.filter(f => f.severity === 'HIGH').length,
            medium: findings.filter(f => f.severity === 'MEDIUM').length,
            low: findings.filter(f => f.severity === 'LOW').length,
            filesScanned: files.length,
        };

        return { findings: findings.slice(0, 50), summary };
    }),

    // 33. Auto-Documentation Generator
    generateDocumentation: projectProcedure.input(z.object({
        projectId: z.string(),
        type: z.enum(['readme', 'architecture', 'getting-started']),
    })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { name: true },
        });
        if (!project) throw new Error('Project not found');

        const files = await ctx.db.sourceCodeEmbedding.findMany({
            where: { projectId: input.projectId },
            select: { fileName: true, summary: true },
            take: 60,
        });

        // Build context strings
        const fileSummaries = files
            .map(f => `- **${f.fileName}**: ${f.summary}`)
            .join('\n');

        // Language breakdown
        const extensions: Record<string, number> = {};
        for (const file of files) {
            const ext = file.fileName.split('.').pop()?.toLowerCase() ?? 'unknown';
            extensions[ext] = (extensions[ext] ?? 0) + 1;
        }
        const languageBreakdown = Object.entries(extensions)
            .sort(([, a], [, b]) => b - a)
            .map(([ext, count]) => `${ext}: ${count} files`)
            .join(', ');

        const { aiGenerateDocumentation } = await import('@/lib/gemini');
        const content = await aiGenerateDocumentation(
            input.type,
            project.name,
            fileSummaries,
            languageBreakdown
        );

        return { content, type: input.type, projectName: project.name };
    }),
});