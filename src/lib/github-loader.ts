import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { generateEmbedding, summariseCode } from './gemini';
import { Document } from "@langchain/core/documents";
import { db } from '@/server/db';
import { Octokit } from 'octokit';

/**
 * Detect the default branch of a GitHub repo (main, master, develop, etc.)
 */
async function getDefaultBranch(githubUrl: string, githubToken?: string): Promise<string> {
    try {
        const client = new Octokit({ auth: githubToken || process.env.GITHUB_TOKEN || '' });
        const cleanUrl = githubUrl.replace(/\/+$/, '').replace(/\.git$/, '');
        const parts = cleanUrl.split('/');
        const owner = parts[parts.length - 2];
        const repo = parts[parts.length - 1];
        if (!owner || !repo) return 'main';
        const { data } = await client.rest.repos.get({ owner, repo });
        return data.default_branch;
    } catch (error) {
        console.warn('⚠️ Could not detect default branch, falling back to main:', error);
        return 'main';
    }
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string, customBranch?: string) => {
    const branch = customBranch || await getDefaultBranch(githubUrl, githubToken);
    console.log(`📂 Loading repo from branch: ${branch}`);

    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || process.env.GITHUB_TOKEN || '',
        branch,
        ignoreFiles: [
            'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
            'node_modules/**', '.git/**', 'dist/**', 'build/**', '.next/**',
        ],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5,
    });

    const docs = await loader.load();
    return { docs, branch };
};

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string, customBranch?: string) => {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { deletedAt: true, branch: true },
    });
    if (!project || project.deletedAt) {
        console.log("indexGithubRepo skipped: project archived or missing");
        return;
    }

    try {
        // Update status to INDEXING
        await db.project.update({
            where: { id: projectId },
            data: { indexingStatus: 'INDEXING', indexingProgress: 0 },
        });

        const { docs, branch } = await loadGithubRepo(githubUrl, githubToken, customBranch || project.branch);
        if (!docs.length) {
            await db.project.update({
                where: { id: projectId },
                data: { indexingStatus: 'READY', totalFiles: 0, branch },
            });
            return;
        }

        // Store total files count and detected branch
        await db.project.update({
            where: { id: projectId },
            data: { totalFiles: docs.length, branch },
        });

        const embeddings = await generateEmbeddings(docs, projectId);

        await Promise.allSettled(
            embeddings.map(async (result) => {
                if (!result) return;
                try {
                    const existing = await db.sourceCodeEmbedding.findFirst({
                        where: { projectId, fileName: result.fileName },
                    });
                    if (existing) return;

                    const row = await db.sourceCodeEmbedding.create({
                        data: {
                            projectId,
                            summary: result.summary,
                            sourceCode: result.sourceCode,
                            fileName: result.fileName,
                        },
                    });

                    await db.$executeRaw`
                        UPDATE "SourceCodeEmbedding"
                        SET "summaryEmbedding" = ${result.embedding}::vector
                        WHERE "id" = ${row.id}
                    `;
                } catch (e) {
                    console.error("Indexing failed for file:", result.fileName, e);
                }
            })
        );

        // Mark as READY
        await db.project.update({
            where: { id: projectId },
            data: { indexingStatus: 'READY', indexingProgress: docs.length },
        });
        console.log("✅ indexGithubRepo completed");
    } catch (error) {
        console.error(`❌ indexGithubRepo failed for project ${projectId}:`, error);
        await db.project.update({
            where: { id: projectId },
            data: { indexingStatus: 'FAILED' },
        }).catch(() => {});
    }
};

/**
 * Process documents sequentially (batch size 1) to respect Gemini free tier rate limits.
 * Each file requires 2 API calls (summarize + embed), so with 15 RPM limit,
 * we process 1 file every ~8 seconds to stay well under the limit.
 */
const generateEmbeddings = async (docs: Document[], projectId: string) => {
    const results: Array<{
        summary: string;
        embedding: number[];
        sourceCode: string;
        fileName: string;
    } | null> = [];

    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i]!;
        try {
            console.log(`📄 Processing file ${i + 1}/${docs.length}: ${doc.metadata.source}`);

            const summary = await summariseCode(doc);
            if (!summary) {
                results.push(null);
                continue;
            }

            const embedding = await generateEmbedding(summary);
            results.push({
                summary,
                embedding,
                sourceCode: doc.pageContent,
                fileName: doc.metadata.source,
            });

            // Update progress in DB
            await db.project.update({
                where: { id: projectId },
                data: { indexingProgress: i + 1 },
            }).catch(() => {});

        } catch (error) {
            console.error(`❌ Failed to process ${doc.metadata.source}:`, error);
            results.push(null);
        }

        // Rate limit: wait 8 seconds between files (2 calls per file, 15 RPM = ~7.5s per file)
        if (i < docs.length - 1) {
            await new Promise((r) => setTimeout(r, 8000));
        }
    }

    return results.filter(Boolean) as Array<{
        summary: string;
        embedding: number[];
        sourceCode: string;
        fileName: string;
    }>;
};