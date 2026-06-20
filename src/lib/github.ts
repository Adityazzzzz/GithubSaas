import { db } from '@/server/db';
import { Octokit } from 'octokit';
import axios from 'axios';
import { aiSummariseCommit } from './gemini';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

type CommitResponse = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
};

interface CommitData {
    projectId: string;
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
    summary: string;
}

export const checkCredits = async (githubUrl: string, githubToken?: string, branch?: string) => {
    const client = githubToken ? new Octokit({ auth: githubToken }) : octokit;
    const cleanUrl = githubUrl.replace(/\/+$/, '').replace(/\.git$/, '');
    const parts = cleanUrl.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];

    if (!owner || !repo) return 0;

    try {
        let treeSha = branch;
        if (!treeSha) {
            const { data: repoData } = await client.rest.repos.get({ owner, repo });
            treeSha = repoData.default_branch;
        }
        const { data: treeData } = await client.rest.git.getTree({
            owner,
            repo,
            tree_sha: treeSha,
            recursive: 'true',
        });
        return treeData.tree.filter((item) => item.type === 'blob').length;
    } catch (error) {
        console.error('Error fetching file count:', error);
        return 0;
    }
};

export const getCommitHashes = async (githubUrl: string, branch?: string, githubToken?: string): Promise<CommitResponse[]> => {
    const cleanUrl = githubUrl.replace(/\/+$/, '').replace(/\.git$/, '');
    const [owner, repo] = cleanUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid github url');
    }

    const client = githubToken ? new Octokit({ auth: githubToken }) : octokit;
    const { data } = await client.rest.repos.listCommits({ 
        owner, 
        repo,
        sha: branch,
    });

    const sortedCommits = data.sort(
        (a, b) =>
            new Date(b.commit.author?.date ?? 0).getTime() -
            new Date(a.commit.author?.date ?? 0).getTime()
    );

    return sortedCommits.slice(0, 10).map((commit) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? '',
        commitAuthorName: commit.commit?.author?.name ?? '',
        commitAuthorAvatar: commit?.author?.avatar_url ?? '',
        commitDate: commit.commit?.author?.date ?? '',
    }));
};

export const pollCommits = async (projectId: string, githubToken?: string) => {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { deletedAt: true, githubUrl: true, branch: true },
    });
    if (!project || project.deletedAt) return;

    try {
        const commitHashes = await getCommitHashes(project.githubUrl, project.branch, githubToken);
        const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);
        if (!unprocessedCommits.length) return;

        const commitData: CommitData[] = [];

        // Process commits one at a time to respect Gemini rate limits
        for (let i = 0; i < unprocessedCommits.length; i++) {
            const commit = unprocessedCommits[i]!;
            try {
                const summary = await summarizeCommit(project.githubUrl, commit.commitHash);
                if (summary) {
                    commitData.push({
                        projectId,
                        commitHash: commit.commitHash,
                        commitMessage: commit.commitMessage,
                        commitAuthorName: commit.commitAuthorName,
                        commitAuthorAvatar: commit.commitAuthorAvatar,
                        commitDate: commit.commitDate,
                        summary,
                    });
                }
            } catch (error) {
                console.error(`Failed to summarize commit ${commit.commitHash}:`, error);
            }

            // Wait between commits to avoid rate limits
            if (i < unprocessedCommits.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 8000));
            }
        }

        if (commitData.length > 0) {
            await db.commit.createMany({ data: commitData, skipDuplicates: true });
        }
    } catch (error) {
        console.error('pollCommits failed:', error);
    }
};

async function summarizeCommit(githubUrl: string, commitHash: string): Promise<string> {
    const targetUrl = githubUrl.endsWith('.git')
        ? githubUrl.slice(0, -4)
        : githubUrl;

    console.log(`📝 Summarizing commit ${commitHash}`);

    try {
        const { data } = await axios.get(`${targetUrl}/commit/${commitHash}.diff`, {
            headers: {
                Accept: 'application/vnd.github.v3.diff',
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
        });

        return (await aiSummariseCommit(data)) || '';
    } catch (error) {
        console.error(`❌ Failed to fetch diff for ${commitHash}:`, error);
        return '';
    }
}

async function filterUnprocessedCommits(
    projectId: string,
    commitHashes: CommitResponse[]
): Promise<CommitResponse[]> {
    const processedCommits = await db.commit.findMany({
        where: { projectId },
        select: { commitHash: true },
    });
    return commitHashes.filter(
        (commit) => !processedCommits.some((pc) => pc.commitHash === commit.commitHash)
    );
}

export const getPullRequests = async (githubUrl: string, githubToken?: string) => {
    const client = githubToken ? new Octokit({ auth: githubToken }) : octokit;
    const cleanUrl = githubUrl.replace(/\/+$/, '').replace(/\.git$/, '');
    const [owner, repo] = cleanUrl.split('/').slice(-2);
    if (!owner || !repo) return [];

    try {
        const { data } = await client.rest.pulls.list({
            owner,
            repo,
            state: 'open',
        });
        return data.map((pr) => ({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            state: pr.state,
            user: {
                name: pr.user?.login ?? '',
                avatar: pr.user?.avatar_url ?? '',
            },
            createdAt: pr.created_at,
            htmlUrl: pr.html_url,
        }));
    } catch (error) {
        console.error('Failed to fetch open PRs:', error);
        return [];
    }
};

export const analyzePullRequest = async (githubUrl: string, prNumber: number, githubToken?: string) => {
    const client = githubToken ? new Octokit({ auth: githubToken }) : octokit;
    const cleanUrl = githubUrl.replace(/\/+$/, '').replace(/\.git$/, '');
    const [owner, repo] = cleanUrl.split('/').slice(-2);
    if (!owner || !repo) throw new Error('Invalid repository URL');

    try {
        const { data: pr } = await client.rest.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
        });

        const diffResponse = await axios.get(`${cleanUrl}/pull/${prNumber}.diff`, {
            headers: {
                Accept: 'application/vnd.github.v3.diff',
                Authorization: githubToken ? `token ${githubToken}` : `token ${process.env.GITHUB_TOKEN}`,
            },
        });

        const diff = diffResponse.data;
        const prompt = `You are a senior principal engineer performing a code review on a pull request.
Pull Request: #${pr.number} - ${pr.title}
Author: ${pr.user?.login}
Description: ${pr.body || 'No description provided.'}

Here is the diff of the changes:
${diff.slice(0, 20000)}

Please provide a structured code review including:
1. **Summary**: A brief 2-3 sentence overview of what this PR does.
2. **Key Impact**: Architectural impact, potential risks, or performance implications.
3. **Review Points & Suggestions**: Bullet points detailing specific improvements, bugs found, security vulnerabilities, or styling recommendations. Reference filenames and line numbers where appropriate.
4. **Approval Recommendation**: Provide a recommendation (e.g., APPROVED, REQUEST_CHANGES, NEUTRAL) with a brief rationale.

Be professional, direct, constructive, and developer-friendly. Use markdown formatting.`;

        const review = await aiSummariseCommit(prompt);
        return { review, prTitle: pr.title, prNumber: pr.number };
    } catch (error: any) {
        console.error('PR analysis failed:', error);
        throw new Error(`Failed to analyze PR: ${error.message}`);
    }
};
