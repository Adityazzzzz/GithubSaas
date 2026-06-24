'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useProject from '@/hooks/use-project'

export default function PmStudioRedirectPage() {
  const { projectId } = useProject()
  const router = useRouter()

  useEffect(() => {
    if (projectId && projectId.trim()) {
      router.replace(`/${projectId}/pmstudio`)
    } else {
      router.replace('/dashboard')
    }
  }, [projectId, router])

  return (
    <div className="h-full w-full flex items-center justify-center text-sm font-medium text-slate-400">
      Redirecting to PM Studio...
    </div>
  )
}
