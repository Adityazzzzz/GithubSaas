import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Filter, Plus, CheckSquare, User, X,
  ArrowDown, ArrowUp, Minus, ChevronsUp
} from 'lucide-react'
import { 
  PRIORITY_CONFIG, 
  STATUS_CONFIG, 
  BOARD_COLUMNS, 
  getInitials, 
  getUserName 
} from './types'
import type { PriorityType } from './types'

interface BoardViewProps {
  tasks: any[]
  teams: any[]
  members: any[]
  filterTeam: string
  setFilterTeam: (t: string) => void
  filterAssignee: string
  setFilterAssignee: (a: string) => void
  filterPriority: string
  setFilterPriority: (p: string) => void
  onNewIssueClick: () => void
  onCardClick: (task: any) => void
  onUpdateTaskStatus: (taskId: string, status: string) => Promise<void>
}

export function BoardView({
  tasks,
  teams,
  members,
  filterTeam,
  setFilterTeam,
  filterAssignee,
  setFilterAssignee,
  filterPriority,
  setFilterPriority,
  onNewIssueClick,
  onCardClick,
  onUpdateTaskStatus,
}: BoardViewProps) {
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)

  /* ─── Drag & Drop ─────────────────────────────────────────────────────── */
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    setDragOverColId(null)
    const taskId = e.dataTransfer.getData('text/plain')
    if (!taskId) return
    await onUpdateTaskStatus(taskId, status)
  }

  /* ─── Filter ──────────────────────────────────────────────────────────── */
  const filteredTasks = tasks.filter(task => {
    const teamMatch = filterTeam === 'ALL' || task.subTeamId === filterTeam
    const assigneeMatch = filterAssignee === 'ALL' || task.assigneeId === filterAssignee
    const priorityMatch = filterPriority === 'ALL' || task.priority === filterPriority
    return teamMatch && assigneeMatch && priorityMatch
  })

  const hasFilters = filterTeam !== 'ALL' || filterAssignee !== 'ALL' || filterPriority !== 'ALL'

  const getChecklistStats = (description: string | null) => {
    if (!description) return { total: 0, done: 0, percentage: 0 }
    const totalMatches = description.match(/- \[[ xX]\]/g) || []
    const doneMatches = description.match(/- \[[xX]\]/g) || []
    const total = totalMatches.length
    const done = doneMatches.length
    return { total, done, percentage: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/20 select-none">
      {/* Filter Bar */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">
            <Filter className="size-3.5 text-slate-400" />
            Filters
          </div>
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="h-9 w-[140px] text-xs bg-slate-50 border-slate-100 hover:bg-slate-100/50 rounded-xl transition-all"><SelectValue placeholder="All teams" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs">All teams</SelectItem>
              {teams.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="h-9 w-[160px] text-xs bg-slate-50 border-slate-100 hover:bg-slate-100/50 rounded-xl transition-all"><SelectValue placeholder="All members" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs">All members</SelectItem>
              {members.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{getUserName(m)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="h-9 w-[130px] text-xs bg-slate-50 border-slate-100 hover:bg-slate-100/50 rounded-xl transition-all"><SelectValue placeholder="All priorities" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs">All priorities</SelectItem>
              <SelectItem value="LOW" className="text-xs">Low</SelectItem>
              <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
              <SelectItem value="HIGH" className="text-xs">High</SelectItem>
              <SelectItem value="URGENT" className="text-xs">Urgent</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-slate-400 hover:text-slate-700 rounded-xl"
              onClick={() => { setFilterTeam('ALL'); setFilterAssignee('ALL'); setFilterPriority('ALL') }}>
              <X className="size-3 mr-1.5" /> Clear Filters
            </Button>
          )}
        </div>
        <Button size="sm" className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10" onClick={onNewIssueClick}>
          <Plus className="size-4" /> New Issue
        </Button>
      </div>

      {/* Board Columns */}
      <div className="flex-1 flex gap-5 p-6 overflow-x-auto min-h-0 bg-slate-50/50">
        {BOARD_COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id)
          const isDragOver = dragOverColId === col.id

          return (
            <div
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); if (dragOverColId !== col.id) setDragOverColId(col.id) }}
              onDragLeave={() => setDragOverColId(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-[300px] shrink-0 flex flex-col h-full bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-200 ${
                isDragOver ? 'ring-2 ring-blue-500/20 bg-blue-50/10 border-blue-200' : ''
              }`}
            >
              {/* Column Header */}
              <div className="px-4 py-4.5 flex items-center justify-between shrink-0 border-b border-slate-100 bg-slate-50/30 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <span className={`size-2 rounded-full ${col.dot}`} />
                  <span className="text-sm font-semibold text-slate-700 tracking-tight">{col.label}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 tabular-nums">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-3 min-h-[200px]">
                  {isDragOver && (
                    <div className="h-16 border-2 border-dashed border-blue-500/30 bg-blue-50/20 rounded-xl flex items-center justify-center text-xs text-blue-600 font-semibold animate-pulse">
                      Drop here to move
                    </div>
                  )}

                  {colTasks.length === 0 && !isDragOver && (
                    <div className="py-12 text-center text-[11px] text-slate-400 font-medium">
                      No issues
                    </div>
                  )}

                  {colTasks.map(task => {
                    const priorityInfo = PRIORITY_CONFIG[task.priority as PriorityType] || PRIORITY_CONFIG.MEDIUM
                    const PriorityIcon = priorityInfo.icon
                    const checklist = getChecklistStats(task.description)

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onCardClick(task)}
                        className="group p-4 bg-white border border-slate-100 rounded-xl cursor-pointer hover:shadow-md hover:border-slate-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                      >
                        {/* Key + Priority */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{task.issueKey}</span>
                          <div className={`p-1 rounded-lg border ${priorityInfo.color} flex items-center justify-center`} title={`${priorityInfo.label} Priority`}>
                            <PriorityIcon className="size-3 shrink-0" />
                          </div>
                        </div>

                        {/* Title */}
                        <p className="text-[13px] font-semibold leading-relaxed text-slate-800 line-clamp-2 mb-3">
                          {task.title}
                        </p>

                        {/* Checklist */}
                        {checklist.total > 0 && (
                          <div className="mb-3 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                            <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mb-1.5">
                              <span className="flex items-center gap-1.5">
                                <CheckSquare className="size-3 text-blue-500" /> Checklist
                              </span>
                              <span className="font-semibold">{checklist.done}/{checklist.total}</span>
                            </div>
                            <Progress value={checklist.percentage} className="h-1 bg-slate-100" />
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
                          {task.subTeam ? (
                            <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600 border-slate-100 px-2 py-0.5 h-5 font-semibold rounded-lg">{task.subTeam.name}</Badge>
                          ) : (
                            <span />
                          )}
                          {task.assignee ? (
                            <div className="size-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm" title={getUserName(task.assignee)}>
                              {getInitials(task.assignee)}
                            </div>
                          ) : (
                            <div className="size-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center" title="Unassigned">
                              <User className="size-3 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>
    </div>
  )
}
