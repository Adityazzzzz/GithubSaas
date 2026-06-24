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
  backlog: 'Backlog & Sprints',
  teams: 'Sub-Teams',
  automations: 'Workflow Automations',
  analytics: 'Analytics Cockpit',
}

export function Header({ activeTab, activeSprintName, onSync, isSyncing }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-100 bg-white px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-800 tracking-tight">{TAB_LABELS[activeTab]}</h2>
        <Separator orientation="vertical" className="h-4 bg-slate-200" />
        {activeSprintName ? (
          <Badge variant="secondary" className="gap-1.5 font-medium text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {activeSprintName}
          </Badge>
        ) : (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5">No active sprint</span>
        )}
      </div>
      <Button
        onClick={onSync}
        disabled={isSyncing}
        variant="outline"
        size="sm"
        className="gap-2 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50/80 rounded-xl px-3.5 h-9 text-xs transition-all shadow-sm"
      >
        <RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
        Sync Git
      </Button>
    </header>
  )
}
