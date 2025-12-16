'use client'

import { api } from '@/trpc/react'
import { Star, GitFork, Loader2, Github } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from './ui/button'

const GlobalHeaderStats = () => {
    const { data: stats, isLoading } = api.project.getMyRepoStats.useQuery()

    if (isLoading) return <Loader2 className="size-4 animate-spin text-muted-foreground" />
    if (!stats) return null

    return (
        <div className="flex items-center gap-2">
            <Link href={stats.url} target="_blank">
                 <Button variant="outline" size="sm" className="h-8 gap-2 px-3">
                    <Github className='size-4' />
                    <span className="font-semibold hidden sm:inline">Star on GitHub</span>
                    
                    <div className="flex items-center gap-1 pl-2 ml-2 border-l border-muted-foreground/30">
                        <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-mono">{stats.stars}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <GitFork className="size-3.5 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">{stats.forks}</span>
                    </div>
                </Button>
            </Link>
        </div>
    )
}

export default GlobalHeaderStats