'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useProject from '@/hooks/use-project'
import { Loader2 } from 'lucide-react'

export default function DashboardRedirect() {
  const router = useRouter()
  const { project, projectId, projects } = useProject()

  useEffect(() => {
    const activeProject = project || projects?.find(p => p.id === projectId) || projects?.[0]
    if (activeProject) {
      const slug = encodeURIComponent(activeProject.name)
      router.replace(`/${slug}/dashboard`)
    } else {
      router.replace('/create')
    }
  }, [project, projectId, projects, router])

  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}
