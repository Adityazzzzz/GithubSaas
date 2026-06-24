import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Calendar,
  ChevronDown,
  ChevronRight,
  Play,
  Check,
  CalendarRange,
} from 'lucide-react'
import { STATUS_CONFIG } from './types'
import type { PriorityType } from './types'

interface BacklogViewProps {
  sprints: any[]
  tasks: any[]
  onCardClick: (task: any) => void
  onNewSprintClick: () => void
  onStartSprint: (sprintId: string) => void
  onCompleteSprint: (sprintId: string) => void
  onAssignTaskToSprint: (taskId: string, sprintId: string | null) => void
}

export function BacklogView({
  sprints,
  tasks,
  onCardClick,
  onNewSprintClick,
  onStartSprint,
  onCompleteSprint,
  onAssignTaskToSprint,
}: BacklogViewProps) {
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({})

  const toggleSprintExpand = (id: string) => {
    setExpandedSprints(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const unassignedTasks = tasks.filter(t => !t.sprintId)

  return (
    <div className="h-full flex bg-slate-50/20 select-none">
      {/* Left: Sprints */}
      <div className="flex-1 border-r border-slate-100 flex flex-col bg-white">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Sprint Planner</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Plan and schedule your sprints</p>
          </div>
          <Button size="sm" variant="outline" className="h-9 gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl" onClick={onNewSprintClick}>
            <Plus className="size-4" /> New Sprint
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-4">
            {sprints.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                <Calendar className="size-8 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No sprints created yet</p>
                <p className="text-xs text-slate-400 mt-1">Create a new sprint to organize and schedule your tasks.</p>
              </div>
            )}
            {sprints.map(sprint => {
              const sprintTasks = tasks.filter(t => t.sprintId === sprint.id)
              const doneTasks = sprintTasks.filter(t => t.status === 'DONE')
              const percent = sprintTasks.length > 0 ? Math.round((doneTasks.length / sprintTasks.length) * 100) : 0
              const isExpanded = expandedSprints[sprint.id] ?? false

              return (
                <Card key={sprint.id} className="overflow-hidden border border-slate-100 shadow-sm rounded-xl hover:border-slate-200 transition-all duration-200">
                  <CardHeader className="p-4.5 pb-4 bg-slate-50/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleSprintExpand(sprint.id)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </button>
                        <CardTitle className="text-sm font-semibold text-slate-800">{sprint.name}</CardTitle>
                        <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          sprint.status === 'ACTIVE' 
                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                            : sprint.status === 'COMPLETED' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {sprint.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {sprint.status === 'PLANNED' && (
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg font-semibold transition-all"
                            onClick={() => onStartSprint(sprint.id)}>
                            <Play className="size-3" /> Start Sprint
                          </Button>
                        )}
                        {sprint.status === 'ACTIVE' && (
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded-lg font-semibold transition-all"
                            onClick={() => onCompleteSprint(sprint.id)}>
                            <Check className="size-3" /> Complete Sprint
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                        <span>{doneTasks.length} of {sprintTasks.length} issues completed</span>
                        <span className="font-semibold text-slate-700">{percent}%</span>
                      </div>
                      <Progress value={percent} className="h-1.5 bg-slate-100" />
                      {sprint.startDate && (
                        <div className="pt-2 text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                          <CalendarRange className="size-3.5 text-slate-400" />
                          <span>
                            {new Date(sprint.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' — '}
                            {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No end date'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="p-0 border-t border-slate-100 divide-y divide-slate-100">
                      {sprintTasks.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 font-medium">
                          No tasks in this sprint. Drag tasks or assign them below.
                        </div>
                      ) : (
                        sprintTasks.map((task) => {
                          const statusInfo = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.BACKLOG!
                          return (
                            <div key={task.id}
                              className="flex items-center gap-3 px-4.5 py-3 hover:bg-slate-50/50 cursor-pointer transition-colors"
                              onClick={() => onCardClick(task)}>
                              <span className={`size-1.5 rounded-full shrink-0 ${statusInfo.dot}`} />
                              <span className="font-mono text-[10px] text-slate-400 font-bold w-16 shrink-0 bg-slate-50 border border-slate-100/50 px-1 py-0.5 rounded text-center">{task.issueKey}</span>
                              <span className="text-xs font-semibold text-slate-700 truncate flex-1">{task.title}</span>
                              <Badge variant="outline" className={`text-[9px] font-bold h-5 px-2 rounded-lg ${statusInfo.color}`}>{statusInfo.label}</Badge>
                            </div>
                          )
                        })
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Backlog */}
      <div className="w-[420px] flex flex-col shrink-0 bg-slate-50/30">
        <div className="px-6 py-4.5 border-b border-slate-100 bg-white shrink-0">
          <h3 className="text-sm font-semibold text-slate-800">Unassigned Backlog</h3>
          <p className="text-[11px] font-medium text-slate-400 mt-1">{unassignedTasks.length} issues not assigned to any sprint</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {unassignedTasks.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No unassigned issues
              </div>
            )}
            {unassignedTasks.map(task => {
              const statusInfo = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.BACKLOG!
              return (
                <div key={task.id} className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl hover:shadow-sm hover:border-slate-200 cursor-pointer transition-all"
                  onClick={() => onCardClick(task)}>
                  <span className={`size-1.5 rounded-full shrink-0 ${statusInfo.dot}`} />
                  <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{task.issueKey}</span>
                  <span className="text-xs font-semibold text-slate-700 truncate flex-1">{task.title}</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={task.sprintId ?? 'none'}
                      onValueChange={(val) => {
                        const nextSprintId = val === 'none' ? null : val
                        onAssignTaskToSprint(task.id, nextSprintId)
                      }}>
                      <SelectTrigger className="h-8 w-[110px] text-[10px] bg-slate-50 border-slate-100 rounded-lg hover:bg-slate-100/50 transition-all font-semibold"><SelectValue placeholder="Sprint" /></SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="none" className="text-xs">Backlog</SelectItem>
                        {sprints.filter(s => s.status !== 'COMPLETED').map(s =>
                          <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
