'use client'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from 'sonner'
import { Trash2, RotateCcw, Loader2, Archive } from 'lucide-react'

const ProjectStatusBadge = ({ status }: { status: string }) => {
    if (status === "RESTORING") {
        return (
            <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500 text-xs font-normal">
                <Loader2 className="h-3 w-3 animate-spin" />
                Restoring
            </Badge>
        )
    }
    return (
        <Badge variant="secondary" className="gap-1 text-muted-foreground text-xs font-normal">
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

    // Loading State
    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-1">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-96 bg-muted/50 animate-pulse rounded" />
                </div>
                <div className="h-64 w-full bg-muted/20 animate-pulse rounded-lg border" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            {/* 1. Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Archived Projects
                </h1>
                <p className="text-muted-foreground">
                    View and manage projects you have archived. Restore them to continue working or delete them permanently.
                </p>
                <div className="h-[1px] w-full bg-border mt-2" />
            </div>

            {/* 2. Empty State */}
            {!projects?.length ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-lg border border-dashed bg-muted/10">
                    <div className="p-4 rounded-full bg-muted/30">
                        <Archive className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-lg">No archived projects</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            Projects you archive from your dashboard will appear here safely until you decide to restore or delete them.
                        </p>
                    </div>
                </div>
            ) : (
                /* 3. Data Table */
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="w-[50px] pl-4">
                                    <Checkbox disabled aria-label="Select all" />
                                </TableHead>
                                <TableHead className="w-[300px]">Project Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Deleted On</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id} className="group hover:bg-muted/40 transition-colors">
                                    <TableCell className="pl-4">
                                        <Checkbox id={project.id} aria-label={`Select ${project.name}`} />
                                    </TableCell>
                                    <TableCell className="font-medium text-base">
                                        {project.name}
                                    </TableCell>
                                    <TableCell>
                                        <ProjectStatusBadge status={project.status} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 gap-1.5 border-dashed"
                                                disabled={restore.isPending || deleteProject.isPending || project.status === 'RESTORING'}
                                                onClick={() => restore.mutate({ projectId: project.id })}
                                            >
                                                <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="hidden sm:inline">Restore</span>
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-8 gap-1.5"
                                                disabled={restore.isPending || deleteProject.isPending || project.status === 'RESTORING'}
                                                onClick={() => {
                                                    if (window.confirm("Are you sure? This action is permanent and cannot be undone.")) {
                                                        deleteProject.mutate({ projectId: project.id })
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

export default ArchivedProjectsList