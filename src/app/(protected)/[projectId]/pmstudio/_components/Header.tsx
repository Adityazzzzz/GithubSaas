import React from 'react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import type { TabType } from './types'

interface HeaderProps {
  activeTab: TabType
  activeSprintName: string | null
  onSync: () => void
  isSyncing: boolean
}

const TAB_LABELS: Record<TabType, string> = {
  board: 'Active Board',
  calendar: 'Calendar',
  teams: 'Sub-Teams',
  automations: 'Workflow Automations',
  analytics: 'Analytics Cockpit',
}

export function Header({ activeTab, activeSprintName, onSync, isSyncing }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{TAB_LABELS[activeTab]}</h2>
        <Separator orientation="vertical" className="h-4 bg-border" />
        {activeSprintName ? (
          <Badge variant="secondary" className="gap-1.5 font-medium text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg px-2 py-0.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {activeSprintName}
          </Badge>
        ) : (
          <span className="text-xs font-medium text-muted-foreground bg-muted border border-border rounded-lg px-2 py-0.5">No active sprint</span>
        )}
      </div>
      <Button
        onClick={onSync}
        disabled={isSyncing}
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-foreground border-border hover:bg-muted rounded-xl px-3.5 h-9 text-sm transition-all shadow-sm"
      >
        <RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
        Sync Git
      </Button>
    </header>
  )
}
