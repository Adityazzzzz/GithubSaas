'use client'
import { api } from '@/trpc/react'
import { useLocalStorage } from 'usehooks-ts'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

const useProject = () => {
    const { data: projects } = api.project.getProjects.useQuery();
    const [storedProjectId, setStoredProjectId] = useLocalStorage('GitBrainAI', ' ')
    
    const params = useParams()
    const urlParam = params?.projectId as string | undefined
    const decodedParam = urlParam ? decodeURIComponent(urlParam) : undefined

    // Resolve project matching URL param (either by name or direct ID cuid)
    const projectFromUrl = projects?.find(p => p.name === decodedParam || p.id === decodedParam)
    
    // Determine active project and its database ID
    const project = projectFromUrl || projects?.find(p => p.id === storedProjectId)
    const projectId = project?.id || storedProjectId

    // Synchronize resolved project ID back to localStorage if it differs
    useEffect(() => {
        if (projectFromUrl && projectFromUrl.id !== storedProjectId) {
            setStoredProjectId(projectFromUrl.id)
        }
    }, [projectFromUrl, storedProjectId, setStoredProjectId])

    return {
        projects,
        project,
        projectId,
        setProjectId: setStoredProjectId
    }
}

export default useProject