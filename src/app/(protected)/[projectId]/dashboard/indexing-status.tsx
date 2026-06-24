'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react'

const IndexingStatus = () => {
    const { projectId } = useProject()
    const { data: status } = api.project.getIndexingStatus.useQuery(
        { projectId },
        {
            enabled: !!projectId,
            refetchInterval: (query) => {
                const data = query.state.data
                // Poll every 5s while indexing, stop when done
                return data?.indexingStatus === 'INDEXING' || data?.indexingStatus === 'PENDING' ? 5000 : false
            },
        }
    )

    if (!status || status.indexingStatus === 'READY') return null

    const progress = status.totalFiles > 0
        ? Math.round((status.indexingProgress / status.totalFiles) * 100)
        : 0

    return (
        <Card className="mb-4 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                    {status.indexingStatus === 'PENDING' && (
                        <>
                            <Clock className="size-5 text-amber-500 animate-pulse" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Preparing to index...</p>
                                <p className="text-xs text-muted-foreground">Your project is queued for processing</p>
                            </div>
                        </>
                    )}
                    {status.indexingStatus === 'INDEXING' && (
                        <>
                            <Loader2 className="size-5 text-blue-500 animate-spin" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium">
                                        Indexing files... {status.indexingProgress}/{status.totalFiles}
                                    </p>
                                    <span className="text-xs font-mono text-muted-foreground">{progress}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Branch: {status.branch} • This may take a few minutes
                                </p>
                            </div>
                        </>
                    )}
                    {status.indexingStatus === 'FAILED' && (
                        <>
                            <AlertCircle className="size-5 text-red-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Indexing failed</p>
                                <p className="text-xs text-muted-foreground">There was an error processing your repository. Try archiving and restoring the project.</p>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default IndexingStatus
