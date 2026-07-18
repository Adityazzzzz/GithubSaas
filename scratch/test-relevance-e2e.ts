import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    envLines.forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key!] = value;
        }
    });
}

import { generateEmbedding } from '../src/lib/gemini';

const prisma = new PrismaClient();

const mockFiles = [
    {
        fileName: "src/lib/auth.ts",
        summary: "Handles user authentication, session verification, and token signing using JWT.",
        sourceCode: "export const verifyToken = (token: string) => { /* JWT logic */ }"
    },
    {
        fileName: "src/components/Sidebar.tsx",
        summary: "Displays navigation links, user profiles, and active project workspace switchers.",
        sourceCode: "export const Sidebar = () => { return <aside>Sidebar</aside> }"
    },
    {
        fileName: "src/server/db.ts",
        summary: "Initializes the Prisma database client connection and pools instances.",
        sourceCode: "import { PrismaClient } from '@prisma/client';"
    },
    {
        fileName: "src/app/api/webhook/razorpay/route.ts",
        summary: "Listens to Razorpay payment callbacks to credit users with transaction tokens.",
        sourceCode: "export const POST = async (req: Request) => { /* webhook logic */ }"
    },
    {
        fileName: "src/hooks/useProject.ts",
        summary: "Custom React hook that resolves the current active project name and CUID slug.",
        sourceCode: "export const useProject = () => { /* hook logic */ }"
    }
];

const evalQueries = [
    {
        query: "Where do we verify user session tokens and signing?",
        expected: "src/lib/auth.ts"
    },
    {
        query: "Find the component that renders navigation and slug switchers",
        expected: "src/components/Sidebar.tsx"
    },
    {
        query: "Where is the database client connection initialized?",
        expected: "src/server/db.ts"
    },
    {
        query: "Where do we handle payment webhooks from Razorpay?",
        expected: "src/app/api/webhook/razorpay/route.ts"
    },
    {
        query: "Find the custom hook that resolves project name slugs",
        expected: "src/hooks/useProject.ts"
    }
];

async function run() {
    console.log("🚀 Starting End-to-End RAG Retrieval Relevance Test...");

    // Create mock project
    const project = await prisma.project.create({
        data: {
            name: "MOCK_RELEVANCE_E2E_PROJECT",
            githubUrl: "https://github.com/mock/mock",
            branch: "main",
        }
    });
    const projectId = project.id;
    console.log(`📂 Created Mock Project ID: ${projectId}`);

    // Seed mock files and generate embeddings using the ACTIVE gemini-embedding-001 model
    console.log("\n🌱 Seeding database files and calling Gemini to generate vector embeddings...");
    for (const file of mockFiles) {
        console.log(`  - Generating embedding for: ${file.fileName}...`);
        const embedding = await generateEmbedding(file.summary);
        const vecStr = `[${embedding.join(',')}]`;

        const row = await prisma.sourceCodeEmbedding.create({
            data: {
                projectId,
                fileName: file.fileName,
                summary: file.summary,
                sourceCode: file.sourceCode,
            }
        });

        await prisma.$executeRawUnsafe(
            `UPDATE "SourceCodeEmbedding" SET "summaryEmbedding" = '${vecStr}'::vector WHERE "id" = '${row.id}'`
        );
        
        // Brief delay to avoid API rate limit
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log("✅ Seed complete.");

    // Run evaluation queries
    console.log("\n🔍 Running RAG relevance queries...");
    let hits = 0;
    
    for (let i = 0; i < evalQueries.length; i++) {
        const item = evalQueries[i]!;
        console.log(`\nQuery ${i + 1}/${evalQueries.length}: "${item.query}"`);
        console.log(`🎯 Expected file: ${item.expected}`);

        const queryEmbedding = await generateEmbedding(item.query);
        const qVecStr = `[${queryEmbedding.join(',')}]`;

        const matches: any = await prisma.$queryRawUnsafe(`
            SELECT "fileName",
                   1 - ("summaryEmbedding" <=> '${qVecStr}'::vector) AS similarity
            FROM "SourceCodeEmbedding"
            WHERE "projectId" = '${projectId}' AND 1 - ("summaryEmbedding" <=> '${qVecStr}'::vector) > 0.1
            ORDER BY similarity DESC
            LIMIT 3
        `);

        console.log("📊 Matches:");
        let found = false;
        matches.forEach((m: any, idx: number) => {
            const isMatch = m.fileName === item.expected;
            if (isMatch) found = true;
            console.log(`  ${idx + 1}. ${m.fileName} (Similarity: ${(m.similarity * 100).toFixed(1)}%)${isMatch ? " ⭐ MATCH" : ""}`);
        });

        if (found) hits++;
        
        await new Promise(r => setTimeout(r, 1000));
    }

    const accuracy = (hits / evalQueries.length) * 100;
    console.log(`\n📈 MEASURED ACCURACY: ${accuracy.toFixed(1)}% (${hits}/${evalQueries.length} successful matches in top-3 context)`);

    // Cleanup
    console.log("\n🧹 Cleaning up mock test data...");
    await prisma.sourceCodeEmbedding.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });
    console.log("✅ Cleanup complete.");
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
