import { z } from "zod";
import { createTRPCRouter, protectedProcedure, projectProcedure } from "../trpc";
import { getPullRequests, octokit } from "@/lib/github";

export const pmRouter = createTRPCRouter({
  // ─── Sprints ───────────────────────────────────────────────────────────────
  getSprints: projectProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.sprint.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
      });
    }),

  createSprint: projectProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.sprint.create({
        data: {
          projectId: input.projectId,
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          status: "UPCOMING",
        },
      });
    }),

  updateSprintStatus: protectedProcedure
    .input(
      z.object({
        sprintId: z.string(),
        status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sprint = await ctx.db.sprint.findUnique({
        where: { id: input.sprintId },
      });

      if (!sprint) throw new Error("Sprint not found");

      if (input.status === "ACTIVE") {
        // Deactivate any currently active sprint in the same project
        await ctx.db.sprint.updateMany({
          where: { projectId: sprint.projectId, status: "ACTIVE" },
          data: { status: "COMPLETED" },
        });
      }

      const updatedSprint = await ctx.db.sprint.update({
        where: { id: input.sprintId },
        data: { status: input.status },
      });

      // If sprint is completed, move all incomplete tasks to backlog
      if (input.status === "COMPLETED") {
        await ctx.db.pmTask.updateMany({
          where: {
            sprintId: input.sprintId,
            NOT: { status: "DONE" },
          },
          data: {
            sprintId: null,
            status: "BACKLOG",
          },
        });
      }

      return updatedSprint;
    }),

  // ─── Sub-Teams ─────────────────────────────────────────────────────────────
  getSubTeams: projectProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.subTeam.findMany({
        where: { projectId: input.projectId },
        orderBy: { name: "asc" },
      });
    }),

  createSubTeam: projectProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.subTeam.create({
        data: {
          projectId: input.projectId,
          name: input.name,
        },
      });
    }),

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  getTasks: projectProcedure
    .input(
      z.object({
        projectId: z.string(),
        sprintId: z.string().nullable().optional(),
        subTeamId: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause: any = { projectId: input.projectId };

      if (input.sprintId !== undefined) {
        whereClause.sprintId = input.sprintId;
      }
      if (input.subTeamId !== undefined) {
        whereClause.subTeamId = input.subTeamId;
      }

      return await ctx.db.pmTask.findMany({
        where: whereClause,
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              emailAddress: true,
            },
          },
          subTeam: true,
          sprint: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  createTask: projectProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        sprintId: z.string().nullable().optional(),
        subTeamId: z.string().nullable().optional(),
        assigneeId: z.string().nullable().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const taskCount = await ctx.db.pmTask.count({
        where: { projectId: input.projectId },
      });
      const issueKey = `GB-${taskCount + 1}`;

      return await ctx.db.pmTask.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: input.status ?? (input.sprintId ? "TODO" : "BACKLOG"),
          issueKey,
          sprintId: input.sprintId || null,
          subTeamId: input.subTeamId || null,
          assigneeId: input.assigneeId || null,
        },
        include: {
          assignee: true,
          subTeam: true,
          sprint: true,
        },
      });
    }),

  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.pmTask.update({
        where: { id: input.taskId },
        data: { status: input.status },
      });
    }),

  updateTaskDetails: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        title: z.string().min(1),
        description: z.string().nullable().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        sprintId: z.string().nullable().optional(),
        subTeamId: z.string().nullable().optional(),
        assigneeId: z.string().nullable().optional(),
        dueDate: z.coerce.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.pmTask.update({
        where: { id: input.taskId },
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority,
          sprintId: input.sprintId || null,
          subTeamId: input.subTeamId || null,
          assigneeId: input.assigneeId || null,
          dueDate: input.dueDate || null,
        },
        include: {
          assignee: true,
          subTeam: true,
          sprint: true,
        },
      });
    }),

  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.pmTask.delete({
        where: { id: input.taskId },
      });
    }),

  // ─── Comments ──────────────────────────────────────────────────────────────
  getComments: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.pmComment.findMany({
        where: { taskId: input.taskId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.pmComment.create({
        data: {
          taskId: input.taskId,
          text: input.text,
          userId: ctx.user.userId,
        },
        include: {
          user: true,
        },
      });
    }),

  // ─── Automations ───────────────────────────────────────────────────────────
  getAutomations: projectProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.automationRule.findMany({
        where: { projectId: input.projectId },
      });
    }),

  createAutomationRule: projectProcedure
    .input(
      z.object({
        projectId: z.string(),
        trigger: z.string(),
        action: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.automationRule.findFirst({
        where: {
          projectId: input.projectId,
          trigger: input.trigger,
        },
      });

      if (existing) {
        return await ctx.db.automationRule.update({
          where: { id: existing.id },
          data: { action: input.action, isActive: true },
        });
      }

      return await ctx.db.automationRule.create({
        data: {
          projectId: input.projectId,
          trigger: input.trigger,
          action: input.action,
          isActive: true,
        },
      });
    }),

  toggleAutomationRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.automationRule.update({
        where: { id: input.ruleId },
        data: { isActive: input.isActive },
      });
    }),

  // ─── Project Members ────────────────────────────────────────────────────────
  getMembers: projectProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const projectMembers = await ctx.db.userToProject.findMany({
        where: { projectId: input.projectId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              emailAddress: true,
            },
          },
        },
      });
      return projectMembers.map((m) => m.user);
    }),

  // ─── Analytics ─────────────────────────────────────────────────────────────
  getAnalytics: projectProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const activeSprint = await ctx.db.sprint.findFirst({
        where: { projectId: input.projectId, status: "ACTIVE" },
      });

      let burndownData: Array<{ day: string; actual: number; ideal: number }> = [];

      if (activeSprint) {
        const start = new Date(activeSprint.startDate);
        const end = new Date(activeSprint.endDate);
        const totalTasks = await ctx.db.pmTask.count({
          where: { projectId: input.projectId, sprintId: activeSprint.id },
        });
        const completedTasks = await ctx.db.pmTask.findMany({
          where: {
            projectId: input.projectId,
            sprintId: activeSprint.id,
            status: "DONE",
          },
          orderBy: { updatedAt: "asc" },
        });

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        for (let i = 0; i <= totalDays; i++) {
          const currentDay = new Date(start);
          currentDay.setDate(start.getDate() + i);

          const dayStr = currentDay.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });

          const ideal = Math.max(0, totalTasks - (totalTasks / totalDays) * i);
          const completedBeforeDay = completedTasks.filter(
            (t) => t.updatedAt <= currentDay
          ).length;
          const actual = totalTasks - completedBeforeDay;

          const isFuture = currentDay > new Date();
          burndownData.push({
            day: dayStr,
            ideal: Math.round(ideal * 10) / 10,
            actual: isFuture ? (null as any) : actual,
          });
        }
      }

      // Tasks by Sub-Team
      const subTeams = await ctx.db.subTeam.findMany({
        where: { projectId: input.projectId },
        include: {
          tasks: {
            select: { status: true },
          },
        },
      });

      const teamDistribution = subTeams.map((team) => ({
        name: team.name,
        total: team.tasks.length,
        completed: team.tasks.filter((t) => t.status === "DONE").length,
      }));

      // Tasks by Priority
      const tasks = await ctx.db.pmTask.findMany({
        where: { projectId: input.projectId },
        select: { priority: true },
      });
      const priorityDistribution = {
        LOW: tasks.filter((t) => t.priority === "LOW").length,
        MEDIUM: tasks.filter((t) => t.priority === "MEDIUM").length,
        HIGH: tasks.filter((t) => t.priority === "HIGH").length,
        URGENT: tasks.filter((t) => t.priority === "URGENT").length,
      };

      // Velocity
      const completedSprints = await ctx.db.sprint.findMany({
        where: { projectId: input.projectId, status: "COMPLETED" },
        include: {
          tasks: {
            select: { status: true },
          },
        },
        orderBy: { endDate: "asc" },
        take: 5,
      });

      const velocityData = completedSprints.map((s) => ({
        name: s.name,
        completed: s.tasks.filter((t) => t.status === "DONE").length,
        total: s.tasks.length,
      }));

      return {
        burndown: burndownData,
        teamDistribution,
        priorityDistribution,
        velocity: velocityData,
      };
    }),

  // ─── Commit & PR Automation Sync ──────────────────────────────────────────
  syncCommitsAndPRs: projectProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });

      if (!project) throw new Error("Project not found");

      const rules = await ctx.db.automationRule.findMany({
        where: { projectId: input.projectId, isActive: true },
      });

      if (rules.length === 0) {
        return { success: true, message: "No active automation rules found." };
      }

      let commitsChecked = 0;
      let prsChecked = 0;
      let tasksUpdated = 0;

      // 1. Process COMMIT_PUSHED rules
      const commitRule = rules.find((r) => r.trigger === "COMMIT_PUSHED");
      if (commitRule) {
        const dbCommits = await ctx.db.commit.findMany({
          where: { projectId: input.projectId },
          orderBy: { commitDate: "desc" },
          take: 50,
        });

        commitsChecked = dbCommits.length;

        for (const commit of dbCommits) {
          const matches = commit.commitMessage.match(/#?GB-\d+/gi);
          if (matches) {
            for (const match of matches) {
              const issueKey = match.replace("#", "").toUpperCase();
              const task = await ctx.db.pmTask.findFirst({
                where: { projectId: input.projectId, issueKey },
              });

              if (task && task.status !== commitRule.action) {
                await ctx.db.pmTask.update({
                  where: { id: task.id },
                  data: { status: commitRule.action },
                });
                tasksUpdated++;
              }
            }
          }
        }
      }

      // 2. Process PR_MERGED rules
      const prRule = rules.find((r) => r.trigger === "PR_MERGED");
      if (prRule) {
        try {
          const ownerRepo = project.githubUrl
            .replace("https://github.com/", "")
            .replace(".git", "");
          const [owner, repo] = ownerRepo.split("/");
          
          if (owner && repo) {
            const response = await octokit.rest.pulls.list({
              owner,
              repo,
              state: "all",
              sort: "updated",
              direction: "desc",
              per_page: 20,
            });

            const recentPrs = response.data;
            prsChecked = recentPrs.length;

            for (const pr of recentPrs) {
              const isMerged = pr.merged_at !== null;
              const isClosed = pr.state === "closed";
              const titleAndBody = `${pr.title} ${pr.body ?? ""}`;
              const matches = titleAndBody.match(/#?GB-\d+/gi);

              if (matches) {
                for (const match of matches) {
                  const issueKey = match.replace("#", "").toUpperCase();
                  const task = await ctx.db.pmTask.findFirst({
                    where: { projectId: input.projectId, issueKey },
                  });

                  if (task) {
                    if (isMerged && prRule.action === "DONE" && task.status !== "DONE") {
                      await ctx.db.pmTask.update({
                        where: { id: task.id },
                        data: { status: "DONE" },
                      });
                      tasksUpdated++;
                    } else if (!isClosed && task.status === "TODO") {
                      await ctx.db.pmTask.update({
                        where: { id: task.id },
                        data: { status: "REVIEW" },
                      });
                      tasksUpdated++;
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("PR sync automation error:", err);
        }
      }

      return {
        success: true,
        commitsChecked,
        prsChecked,
        tasksUpdated,
        message: `Synced. Checked ${commitsChecked} commits, ${prsChecked} PRs. Updated ${tasksUpdated} tasks.`,
      };
    }),
});
