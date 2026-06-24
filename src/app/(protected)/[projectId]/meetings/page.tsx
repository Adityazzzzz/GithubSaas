'use client'

import React from 'react'
import MeetingCard from '../dashboard/meeting-card' // Assuming this is your upload/create component
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils' // removed formatIssuesCount since we can inline it
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import { Calendar, FileText, Loader2, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const MeetingsPage = () => {
    const { projectId } = useProject()
    const { data: projects } = api.project.getProjects.useQuery()
    
    // Check if project exists and is active
    const isProjectActive = projects?.find(p => p.id === projectId);

    const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
        { projectId }, 
        { 
            refetchInterval: 4000, 
            enabled: !!projectId 
        }
    )

    const deleteMeeting = api.project.deleteMeeting.useMutation()
    const refetch = useRefetch()

    // 1. Handle No Project Selected
    if (!projectId || (projects && !isProjectActive)) {
        return <NoProjectPlaceholder />
    }

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Meetings</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Manage your meeting recordings and analyze discussions.
                    </p>
                </div>
                {/* We can place the "Upload/New Meeting" button here if MeetingCard is just a button */}
            </div>

            {/* Upload/Create Section */}
            {/* Keeping your existing component, but wrapping it to align nicely */}
            <div className="rounded-xl bg-card border text-card-foreground shadow-sm p-6">
                <div className="mb-4">
                     <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="size-5 text-primary" />
                        Upload New Meeting
                     </h2>
                     <p className="text-sm text-muted-foreground">Upload audio or video files to generate summaries.</p>
                </div>
                <MeetingCard />
            </div>

            {/* Meetings List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Recent Meetings</h2>

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-6 border rounded-xl bg-card">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                                <Skeleton className="h-8 w-[100px]" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && meetings && meetings.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/30 text-center">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <Calendar className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg">No meetings yet</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            Upload your first meeting recording to get started with AI analysis.
                        </p>
                    </div>
                )}

                {/* Meetings Grid */}
                <div className="grid gap-4">
                    {meetings?.map((meeting) => (
                        <div 
                            key={meeting.id} 
                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:border-primary/20"
                        >
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-3">
                                    <Link 
                                        href={`/meetings/${meeting.id}`} 
                                        className="text-lg font-semibold hover:text-primary transition-colors truncate"
                                    >
                                        {meeting.name}
                                    </Link>
                                    
                                    {meeting.status === 'PROCESSING' ? (
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 gap-1.5 hover:bg-yellow-100">
                                            <Loader2 className="size-3 animate-spin" />
                                            Processing
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800 gap-1">
                                            <CheckCircle2 className="size-3" />
                                            Ready
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="size-3.5" />
                                        <span>{formatDate(meeting.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <FileText className="size-3.5" />
                                        <span>{meeting.issues.length} Issues found</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <Link href={`/meetings/${meeting.id}`} className="w-full sm:w-auto">
                                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                                        View Details
                                    </Button>
                                </Link>
                                
                                <Button 
                                    disabled={deleteMeeting.isPending} 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full sm:w-auto"
                                    onClick={() => deleteMeeting.mutate(
                                        { meetingId: meeting.id },
                                        {
                                            onSuccess: () => {
                                                toast.success('Meeting deleted successfully!')
                                                refetch()
                                            },
                                            onError: () => toast.error('Failed to delete meeting')
                                        }
                                    )}
                                >
                                    {deleteMeeting.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="size-4" />
                                    )}
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MeetingsPage