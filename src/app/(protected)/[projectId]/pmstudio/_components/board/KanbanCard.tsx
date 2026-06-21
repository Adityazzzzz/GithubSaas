import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckSquare, User } from 'lucide-react'
import { PRIORITY_CONFIG, getInitials, getUserName } from '../types'
import type { PriorityType } from '../types'

interface KanbanCardProps {
  task: any
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onClick: (task: any) => void
}

export function KanbanCard({ task, onDragStart, onClick }: KanbanCardProps) {
  const priorityInfo = PRIORITY_CONFIG[task.priority as PriorityType] || PRIORITY_CONFIG.MEDIUM
  const PriorityIcon = priorityInfo.icon

  const getChecklistStats = (description: string | null) => {
    if (!description) return { total: 0, done: 0, percentage: 0 }
    const totalMatches = description.match(/- \[[ xX]\]/g) || []
    const doneMatches = description.match(/- \[[xX]\]/g) || []
    const total = totalMatches.length
    const done = doneMatches.length
    return { total, done, percentage: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  const checklist = getChecklistStats(task.description)

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick(task)}
      className="group p-3.5 bg-card border border-border rounded-lg shadow-sm cursor-pointer hover:shadow-md hover:border-muted-foreground/30 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-muted-foreground font-bold bg-muted/50 border border-border/50 px-1.5 py-0.5 rounded">{task.issueKey}</span>
        <div className={`p-1 rounded-lg border ${priorityInfo.color} flex items-center justify-center`} title={`${priorityInfo.label} Priority`}>
          <PriorityIcon className="size-3 shrink-0" />
        </div>
      </div>

      <p className="text-sm font-semibold leading-relaxed text-foreground line-clamp-2 mb-3">
        {task.title}
      </p>

      {checklist.total > 0 && (
        <div className="mb-3 bg-muted/30 p-2.5 rounded-xl border border-border/50">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1.5">
              <CheckSquare className="size-3 text-blue-500" /> Checklist
            </span>
            <span>{checklist.done}/{checklist.total}</span>
          </div>
          <Progress value={checklist.percentage} className="h-1 bg-muted" />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
        {task.subTeam ? (
          <Badge variant="outline" className="text-[10px] bg-muted/50 text-secondary-foreground border-border/50 px-2 py-0.5 h-5 font-bold rounded-lg">{task.subTeam.name}</Badge>
        ) : (
          <span />
        )}
        {task.assignee ? (
          <div className="size-6 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 shadow-sm" title={getUserName(task.assignee)}>
            {getInitials(task.assignee)}
          </div>
        ) : (
          <div className="size-6 rounded-full bg-muted border border-border flex items-center justify-center" title="Unassigned">
            <User className="size-3 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}
