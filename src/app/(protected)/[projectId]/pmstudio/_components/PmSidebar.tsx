import React from 'react'
import { Kanban, Calendar, Users, Settings, BarChart3, ArrowLeft } from 'lucide-react'
import { Button as UIButton } from '@/components/ui/button'
import type { TabType } from './types'

const SIDEBAR_ITEMS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'board', label: 'Board', icon: Kanban },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'automations', label: 'Automations', icon: Settings },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

interface PmSidebarProps {
  projectName: string
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export function PmSidebar({ projectName, activeTab, setActiveTab }: PmSidebarProps) {
  return (
    <aside className="w-60 border-r border-border bg-card flex flex-col shrink-0 select-none">
      {/* Brand */}
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/10">
          <Kanban className="size-4.5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground leading-none">GitBrain</h1>
          <p className="text-xs font-medium text-muted-foreground truncate mt-1">{projectName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2.5 mb-3">Planning</p>
        {SIDEBAR_ITEMS.map(item => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className={`size-4 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110 text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <UIButton asChild variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-background border border-transparent hover:border-border transition-all">
          <a href="/dashboard">
            <ArrowLeft className="size-4" />
            <span className="text-sm font-medium">Back to Hub</span>
          </a>
        </UIButton>
      </div>
    </aside>
  )
}
