import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    const projects = await prisma.project.findMany({
        include: {
            _count: {
                select: { sourceCodeEmbeddings: true, commits: true }
            }
        }
    });

    console.log("📊 Database Projects Status:");
    projects.forEach(p => {
        console.log(`- Project: ${p.name} (ID: ${p.id})`);
        console.log(`  - Branch: ${p.branch}`);
        console.log(`  - Index Status: ${p.indexingStatus}`);
        console.log(`  - Indexed Files: ${p._count.sourceCodeEmbeddings}`);
        console.log(`  - Commits: ${p._count.commits}`);
    });
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
