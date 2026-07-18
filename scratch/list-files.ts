import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    const files = await prisma.sourceCodeEmbedding.findMany({
        where: { projectId: "cmjff8mve0000jo0umgdch5x7" },
        select: { fileName: true },
        take: 20
    });

    console.log("📂 Files in Banking Project:");
    files.forEach(f => console.log(`- ${f.fileName}`));
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
