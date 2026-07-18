import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateRandomVector(dimensions: number): number[] {
    const vector = [];
    let sum = 0;
    for (let i = 0; i < dimensions; i++) {
        const val = Math.random();
        vector.push(val);
        sum += val * val;
    }
    const norm = Math.sqrt(sum);
    return vector.map(v => v / norm); // Normalize vector for cosine distance
}

async function run() {
    console.log("🚀 Starting Latency Verification Test...");
    
    // Find or create a mock project
    let project = await prisma.project.findFirst({
        where: { name: "MOCK_LATENCY_TEST_PROJECT" }
    });
    if (!project) {
        project = await prisma.project.create({
            data: {
                name: "MOCK_LATENCY_TEST_PROJECT",
                githubUrl: "https://github.com/mock/mock",
                branch: "main",
            }
        });
    }
    const projectId = project.id;
    console.log(`📂 Using Project ID: ${projectId}`);

    // Seed 50 mock embeddings (fewer rows to speed up remote DB network roundtrips)
    console.log("🌱 Seeding 50 mock source code embeddings...");
    const seedCount = 50;
    const vectors = Array.from({ length: seedCount }, () => generateRandomVector(768));
    
    await prisma.sourceCodeEmbedding.deleteMany({
        where: { projectId }
    });

    const ids: string[] = [];
    for (let i = 0; i < seedCount; i++) {
        const row = await prisma.sourceCodeEmbedding.create({
            data: {
                projectId,
                fileName: `src/components/MockFile_${i}.tsx`,
                summary: `Mock summary for file number ${i}`,
                sourceCode: `// Mock source code for file ${i}\nconsole.log("Mock file content");`,
            }
        });
        
        const vecStr = `[${vectors[i]!.join(',')}]`;
        await prisma.$executeRawUnsafe(
            `UPDATE "SourceCodeEmbedding" SET "summaryEmbedding" = '${vecStr}'::vector WHERE "id" = '${row.id}'`
        );
        ids.push(row.id);
    }
    console.log("✅ Seed complete.");

    // Run Latency without HNSW index first
    console.log("\n⚡ Running 30 RAG vector search queries WITHOUT HNSW index...");
    const queryTimes: number[] = [];
    for (let q = 0; q < 30; q++) {
        const qVec = generateRandomVector(768);
        const qVecStr = `[${qVec.join(',')}]`;
        
        const start = performance.now();
        await prisma.$queryRawUnsafe(`
            SELECT "id", "fileName", "summary",
                   1 - ("summaryEmbedding" <=> '${qVecStr}'::vector) AS similarity
            FROM "SourceCodeEmbedding"
            WHERE "projectId" = '${projectId}' AND 1 - ("summaryEmbedding" <=> '${qVecStr}'::vector) > 0.1
            ORDER BY similarity DESC
            LIMIT 5
        `);
        const end = performance.now();
        queryTimes.push(end - start);
    }

    const avgTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
    const sortedTimes = [...queryTimes].sort((a, b) => a - b);
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)]!;
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)]!;
    const min = sortedTimes[0]!;
    const max = sortedTimes[sortedTimes.length - 1]!;

    console.log(`📊 LATENCY RESULTS (NO INDEX):`);
    console.log(`- Average Latency: ${avgTime.toFixed(2)} ms`);
    console.log(`- Min Latency: ${min.toFixed(2)} ms`);
    console.log(`- Max Latency: ${max.toFixed(2)} ms`);
    console.log(`- p95 Latency: ${p95.toFixed(2)} ms`);
    console.log(`- p99 Latency: ${p99.toFixed(2)} ms`);

    // Let's create the HNSW index!
    console.log("\n🛠️ Creating pgvector HNSW index on SourceCodeEmbedding...");
    try {
        await prisma.$executeRawUnsafe(
            `CREATE INDEX IF NOT EXISTS "source_code_embedding_hnsw_idx" ON "SourceCodeEmbedding" USING hnsw ("summaryEmbedding" vector_cosine_ops);`
        );
        console.log("✅ HNSW index created successfully.");
        
        // Run Latency WITH HNSW index
        console.log("\n⚡ Running 30 RAG vector search queries WITH HNSW index...");
        const queryTimesIndex: number[] = [];
        for (let q = 0; q < 30; q++) {
            const qVec = generateRandomVector(768);
            const qVecStr = `[${qVec.join(',')}]`;
            
            const start = performance.now();
            await prisma.$queryRawUnsafe(`
                SELECT "id", "fileName", "summary",
                       1 - ("summaryEmbedding" <=> '${qVecStr}'::vector) AS similarity
                FROM "SourceCodeEmbedding"
                WHERE "projectId" = '${projectId}' AND 1 - ("summaryEmbedding" <=> '${qVecStr}'::vector) > 0.1
                ORDER BY similarity DESC
                LIMIT 5
            `);
            const end = performance.now();
            queryTimesIndex.push(end - start);
        }

        const avgTimeIdx = queryTimesIndex.reduce((a, b) => a + b, 0) / queryTimesIndex.length;
        const sortedTimesIdx = [...queryTimesIndex].sort((a, b) => a - b);
        const p95Idx = sortedTimesIdx[Math.floor(sortedTimesIdx.length * 0.95)]!;
        const p99Idx = sortedTimesIdx[Math.floor(sortedTimesIdx.length * 0.99)]!;

        console.log(`📊 LATENCY RESULTS (WITH HNSW INDEX):`);
        console.log(`- Average Latency: ${avgTimeIdx.toFixed(2)} ms`);
        console.log(`- p95 Latency: ${p95Idx.toFixed(2)} ms`);
        console.log(`- p99 Latency: ${p99Idx.toFixed(2)} ms`);
        
    } catch (err: any) {
        console.warn("⚠️ HNSW index could not be created. Either pgvector version <0.5.0 or raw creation failed:", err.message);
    }

    // Cleanup
    console.log("\n🧹 Cleaning up mock test data...");
    await prisma.sourceCodeEmbedding.deleteMany({
        where: { projectId }
    });
    await prisma.project.delete({
        where: { id: projectId }
    });
    console.log("✅ Cleanup complete.");
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
