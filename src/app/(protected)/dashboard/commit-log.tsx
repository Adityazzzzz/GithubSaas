'use client'
import useProject from '@/hooks/use-project'
import { cn } from '@/lib/utils'
import { api } from '@/trpc/react'
import { ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const CommitLog = () => {
    const { projectId, project } = useProject()
    const { data: commits } = api.project.getCommits.useQuery({ projectId })
    const [prevLastVisitedAt, setPrevLastVisitedAt] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (!projectId) return
        const key = `gitbrain_last_visited_${projectId}`
        const stored = localStorage.getItem(key)
        if (stored) {
            setPrevLastVisitedAt(stored)
        } else {
            // First time: baseline is 24h ago
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            setPrevLastVisitedAt(oneDayAgo)
        }
        localStorage.setItem(key, new Date().toISOString())
    }, [projectId])

    const { data: changesSummary } = api.project.getChangesSummarySinceLastVisit.useQuery(
        { projectId, lastVisitedAt: prevLastVisitedAt! },
        { enabled: !!prevLastVisitedAt }
    )

    const isUnread = (commitDate: Date | string) => {
        if (!prevLastVisitedAt) return false
        return new Date(commitDate).getTime() > new Date(prevLastVisitedAt).getTime()
    }

    return (
        <div className="space-y-6">
            {changesSummary && (
                <div className="rounded-xl border border-violet-200/50 bg-gradient-to-r from-violet-50/50 via-indigo-50/30 to-violet-50/20 p-5 shadow-sm dark:border-violet-800/40 dark:from-violet-950/20 dark:to-indigo-950/10">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-violet-600 p-2 text-white dark:bg-violet-500 shadow-sm">
                            <Sparkles className="size-5" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                    Changes since your last visit
                                </h3>
                                <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/50 dark:text-violet-300">
                                    {changesSummary.unreadCount} new {changesSummary.unreadCount === 1 ? 'commit' : 'commits'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {changesSummary.summary}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ul className='space-y-6'>
                {commits?.map((commit, commitIdx) => {
                    const unread = isUnread(commit.commitDate)
                    return <li key={commit.id} className='relative flex gap-x-4'>
                        <div className={cn(
                            commitIdx === commits.length - 1 ? 'h-6' : '-bottom-6',
                            'absolute left-0 top-0 flex w-6 justify-center'
                        )}>
                            <div className='w-px translate-x-1 bg-gray-200 dark:bg-gray-800'></div>
                        </div>

                        <>
                        <img src={commit.commitAuthorAvatar} alt='commit avatar' className='relative mt-4 size-8 flex-none rounded-full bg-gray-50 dark:bg-gray-900'/>

                        <div className={cn(
                            'flex-auto rounded-xl p-4 ring-1 ring-inset transition-all duration-300',
                            unread 
                                ? 'bg-gradient-to-r from-emerald-50/40 via-white to-white ring-emerald-500/20 shadow-sm shadow-emerald-500/5 dark:from-emerald-950/10 dark:via-gray-900 dark:to-gray-900 dark:ring-emerald-500/20'
                                : 'bg-white ring-gray-200 dark:bg-gray-900 dark:ring-gray-800'
                        )}>
                            <div className='flex justify-between items-center gap-4'>
                                <Link 
                                    target='_blank' 
                                    href={`${project?.githubUrl}/commit/${commit.commitHash}`} 
                                    className='py-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400 flex items-center gap-1.5'
                                >
                                    <span className='font-medium text-gray-900 dark:text-gray-100 hover:underline'>
                                        {commit.commitAuthorName}
                                    </span>{" "}
                                    <span className='inline-flex items-center hover:text-gray-700 dark:hover:text-gray-200'>
                                        committed
                                        <ExternalLink className='ml-1 size-3' />
                                    </span>
                                </Link>
                                {unread && (
                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-900/25 dark:text-emerald-400 dark:ring-emerald-500/20 animate-pulse">
                                        New
                                    </span>
                                )}
                            </div>
                            <h4 className='font-semibold text-gray-800 dark:text-gray-100 mt-1 text-sm'>
                                {commit.commitMessage}
                            </h4>
                            <pre className='mt-2 whitespace-pre-wrap text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 dark:bg-gray-950/30 dark:border-gray-800/50 leading-relaxed'>
                                {commit.summary}
                            </pre>
                        </div>
                        </>
                    </li>
                })}
            </ul>
        </div>
    )
}

export default CommitLog