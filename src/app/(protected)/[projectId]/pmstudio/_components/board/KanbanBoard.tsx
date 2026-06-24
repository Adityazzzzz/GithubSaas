import React, { useState } from 'react'
import { BoardFilters } from './BoardFilters'
import { KanbanColumn } from './KanbanColumn'
import { BOARD_COLUMNS } from '../types'
import type { PriorityType } from '../types'

interface KanbanBoardProps {
  tasks: any[]
  teams: any[]
  members: any[]
  sprints: any[]
  filterSprint: string
  setFilterSprint: (s: string) => void
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
  onCardClick: (task: any) => void
  onNewIssueClick: () => void
  onNewSprintClick?: () => void
}

export function KanbanBoard({
  tasks,
  teams,
  members,
  sprints,
  filterSprint,
  setFilterSprint,
  onUpdateTaskStatus,
  onCreateTaskInline,
  onCardClick,
  onNewIssueClick,
  onNewSprintClick
}: KanbanBoardProps) {
  const [filterTeam, setFilterTeam] = useState<string>('ALL')
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL')
  const [filterPriority, setFilterPriority] = useState<string>('ALL')
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)

  const filteredTasks = tasks.filter(task => {
    const teamMatch = filterTeam === 'ALL' || task.subTeamId === filterTeam
    const assigneeMatch = filterAssignee === 'ALL' || task.assigneeId === filterAssignee
    const priorityMatch = filterPriority === 'ALL' || task.priority === filterPriority
    const sprintMatch = filterSprint === 'ALL' || task.sprintId === filterSprint
    return teamMatch && assigneeMatch && priorityMatch && sprintMatch
  })

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

  const handleCreateTaskInline = (status: string, title: string) => {
    onCreateTaskInline(title, null, 'MEDIUM', null, null, null, status)
  }

  return (
    <div className="h-full flex flex-col bg-background select-none">
      <BoardFilters 
        teams={teams}
        members={members}
        sprints={sprints}
        filterSprint={filterSprint}
        setFilterSprint={setFilterSprint}
        filterTeam={filterTeam}
        setFilterTeam={setFilterTeam}
        filterAssignee={filterAssignee}
        setFilterAssignee={setFilterAssignee}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        onNewIssueClick={onNewIssueClick}
        onNewSprintClick={onNewSprintClick}
      />

      <div className="flex-1 flex gap-5 p-5 overflow-x-auto min-h-0 items-start">
        {BOARD_COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id)

          return (
            <KanbanColumn 
              key={col.id}
              col={col}
              tasks={colTasks}
              dragOverColId={dragOverColId}
              setDragOverColId={setDragOverColId}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onCardClick={onCardClick}
              onCreateTaskInline={handleCreateTaskInline}
            />
          )
        })}
      </div>
    </div>
  )
}
