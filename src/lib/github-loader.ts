import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { generateEmbedding, summariseCode } from './gemini';
import { Document } from "@langchain/core/documents";
import { db } from '@/server/db';

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || process.env.GITHUB_TOKEN || '',
        branch: 'main',
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5,
    });

    const docs = await loader.load()
    return docs
}

// export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
//     const docs = await loadGithubRepo(githubUrl, githubToken)
//     const allEmbeddings = await generateEmbeddings(docs)
//     await Promise.allSettled(allEmbeddings.map(async(embedding,index)=>{
//         console.log(`processing ${index} of ${allEmbeddings.length}`)
//         if(!embedding) return

//         const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
//             data:{
//                 summary:embedding.summary,
//                 summaryEmbedding: embedding,
//                 sourceCode:embedding.sourceCode,
//                 fileName:embedding.fileName,
//                 projectId
//             }
//         })
//         await db.$executeRaw`
//             UPDATE "SourceCodeEmbedding"
//             SET "summaryEmbedding" = ${embedding.embedding}::vector
//             WHERE "id" = ${sourceCodeEmbedding.id}
//         `
//     }))
// }

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { deletedAt: true },
    })  
    if (!project || project.deletedAt) {
        console.log("indexGithubRepo skipped: project archived or missing")
        return
    }
    try{
        const docs = await loadGithubRepo(githubUrl, githubToken)
        if (!docs.length) return

        const embeddings = await generateEmbeddings(docs)

        await Promise.allSettled(
            embeddings.map(async (result, index) => {
                if (!result) return
                try {
                    const existing = await db.sourceCodeEmbedding.findFirst({
                        where: {
                            projectId,
                            fileName: result.fileName,
                        },
                    })
                    if (existing) return 
                    const row = await db.sourceCodeEmbedding.create({
                        data: {
                            projectId,
                            summary: result.summary,
                            sourceCode: result.sourceCode,
                            fileName: result.fileName,
                        },
                    })
                    await db.$executeRaw`
                        UPDATE "SourceCodeEmbedding"
                        SET "summaryEmbedding" = ${result.embedding}::vector
                        WHERE "id" = ${row.id}
                    `
                } 
                catch (e) {
                    console.error("Indexing failed for file:", result.fileName, e)
                }
            })
        )
        console.log("indexGithubRepo completed")
    } 
    catch(error){
        console.error(`indexGithubRepo failed for project ${projectId}:`, error)
    }
}

const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
        const summary = await summariseCode(doc)
        const embedding = await generateEmbedding(summary)
        return{
            summary,
            embedding,
            sourceCode: doc.pageContent,
            fileName:doc.metadata.source,
        }
    }))
}