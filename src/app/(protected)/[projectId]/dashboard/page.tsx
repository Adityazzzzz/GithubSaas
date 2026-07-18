"use client"
import useProject from '@/hooks/use-project'
import { useUser } from '@clerk/nextjs'
import { ExternalLink, Github, PenBox, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question-card'
import MeetingCard from './meeting-card'
import ArchiveButton from './archieve-button'
import TeamMembers from './team-members'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import dynamic from 'next/dynamic'
import IndexingStatus from './indexing-status'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import { cn } from '@/lib/utils'

const InviteButton = dynamic(()=>import('./invite-button'),{ssr:false}) 

    const DashboardPage = () => {
    const {project} = useProject()
    const utils = api.useUtils()
    const syncProject = api.project.syncProject.useMutation({
        onSuccess: () => {
            utils.project.getIndexingStatus.invalidate({ projectId: project?.id })
        }
    })

    if (!project) {
      return <NoProjectPlaceholder />
    }
    return <>
        <div>
            {project?.name}
            <div className='flex items-center justify-between flex-wrap gap-y-4'>
                {/* github link */}
                <div className='w-fit rounded-md bg-primary px-4 py-3'>
                    <div className='flex items-center'>
                        <Github className='size-5 text-white' />
                        <div className='ml-2'>
                            <p className='text-sm font-medium text-white'>
                                This project is linked to {' '}
                                <Link href={project?.githubUrl??""} className='inline-flex items-center text-white/80 hover:underline'>
                                    {project?.githubUrl}
                                    <ExternalLink className='ml-1 size-4'/>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="h-4"></div>
                <div className='flex items-center gap-4'>
                    <TeamMembers/>
                    <InviteButton />
                    <Button
                        size='sm'
                        variant='outline'
                        disabled={syncProject.isPending}
                        onClick={() => syncProject.mutate({ projectId: project.id })}
                        className='h-8.5 gap-1.5 rounded-lg text-xs font-semibold px-4 border-slate-200 dark:border-slate-800'
                    >
                        <RefreshCw className={cn('size-3.5', syncProject.isPending && 'animate-spin')} />
                        {syncProject.isPending ? 'Syncing...' : 'Sync Repository'}
                    </Button>
                    <ArchiveButton/>
                </div>
            </div>

            <IndexingStatus />

            <div className="mt-4">
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-5'>
                    <AskQuestionCard/>
                    <MeetingCard/>
                </div>
            </div>

            <div className="mt-8"></div>
            <CommitLog/>
        </div>
        
    </>
}

export default DashboardPage