import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, Plus, X } from 'lucide-react'
import { getUserName } from '../types'

interface BoardFiltersProps {
  teams: any[]
  members: any[]
  sprints: any[]
  filterSprint: string
  setFilterSprint: (s: string) => void
  filterTeam: string
  setFilterTeam: (t: string) => void
  filterAssignee: string
  setFilterAssignee: (a: string) => void
  filterPriority: string
  setFilterPriority: (p: string) => void
  onNewIssueClick: () => void
  onNewSprintClick?: () => void
}

export function BoardFilters({
  teams,
  members,
  sprints,
  filterSprint,
  setFilterSprint,
  filterTeam,
  setFilterTeam,
  filterAssignee,
  setFilterAssignee,
  filterPriority,
  setFilterPriority,
  onNewIssueClick,
  onNewSprintClick
}: BoardFiltersProps) {
  const hasFilters = filterSprint !== 'ALL' || filterTeam !== 'ALL' || filterAssignee !== 'ALL' || filterPriority !== 'ALL'

  return (
    <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3 shrink-0 bg-background">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1 uppercase tracking-wider">
          <Filter className="size-3.5" />
          Filters
        </div>
        <Select value={filterSprint} onValueChange={setFilterSprint}>
          <SelectTrigger className="h-8.5 w-[140px] text-sm bg-muted/50 border-border/50 rounded-lg hover:bg-muted transition-all">
            <SelectValue placeholder="Sprint" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL" className="text-xs font-semibold text-foreground">All Sprints</SelectItem>
            {sprints.map(s => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.name} {s.status === 'ACTIVE' ? '(Active)' : s.status === 'COMPLETED' ? '(Completed)' : '(Upcoming)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="h-8.5 w-[130px] text-sm bg-muted/50 border-border/50 rounded-lg hover:bg-muted transition-all"><SelectValue placeholder="All teams" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL" className="text-xs">All teams</SelectItem>
            {teams.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="h-8.5 w-[150px] text-sm bg-muted/50 border-border/50 rounded-lg hover:bg-muted transition-all"><SelectValue placeholder="All members" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL" className="text-xs">All members</SelectItem>
            {members.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{getUserName(m)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="h-8.5 w-[120px] text-sm bg-muted/50 border-border/50 rounded-lg hover:bg-muted transition-all"><SelectValue placeholder="All priorities" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL" className="text-xs">All priorities</SelectItem>
            <SelectItem value="LOW" className="text-xs">Low</SelectItem>
            <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
            <SelectItem value="HIGH" className="text-xs">High</SelectItem>
            <SelectItem value="URGENT" className="text-xs">Urgent</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8.5 text-sm text-muted-foreground hover:text-foreground rounded-lg"
            onClick={() => { setFilterSprint('ALL'); setFilterTeam('ALL'); setFilterAssignee('ALL'); setFilterPriority('ALL') }}>
            <X className="size-3 mr-1" /> Clear
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8.5 gap-1 border-border bg-background hover:bg-muted text-foreground rounded-lg text-sm font-semibold shadow-sm px-4" onClick={onNewSprintClick}>
          <Plus className="size-3.5" /> Create Sprint
        </Button>
        <Button size="sm" className="h-8.5 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold shadow-sm px-4" onClick={onNewIssueClick}>
          <Plus className="size-3.5" /> Add Task
        </Button>
      </div>
    </div>
  )
}
