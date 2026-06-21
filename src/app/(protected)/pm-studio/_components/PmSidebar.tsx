import React from 'react'
import { Kanban, Calendar, Users, Settings, BarChart3, ArrowLeft } from 'lucide-react'
import { Button as UIButton } from '@/components/ui/button'
import type { TabType } from './types'

const SIDEBAR_ITEMS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'board', label: 'Board', icon: Kanban },
  { id: 'backlog', label: 'Backlog', icon: Calendar },
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
    <aside className="w-60 border-r bg-white flex flex-col shrink-0 select-none">
      {/* Brand */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="size-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/10">
          <Kanban className="size-4.5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-slate-900 leading-none">GitBrain</h1>
          <p className="text-[11px] font-medium text-slate-500 truncate mt-1">{projectName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-3">Planning</p>
        {SIDEBAR_ITEMS.map(item => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`size-4 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110 text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <UIButton asChild variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">
          <a href="/dashboard">
            <ArrowLeft className="size-4" />
            <span className="text-sm font-medium">Back to Hub</span>
          </a>
        </UIButton>
      </div>
    </aside>
  )
}
