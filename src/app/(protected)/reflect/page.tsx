'use client'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Trash2, RotateCcw, Loader2, Archive } from 'lucide-react'

const ProjectStatusBadge = ({ status }: { status: string }) => {
    if (status === "RESTORING") {
        return (
            <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500 text-xs font-normal">
                <Loader2 className="h-3 w-3 animate-spin" />
                Restoring...
            </Badge>
        )
    }
    return (
        <Badge variant="secondary" className="gap-1 text-gray-500 text-xs font-normal">
            <Archive className="h-3 w-3" />
            Archived
        </Badge>
    )
}

const ArchivedProjectsList = () => {
    const utils = api.useUtils()
    const { data: projects, isLoading } = api.project.getArchivedProjects.useQuery()

    const restore = api.project.restoreProject.useMutation({
        onSuccess: () => {
            toast.success('Project restored')
            utils.project.invalidate()
        },
        onError: (err) => {
            toast.error("Failed to restore: " + err.message)
        }
    })

    const deleteProject = api.project.deleteProject.useMutation({
        onSuccess: () => {
            toast.success('Project permanently deleted')
            utils.project.invalidate()
        },
        onError: (err) => {
            toast.error("Failed to delete: " + err.message)
        }
    })

    if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>

    if (!projects?.length) {
        return (
            <div className="text-center p-8 border rounded-lg border-dashed">
                <p className="text-sm text-gray-500">No archived projects found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {projects.map(project => (
                <div
                    key={project.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 bg-background shadow-sm"
                >
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{project.name}</span>
                            <ProjectStatusBadge status={project.status} />
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Deleted on: {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={restore.isPending || deleteProject.isPending || project.status === 'RESTORING'}
                            onClick={() => restore.mutate({ projectId: project.id })}
                        >
                            <RotateCcw className="size-4 mr-2" />
                            Restore
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={restore.isPending || deleteProject.isPending || project.status === 'RESTORING'}
                            onClick={() => {
                                if (window.confirm("Are you sure? This deletes everything permanently.")) {
                                    deleteProject.mutate({ projectId: project.id })
                                }
                            }}
                        >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ArchivedProjectsList