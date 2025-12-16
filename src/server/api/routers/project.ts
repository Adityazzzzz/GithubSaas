import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits,octokit } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
    // 1. Create Project
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional(),
        })
    ).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.create({
            data: {
                githubUrl: input.githubUrl,
                name: input.name,
                userToProjects: {
                    create: {
                        userId: ctx.user.userId!,
                    }
                }
            }
        });
        
        // Background tasks (Non-blocking)
        indexGithubRepo(project.id, input.githubUrl, input.githubToken)
            .then(() => console.log("Creation: Indexing completed"))
            .catch((e) => console.error("Creation: Indexing failed", e));

        pollCommits(project.id)
            .then(() => console.log("Creation: Polling commits completed"))
            .catch((e) => console.error("Creation: Polling commits failed", e));
        
        return project;
    }),

    // 2. Get Projects (Active only)
    getProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: { userId: ctx.user.userId! }
                },
                deletedAt: null // Only active projects
            }
        });
    }),

    // 3. Get Commits (Safe Version)
    getCommits: protectedProcedure.input(z.object({ 
        projectId: z.string() 
    })).query(async ({ ctx, input }) => {
        return await ctx.db.commit.findMany({ 
            where: { projectId: input.projectId },
            orderBy: { commitDate: 'desc' } 
        });
    }),

    // 4. Save Answer
    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any()
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data: {
                answer: input.answer,
                filesReferences: input.filesReferences ?? null,
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId!
            }
        });
    }),

    // 5. Get Questions
    getQuestions: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.question.findMany({
            where: { projectId: input.projectId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    }),

    // 6. Upload Meeting
    uploadMeeting: protectedProcedure.input(z.object({
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
    getMeetings: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findMany({
            where: { projectId: input.projectId },
            include: { issues: true },
        });
    }),

    // 8. Delete Meeting (Safe because of Cascade)
    deleteMeeting: protectedProcedure.input(z.object({
        meetingId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.meeting.delete({
            where: { id: input.meetingId },
        });
    }),

    // 9. Get Single Meeting
    getMeetingById: protectedProcedure.input(z.object({
        meetingId: z.string()
    })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findUnique({
            where: { id: input.meetingId },
            include: { issues: true },
        });
    }),

    // 10. Archive Project (Soft Delete)
    archiveProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({
            where: { id: input.projectId },
            data: { 
                deletedAt: new Date(),
                status: "ARCHIVED" 
            },
        });
    }),

    // 11. Restore Project
    restoreProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
        })
        if (!project) throw new Error("Project not found")

        await ctx.db.project.update({
            where: { id: input.projectId },
            data: { 
                deletedAt: null,
                status: "ACTIVE" 
            }
        })
        pollCommits(input.projectId).catch(console.error)
        indexGithubRepo(input.projectId, project.githubUrl).catch(console.error)

        return { restored: true }
    }),

    // 12. PERMANENT DELETE (Hard Delete)
    // 👇 This was missing in your code!
    deleteProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.delete({
            where: { id: input.projectId },
        });
    }),

    // 13. Get Archived Projects (Fixed Security)
    getArchivedProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                deletedAt: { not: null },
                // 👇 Added security: Only fetch THIS user's projects
                userToProjects: { 
                    some: { userId: ctx.user.userId! } 
                }
            },
            orderBy: { deletedAt: 'desc' },
        });
    }),

    // 14. Get Team Members
    getTeamMembers: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.userToProject.findMany({
            where: { projectId: input.projectId },
            include: { user: true },
        });
    }),

    getMyRepoStats: protectedProcedure.query(async () => {
      const OWNER = "Adityazzzzz";   
      const REPO = "GithubSaas"; 

        try {
            const { data } = await octokit.rest.repos.get({
                owner: OWNER,
                repo: REPO,
            });
            return {
                stars: data.stargazers_count,
                forks: data.forks_count,
                url: data.html_url
            };
        } catch (error) {
            console.error("Failed to fetch global stats:", error);
            return null;
        }
    }),
});