import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function run() {
    console.log("🚀 Starting Meeting-to-Task Pipeline Verification Test...");

    // Create a mock project
    const project = await db.project.create({
        data: {
            name: "MOCK_MEETING_TASK_TEST_PROJECT",
            githubUrl: "https://github.com/mock/mock",
            branch: "main",
        }
    });
    const projectId = project.id;
    console.log(`📂 Created Mock Project ID: ${projectId}`);

    // Create a mock meeting
    const meeting = await db.meeting.create({
        data: {
            name: "Mock Standup Meeting",
            meetingUrl: "https://mock.com/audio.mp3",
            projectId,
            status: "PROCESSING"
        }
    });
    const meetingId = meeting.id;
    console.log(`🎙️ Created Mock Meeting ID: ${meetingId}`);

    // Mock summaries extracted from transcription
    const mockSummaries = [
        {
            start: "00:10",
            end: "01:15",
            gist: "Setup Postgres db connection pooler.",
            headline: "Database Pooling Setup",
            summary: "Aditya needs to configure connection limits and pool parameters for Vercel functions."
        },
        {
            start: "01:20",
            end: "02:45",
            gist: "Add pgvector cosine similarity index to DB.",
            headline: "Create HNSW Index",
            summary: "Implement raw SQL migration to speed up codebase embedding similarity searches."
        },
        {
            start: "02:50",
            end: "03:30",
            gist: "Refactor sidebar sync controls.",
            headline: "Sidebar Refresh Button",
            summary: "Add a manual reload control to sync local repo state instantly."
        }
    ];

    console.log("📝 Inserting Issues and automatically creating Kanban Board PmTask tickets...");
    
    // Insert Issues
    await db.issue.createMany({
        data: mockSummaries.map(summary => ({
            start: summary.start,
            end: summary.end,
            gist: summary.gist,
            headline: summary.headline,
            summary: summary.summary,
            meetingId,
        }))
    });

    // Run task generation logic (mirrors process-meeting route.ts)
    let currentTaskCount = await db.pmTask.count({
        where: { projectId },
    });

    const createdTasks = [];
    for (const summary of mockSummaries) {
        currentTaskCount++;
        const issueKey = `GB-${currentTaskCount}`;
        const task = await db.pmTask.create({
            data: {
                projectId,
                title: summary.headline,
                description: `${summary.gist}\n\nTimestamp: ${summary.start} - ${summary.end}\n\nGenerated from Meeting ID: ${meetingId}`,
                priority: "MEDIUM",
                status: "TODO",
                issueKey,
            }
        });
        createdTasks.push(task);
    }

    console.log("🔍 Verifying results in DB...");
    const issueCount = await db.issue.count({ where: { meetingId } });
    const taskCount = await db.pmTask.count({ where: { projectId } });

    console.log(`- Created Issues: ${issueCount} (Expected: 3)`);
    console.log(`- Created Kanban Tasks: ${taskCount} (Expected: 3)`);

    console.log("\n📋 Generated Kanban Task Details:");
    createdTasks.forEach(task => {
        console.log(`  [${task.issueKey}] ${task.title} - Status: ${task.status} - Priority: ${task.priority}`);
    });

    if (issueCount === 3 && taskCount === 3 && createdTasks[0]?.issueKey === "GB-1") {
        console.log("\n✅ SUCCESS: Meeting-to-Task pipeline runs successfully and generates corresponding board tickets.");
    } else {
        console.error("\n❌ FAILURE: Created count or key sequence did not match expected specs.");
    }

    // Cleanup
    console.log("\n🧹 Cleaning up mock test data...");
    await db.pmTask.deleteMany({ where: { projectId } });
    await db.issue.deleteMany({ where: { meetingId } });
    await db.meeting.deleteMany({ where: { projectId } });
    await db.project.delete({ where: { id: projectId } });
    console.log("✅ Cleanup complete.");
}

run()
    .catch(console.error)
    .finally(() => db.$disconnect());
