'use client'

import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const ArchivedProjectsList = () => {
    const utils = api.useUtils()
    const { data: projects } = api.project.getArchivedProjects.useQuery()
    const restore = api.project.restoreProject.useMutation()

    if (!projects?.length) {
        return <p className="text-sm text-gray-500">No archived projects</p>
    }

    return (
        <div className="space-y-3">
            {projects.map(project => (
                <div
                    key={project.id}
                    className="flex items-center justify-between rounded-md border p-3"
                >
                    <span className="font-medium">{project.name}</span>

                    <Button
                        size="sm"
                       
                        onClick={() =>
                            restore.mutate(
                                { projectId: project.id },
                                {
                                    onSuccess: () => {
                                        toast.success('Project restored')
                                        utils.project.invalidate()
                                    },
                                }
                            )
                        }
                    >
                        Restore
                    </Button>
                </div>
            ))}
        </div>
    )
}

export default ArchivedProjectsList
