import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  Filter, Plus, CheckSquare, User, X,
  Inbox as InboxIcon, Calendar, ChevronLeft, ChevronRight,
  Sparkles, Link2
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
  onCreateTaskInline: (
    title: string,
    description: string | null,
    priority: PriorityType,
    sprintId: string | null,
    subTeamId: string | null,
    assigneeId: string | null,
    status?: string
  ) => void
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
  onCreateTaskInline,
}: BoardViewProps) {
  // Collapsible panels state
  const [isInboxOpen, setIsInboxOpen] = useState(true)
  const [isPlannerOpen, setIsPlannerOpen] = useState(false)

  // Inline creator state
  const [activeCreatorColId, setActiveCreatorColId] = useState<string | null>(null)
  const [inlineTitle, setInlineTitle] = useState('')

  // Drag over columns state
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

  const backlogTasks = filteredTasks.filter(t => t.status === 'BACKLOG')
  const boardTasks = filteredTasks.filter(t => t.status !== 'BACKLOG')
  const hasFilters = filterTeam !== 'ALL' || filterAssignee !== 'ALL' || filterPriority !== 'ALL'

  const getChecklistStats = (description: string | null) => {
    if (!description) return { total: 0, done: 0, percentage: 0 }
    const totalMatches = description.match(/- \[[ xX]\]/g) || []
    const doneMatches = description.match(/- \[[xX]\]/g) || []
    const total = totalMatches.length
    const done = doneMatches.length
    return { total, done, percentage: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  const handleCreateInline = (status: string) => {
    if (inlineTitle.trim()) {
      onCreateTaskInline(inlineTitle.trim(), null, 'MEDIUM', null, null, null, status)
      setInlineTitle('')
      setActiveCreatorColId(null)
    }
  }

  // Get current week's dates for the Planner sidebar
  const getWeekDays = () => {
    const days = []
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sun, 1 = Mon, ...
    
    // Start from Monday of the current week
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1))

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push({
        name: date.toLocaleDateString(undefined, { weekday: 'short' }),
        dayNum: date.getDate(),
        dateString: date.toDateString(),
        isToday: date.toDateString() === today.toDateString()
      })
    }
    return days
  }

  const weekDays = getWeekDays()

  return (
    <div className="h-full flex flex-col bg-white select-none">
      {/* Filter Bar */}
      <div className="px-1 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider">
            <Filter className="size-3.5" />
            Filters
          </div>
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="h-8.5 w-[130px] text-xs bg-slate-50 border-slate-150 rounded-lg hover:bg-slate-100/50 transition-all"><SelectValue placeholder="All teams" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs">All teams</SelectItem>
              {teams.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="h-8.5 w-[150px] text-xs bg-slate-50 border-slate-150 rounded-lg hover:bg-slate-100/50 transition-all"><SelectValue placeholder="All members" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs">All members</SelectItem>
              {members.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{getUserName(m)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="h-8.5 w-[120px] text-xs bg-slate-50 border-slate-150 rounded-lg hover:bg-slate-100/50 transition-all"><SelectValue placeholder="All priorities" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs">All priorities</SelectItem>
              <SelectItem value="LOW" className="text-xs">Low</SelectItem>
              <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
              <SelectItem value="HIGH" className="text-xs">High</SelectItem>
              <SelectItem value="URGENT" className="text-xs">Urgent</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-8.5 text-xs text-slate-400 hover:text-slate-700 rounded-lg"
              onClick={() => { setFilterTeam('ALL'); setFilterAssignee('ALL'); setFilterPriority('ALL') }}>
              <X className="size-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Collapsible Toggles */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsInboxOpen(!isInboxOpen)}
            className={`h-8.5 text-xs rounded-lg border-slate-200 gap-1.5 px-3 transition-colors ${isInboxOpen ? 'bg-slate-100 text-slate-700 font-semibold' : 'text-slate-500 bg-white'}`}
          >
            <InboxIcon className="size-3.5" />
            Inbox
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPlannerOpen(!isPlannerOpen)}
            className={`h-8.5 text-xs rounded-lg border-slate-200 gap-1.5 px-3 transition-colors ${isPlannerOpen ? 'bg-slate-100 text-slate-700 font-semibold' : 'text-slate-500 bg-white'}`}
          >
            <Calendar className="size-3.5" />
            Planner
          </Button>
          <Button size="sm" className="h-8.5 gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm px-4" onClick={onNewIssueClick}>
            <Plus className="size-3.5" /> Add Task
          </Button>
        </div>
      </div>

      {/* Main Workspace Panels Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-50/20">
        
        {/* PANEL 1: Collapsible Inbox (Trello style) */}
        {isInboxOpen ? (
          <div className="w-[280px] shrink-0 border-r border-slate-100 bg-slate-50/30 flex flex-col h-full animate-in slide-in-from-left duration-200">
            <div className="px-4.5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-700">
                <InboxIcon className="size-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Inbox (Backlog)</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => setIsInboxOpen(false)}>
                <ChevronLeft className="size-4 text-slate-400 hover:text-slate-600" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-3.5 space-y-2">
                {backlogTasks.length === 0 && (
                  <div className="text-center py-10">
                    <Sparkles className="size-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-[11px] font-semibold text-slate-400">Backlog is empty</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Tasks added here won't show on the main board until activated.</p>
                  </div>
                )}
                {backlogTasks.map(task => {
                  const checklist = getChecklistStats(task.description)
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onCardClick(task)}
                      className="p-3 bg-white border border-slate-150/70 rounded-xl cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[9px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded">{task.issueKey}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed truncate">{task.title}</p>
                      {checklist.total > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                          <CheckSquare className="size-2.5 text-blue-500" />
                          <span>{checklist.done}/{checklist.total} checklist</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Quick Add Inline creator */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
              {activeCreatorColId === 'BACKLOG' ? (
                <div className="space-y-2 bg-white p-2 rounded-xl border border-slate-150">
                  <Input 
                    value={inlineTitle}
                    onChange={(e) => setInlineTitle(e.target.value)}
                    placeholder="Enter card title..."
                    className="h-8 text-xs border-slate-200 rounded-lg focus-visible:ring-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateInline('BACKLOG')
                    }}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="h-7 text-[10px] px-3 bg-blue-600 text-white rounded-md" onClick={() => handleCreateInline('BACKLOG')}>Add</Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md" onClick={() => setActiveCreatorColId(null)}>
                      <X className="size-3.5 text-slate-400" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-8 text-[11px] font-semibold text-slate-500 hover:text-slate-800 justify-start gap-1.5 hover:bg-slate-100 rounded-lg"
                  onClick={() => {
                    setActiveCreatorColId('BACKLOG')
                    setInlineTitle('')
                  }}
                >
                  <Plus className="size-3.5" />
                  Add a card
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Small expand bar when Inbox is collapsed */
          <div className="w-10 shrink-0 border-r border-slate-100 bg-slate-50/20 flex flex-col items-center py-4 gap-2 cursor-pointer hover:bg-slate-50/50 transition-colors"
            onClick={() => setIsInboxOpen(true)}>
            <InboxIcon className="size-4.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest vertical-text mt-3">Inbox</span>
          </div>
        )}

        {/* PANEL 2: Collapsible Planner (Trello style) */}
        {isPlannerOpen ? (
          <div className="w-[300px] shrink-0 border-r border-slate-100 bg-slate-50/30 flex flex-col h-full animate-in slide-in-from-left duration-200">
            <div className="px-4.5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="size-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Weekly Planner</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => setIsPlannerOpen(false)}>
                <ChevronLeft className="size-4 text-slate-400 hover:text-slate-600" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Integration Card */}
                <div className="bg-slate-800 text-white rounded-xl p-4 shadow-sm relative overflow-hidden select-none">
                  <div className="relative z-10 space-y-2">
                    <p className="text-xs font-bold flex items-center gap-1.5"><Link2 className="size-3.5 text-blue-400" /> Calendar Sync</p>
                    <p className="text-[10px] leading-relaxed text-slate-300">Connect Google Calendar or Outlook to view your team milestones side-by-side.</p>
                    <Button size="sm" className="h-7 text-[10px] bg-blue-600 hover:bg-blue-700 text-white border-0 font-semibold rounded-lg px-3">Connect Account</Button>
                  </div>
                </div>

                {/* Days of current week schedule */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Schedule Milestones</p>
                  {weekDays.map((day) => {
                    // Find tasks due on this date (simple check matching date strings)
                    const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === day.dateString)

                    return (
                      <div key={day.dateString} className={`p-3 rounded-xl border transition-all ${day.isToday ? 'bg-blue-50/30 border-blue-200/50 shadow-sm' : 'bg-white border-slate-150'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold ${day.isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day.name} {day.dayNum}</span>
                          {day.isToday && <Badge className="text-[8px] font-bold bg-blue-600 text-white py-0 h-4 rounded">Today</Badge>}
                        </div>
                        
                        {dayTasks.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic">No tasks scheduled</p>
                        ) : (
                          <div className="space-y-1.5">
                            {dayTasks.map(t => (
                              <div key={t.id} onClick={() => onCardClick(t)} className="p-2 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100/50 transition-colors">
                                <p className="text-[11px] font-semibold text-slate-700 truncate">{t.title}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Small expand bar when Planner is collapsed */
          <div className="w-10 shrink-0 border-r border-slate-100 bg-slate-50/20 flex flex-col items-center py-4 gap-2 cursor-pointer hover:bg-slate-50/50 transition-colors"
            onClick={() => setIsPlannerOpen(true)}>
            <Calendar className="size-4.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest vertical-text mt-3">Planner</span>
          </div>
        )}

        {/* PANEL 3: Active Kanban Swimlanes (Bonsai style - Transparent columns, top border colors) */}
        <div className="flex-1 flex gap-5 p-5 overflow-x-auto min-h-0 bg-slate-50/10">
          {BOARD_COLUMNS.map((col) => {
            const colTasks = boardTasks.filter(t => t.status === col.id)
            const isDragOver = dragOverColId === col.id

            return (
              <div
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); if (dragOverColId !== col.id) setDragOverColId(col.id) }}
                onDragLeave={() => setDragOverColId(null)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`w-[270px] shrink-0 flex flex-col h-full rounded-2xl transition-all duration-200 ${
                  isDragOver ? 'bg-slate-100/60 border border-slate-200/50' : 'bg-transparent'
                }`}
              >
                {/* Column Header (Bonsai Style: Colored top border, transparent columns) */}
                <div className={`px-2.5 py-3 flex items-center justify-between shrink-0 ${col.topBorder} rounded-t-lg bg-white/40 mb-3 border-b border-slate-100/60`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 tracking-tight">{col.label}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100/60 text-[9px] font-bold text-slate-500 tabular-nums">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Body */}
                <ScrollArea className="flex-1">
                  <div className="px-1 py-1 space-y-3 min-h-[200px]">
                    {isDragOver && (
                      <div className="h-16 border-2 border-dashed border-blue-500/20 bg-blue-50/10 rounded-xl flex items-center justify-center text-xs text-blue-600 font-semibold animate-pulse">
                        Drop here
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
                          className="group p-4.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5"
                        >
                          {/* Key + Priority */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[9px] text-slate-400 font-bold bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">{task.issueKey}</span>
                            <div className={`p-1 rounded-lg border ${priorityInfo.color} flex items-center justify-center`} title={`${priorityInfo.label} Priority`}>
                              <PriorityIcon className="size-3 shrink-0" />
                            </div>
                          </div>

                          {/* Title */}
                          <p className="text-[13px] font-semibold leading-relaxed text-slate-850 line-clamp-2 mb-3">
                            {task.title}
                          </p>

                          {/* Checklist */}
                          {checklist.total > 0 && (
                            <div className="mb-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <CheckSquare className="size-3 text-blue-500" /> Checklist
                                </span>
                                <span>{checklist.done}/{checklist.total}</span>
                              </div>
                              <Progress value={checklist.percentage} className="h-1 bg-slate-100" />
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
                            {task.subTeam ? (
                              <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600 border-slate-150 px-2 py-0.5 h-5 font-bold rounded-lg">{task.subTeam.name}</Badge>
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

                {/* Trello Column Inline Creator */}
                <div className="pt-2 shrink-0 bg-transparent">
                  {activeCreatorColId === col.id ? (
                    <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-200">
                      <Input 
                        value={inlineTitle}
                        onChange={(e) => setInlineTitle(e.target.value)}
                        placeholder="Enter card title..."
                        className="h-8.5 text-xs border-slate-200 rounded-lg focus-visible:ring-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateInline(col.id)
                        }}
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="h-8 text-[10px] px-4.5 bg-blue-600 text-white rounded-lg font-bold" onClick={() => handleCreateInline(col.id)}>Add Card</Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setActiveCreatorColId(null)}>
                          <X className="size-4 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full h-9 text-[11px] font-bold text-slate-500 hover:text-slate-800 justify-start gap-1.5 hover:bg-slate-100 rounded-xl"
                      onClick={() => {
                        setActiveCreatorColId(col.id)
                        setInlineTitle('')
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add a card
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
