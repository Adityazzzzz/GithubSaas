'use client'
import React from 'react'
import MeetingCard from '../dashboard/meeting-card'
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatIssuesCount } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'


const MeetingsPage = () => {
    const {projectId} = useProject()
    const { data: projects } = api.project.getProjects.useQuery()
    const isProjectActive = projects?.find(p => p.id === projectId);
    if (!projectId || (projects && !isProjectActive)) {
        return <NoProjectPlaceholder />
    }
    const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
        { projectId }, 
        { 
            refetchInterval: 4000, 
            enabled: !!projectId 
        }
    )

    const deleteMeeting = api.project.deleteMeeting.useMutation()
    const refetch = useRefetch()
    return (
        <>
            <MeetingCard />
            <div className="h-6" />
            <h1 className="text-xl font-semibold">Meetings</h1>

            {meetings && meetings.length === 0 && (
                <div>No meetings found</div>
            )}

            {isLoading && <div>Loading...</div>}

            <ul className="divide-y divide-gray-200">
                {meetings?.map((meeting) => (
                    <li key={meeting.id} className="flex items-center justify-between py-5 gap-x-6">
                        <div>
                            <div className='min-w-0'>
                                <div className='flex items-center gap-2'>
                                    <Link href={`/meetings/${meeting.id}`} className='text-sm font-semibold'>
                                        {meeting.name}
                                    </Link>
                                    {meeting.status === 'PROCESSING' && (
                                        <Badge className='bg-yellow-500 text-white'>
                                            Processing...
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center text-xs text-gray-500 gap-x-2">
                                <p className="whitespace-nowrap">
                                    {formatDate(meeting.createdAt)}
                                </p>

                                <p className="truncate">
                                    {formatIssuesCount(meeting.issues)} 
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center flex-none gap-x-4'>
                            <Link href={`/meetings/${meeting.id}`}>
                                <Button size='sm' variant='outline'>
                                    View Meeting
                                </Button>
                            </Link>
                            <Button 
                                disabled={deleteMeeting.isPending} 
                                size='sm' 
                                variant='destructive' 
                                onClick={()=>deleteMeeting.mutate({meetingId:meeting.id},{
                                    onSuccess:()=>{
                                        toast.success('Meeting deleted succesfully!')
                                        refetch()
                                    }
                                })}
                            >
                                Delete Meeting
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}


export default MeetingsPage