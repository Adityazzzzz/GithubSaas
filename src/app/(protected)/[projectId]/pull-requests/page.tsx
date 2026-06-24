'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React, { useState } from 'react'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import { GitPullRequest, Loader2, FileCode, ExternalLink, Calendar, MessageSquareCode, Sparkles } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

const PullRequestsPage = () => {
    const { projectId, project } = useProject()
    const { data: projects } = api.project.getProjects.useQuery()
    
    const [selectedPr, setSelectedPr] = useState<{ number: number; title: string; htmlUrl: string; user: { name: string; avatar: string } } | null>(null)
    const [analysisResult, setAnalysisResult] = useState<string | null>(null)

    const isProjectActive = projects?.find(p => p.id === projectId)
    
    const { data: pullRequests, isLoading: isLoadingPRs } = api.project.getPullRequests.useQuery(
        { projectId },
        { enabled: !!projectId && !!isProjectActive }
    )

    const analyzePrMutation = api.project.analyzePullRequest.useMutation()

    if (!projectId || (projects && !isProjectActive)) {
        return <NoProjectPlaceholder />
    }

    const handleSelectPr = async (pr: { number: number; title: string; htmlUrl: string; user: { name: string; avatar: string } }) => {
        setSelectedPr(pr)
        setAnalysisResult(null)
        try {
            const res = await analyzePrMutation.mutateAsync({
                projectId,
                prNumber: pr.number,
            })
            setAnalysisResult(res.review)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-8 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6 shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <GitPullRequest className="size-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pull Requests</h1>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Select an open pull request to generate an automated AI code review.
                    </p>
                </div>
                {pullRequests && pullRequests.length > 0 && (
                    <Badge variant="secondary" className="text-xs font-mono shrink-0">
                        {pullRequests.length} open
                    </Badge>
                )}
            </div>

            {/* Split Pane View */}
            <div className="flex gap-4 flex-1 min-h-0">
                {/* PR List Panel */}
                <Card className="w-80 shrink-0 flex flex-col shadow-sm">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <GitPullRequest className="size-4 text-muted-foreground" />
                            Open Pull Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full px-2 py-3">
                            {isLoadingPRs ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Loading PRs…</p>
                                </div>
                            ) : pullRequests && pullRequests.length > 0 ? (
                                <div className="flex flex-col gap-1.5">
                                    {pullRequests.map((pr) => {
                                        const isSelected = selectedPr?.number === pr.number
                                        return (
                                            <button
                                                key={pr.id}
                                                onClick={() => handleSelectPr({
                                                    number: pr.number,
                                                    title: pr.title,
                                                    htmlUrl: pr.htmlUrl,
                                                    user: pr.user
                                                })}
                                                className={`flex flex-col text-left p-3 rounded-lg text-sm transition-all duration-150 hover:bg-muted border ${
                                                    isSelected
                                                        ? 'bg-primary/10 border-primary/20 shadow-sm'
                                                        : 'border-transparent text-muted-foreground hover:border-border'
                                                }`}
                                            >
                                                {/* Top row: avatar + number + date */}
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Image
                                                        src={pr.user.avatar}
                                                        alt={pr.user.name}
                                                        width={20}
                                                        height={20}
                                                        className="rounded-full ring-1 ring-border shrink-0"
                                                    />
                                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                                                        #{pr.number}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                                                        {new Date(pr.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <span className={`font-semibold line-clamp-2 leading-snug ${
                                                    isSelected ? 'text-primary' : 'text-foreground'
                                                }`}>
                                                    {pr.title}
                                                </span>

                                                {/* Author line */}
                                                <span className="text-[11px] text-muted-foreground mt-1.5 truncate">
                                                    by {pr.user.name}
                                                </span>

                                                {/* Visual accent bar for selected */}
                                                {isSelected && (
                                                    <div className="h-0.5 w-full bg-primary/40 rounded-full mt-2" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 space-y-2 text-center">
                                    <div className="bg-muted p-3 rounded-full">
                                        <GitPullRequest className="size-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        No open pull requests found.
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* PR Review Details Panel */}
                <Card className="flex-1 flex flex-col min-w-0 shadow-sm">
                    {selectedPr ? (
                        <>
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between shrink-0 gap-4">
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <Image
                                        src={selectedPr.user.avatar}
                                        alt={selectedPr.user.name}
                                        width={36}
                                        height={36}
                                        className="rounded-full ring-2 ring-border shrink-0 mt-0.5"
                                    />
                                    <div className="space-y-1 min-w-0">
                                        <CardTitle className="text-lg font-bold text-foreground leading-tight">
                                            <span className="text-muted-foreground font-normal">#{selectedPr.number}</span>{' '}
                                            {selectedPr.title}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Opened by <span className="font-medium text-foreground">{selectedPr.user.name}</span>
                                        </p>
                                    </div>
                                </div>
                                <Button asChild size="sm" variant="outline" className="gap-1.5 shrink-0">
                                    <Link href={selectedPr.htmlUrl} target="_blank">
                                        <ExternalLink className="size-3.5" />
                                        GitHub
                                    </Link>
                                </Button>
                            </CardHeader>
                            
                            <CardContent className="flex-1 min-h-0 overflow-auto p-6">
                                {analyzePrMutation.isPending ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                            <div className="relative bg-muted p-4 rounded-full">
                                                <Loader2 className="size-6 animate-spin text-primary" />
                                            </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-medium text-foreground">Analyzing pull request…</p>
                                            <p className="text-xs text-muted-foreground">Reviewing diff and generating AI feedback</p>
                                        </div>
                                    </div>
                                ) : analysisResult ? (
                                    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed" data-color-mode="dark">
                                        <MDEditor.Markdown source={analysisResult} />
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-500">
                                        <div className="bg-muted p-4 rounded-full">
                                            <MessageSquareCode className="size-8 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg text-foreground">AI Code Review Ready</h3>
                                            <p className="text-muted-foreground text-sm max-w-sm">
                                                Click the button below to generate a detailed AI code review for this pull request.
                                            </p>
                                        </div>
                                        <Button 
                                            onClick={() => handleSelectPr(selectedPr)}
                                            className="px-6 gap-2"
                                        >
                                            <Sparkles className="size-4" />
                                            Generate Review
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="flex-1 flex items-center justify-center">
                            <div className="text-center text-muted-foreground animate-in fade-in duration-500">
                                <div className="bg-muted/50 p-5 rounded-full mx-auto mb-4 w-fit">
                                    <GitPullRequest className="size-10 text-muted-foreground/50" />
                                </div>
                                <p className="font-semibold text-lg text-foreground">Select a Pull Request</p>
                                <p className="text-sm mt-1 max-w-xs mx-auto">Choose a pull request from the list to view its AI-powered code review</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default PullRequestsPage
