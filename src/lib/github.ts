import { db } from '@/server/db';
import {Octokit} from 'octokit'
import axios from 'axios'
import { aiSummariseCommit } from './gemini';

export const octokit = new Octokit({
    auth : process.env.GITHUB_TOKEN
})

const githubUrl = 'https://github.com/docker/genai-stack'

type Response={
    commitHash:string;
    commitMessage:string;
    commitAuthorName:string;
    commitAuthorAvatar:string;
    commitDate:string;
}

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
    const client = githubToken ? new Octokit({ auth: githubToken }) : octokit;

    const parts = githubUrl.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];

    if (!owner || !repo) {
        return 0;
    }

    try {
        const { data: repoData } = await client.rest.repos.get({
            owner,
            repo,
        });
        const defaultBranch = repoData.default_branch;
        const { data: treeData } = await client.rest.git.getTree({
            owner,
            repo,
            tree_sha: defaultBranch,
            recursive: 'true',
        });
        const fileCount = treeData.tree.filter(item => item.type === 'blob').length;
        return fileCount;
    } 
    catch (error) {
        console.error("Error fetching file count:", error);
        return 0;
    }
}

export const getCommitHashes = async (githubUrl:string):Promise<Response[]>=>{
    const cleanUrl = githubUrl.replace(/\/$/, ""); 
    const [owner, repo] = cleanUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error("Invalid github url");
    }

    const {data} = await octokit.rest.repos.listCommits({
        owner,
        repo,
    })
    const sortedCommits = data.sort((a:any,b:any)=>new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[]

    return sortedCommits.slice(0,10).map((commit:any)=>({
        commitHash:commit.sha as string,
        commitMessage:commit.commit.message?? "",
        commitAuthorName:commit.commit?.author?.name ?? "",
        commitAuthorAvatar:commit?.author?.avatar_url?? "",
        commitDate:commit.commit?.author.date?? "",
    }))
}

export const pollCommits = async (projectId: string) => {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { deletedAt: true, githubUrl: true },
    })
    if (!project || project.deletedAt) {
        return
    }
    try {
        const commitHashes = await getCommitHashes(project.githubUrl)
        if (!commitHashes.length) return

        const unprocessedCommits = await filterUnprocessedCommits(
            projectId,
            commitHashes
        )
        if (!unprocessedCommits.length) return

        const summaryResponses = await Promise.allSettled(
            unprocessedCommits.map(commit =>
                summarizeCommit(project.githubUrl, commit.commitHash)
            )
        )
        
        const commitData = summaryResponses.map((res, index) => {
            if (res.status !== "fulfilled") return null
            const commit = unprocessedCommits[index]
            if (!commit) return null
            
            return {
                projectId,
                commitHash: commit.commitHash,
                commitMessage: commit.commitMessage,
                commitAuthorName: commit.commitAuthorName,
                commitAuthorAvatar: commit.commitAuthorAvatar,
                commitDate: commit.commitDate,
                summary: res.value,
            }
        }).filter((item): item is NonNullable<typeof item> => item !== null)

        if (!commitData.length) return
        
        await db.commit.createMany({
            data: commitData,
            skipDuplicates: true, 
        })

        console.log(`pollCommits: inserted ${commitData.length} commits`)
    } 
    catch (error) {
        console.error(`pollCommits failed for project ${projectId}:`, error)
    }
}

async function summarizeCommit(githubUrl: string, commitHash: string) {
    const targetUrl = githubUrl.endsWith('.git') 
        ? githubUrl.slice(0, -4) 
        : githubUrl;

    console.log(`📝 Summarizing commit ${commitHash} from ${targetUrl}`);

    try {
        const { data } = await axios.get(`${targetUrl}/commit/${commitHash}.diff`, {
            headers: {
                Accept: 'application/vnd.github.v3.diff',
                Authorization: `token ${process.env.GITHUB_TOKEN}`, 
            },
        });

        return await aiSummariseCommit(data) || "";
    } 
    catch (error) {
        console.error(`❌ Failed to fetch diff for ${commitHash}:`, error);
        return "";
    }
}


async function fetchProjectGithubUrl(projectId:string) {
    const project = await db.project.findUnique({
        where:{
            id:projectId,
        },
        select:{
            githubUrl:true,
        }
    })
    if(!project?.githubUrl){
        throw new Error('There is not github Url')
    }
    return {project,githubUrl:project?.githubUrl}
}

async function filterUnprocessedCommits(projectId:string,commitHashes:Response[]): Promise<Response[]>{
    const processedCommits = await db.commit.findMany({ 
        where: {
            projectId: projectId,
        },
        select: {
            commitHash: true,
        }
    });
    const unprocessedCommits = commitHashes.filter((commit) => 
        !processedCommits.some((processedCommit) => 
            processedCommit.commitHash === commit.commitHash
        )
    );
    return unprocessedCommits;
}
