'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/trpc/react'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Import Subcomponents
import type { TabType, PriorityType } from './_components/types'
import { KanbanBoard } from './_components/board/KanbanBoard'
import { CalendarView } from './_components/calendar/CalendarView'
import { TeamsView } from './_components/TeamsView'
import { AutomationsView } from './_components/AutomationsView'
import { AnalyticsView } from './_components/AnalyticsView'
import { TaskDetailSheet } from './_components/TaskDetailSheet'
import { CreateTaskDialog } from './_components/CreateTaskDialog'
import { CreateSprintDialog } from './_components/CreateSprintDialog'

export default function DynamicPmStudioPage() {
  const params = useParams()
  const projectId = params.projectId as string

  // Board Filter State
  const [filterTeam, setFilterTeam] = useState<string>('ALL')
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL')
  const [filterPriority, setFilterPriority] = useState<string>('ALL')
  const [filterSprint, setFilterSprint] = useState<string>('ALL')

  // Modals & Sheets State
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const [defaultDueDate, setDefaultDueDate] = useState<Date | null>(null)
  
  // Create Team Input State
  const [newTeamName, setNewTeamName] = useState('')

  const utils = api.useUtils()

  /* ─── Queries ─────────────────────────────────────────────────────────── */
  const { data: project } = api.project.getProjects.useQuery(
    undefined, 
    { 
      select: (projects) => projects.find(p => p.id === projectId),
      enabled: !!projectId 
    }
  )

  const { data: tasks = [], isLoading: tasksLoading } = api.pm.getTasks.useQuery(
    { projectId }, { enabled: !!projectId }
  )
  const sprintsQuery = api.pm.getSprints.useQuery(
    { projectId }, { enabled: !!projectId }
  )
  const sprints = sprintsQuery.data ?? []
  const { data: teams = [] } = api.pm.getSubTeams.useQuery(
    { projectId }, { enabled: !!projectId }
  )
  const { data: members = [] } = api.pm.getMembers.useQuery(
    { projectId }, { enabled: !!projectId }
  )
  const { data: automations = [] } = api.pm.getAutomations.useQuery(
    { projectId }, { enabled: !!projectId }
  )
  const { data: analytics } = api.pm.getAnalytics.useQuery(
    { projectId }, { enabled: !!projectId }
  )
  const { data: comments = [], refetch: refetchComments } = api.pm.getComments.useQuery(
    { taskId: selectedTask?.id ?? '' }, { enabled: !!selectedTask?.id }
  )
  // Auto-select active sprint on load
  React.useEffect(() => {
    if (sprints.length > 0 && filterSprint === 'ALL') {
      const active = sprints.find(s => s.status === 'ACTIVE')
      if (active) {
        setFilterSprint(active.id)
      }
    }
  }, [sprints])

  /* ─── Mutations ───────────────────────────────────────────────────────── */
  const createTask = api.pm.createTask.useMutation({
    onSuccess: () => {
      utils.pm.getTasks.invalidate({ projectId })
      utils.pm.getAnalytics.invalidate({ projectId })
      toast.success('Task created successfully')
      setIsCreateTaskOpen(false)
    }
  })

  const updateTaskStatus = api.pm.updateTaskStatus.useMutation({
    onSuccess: () => {
      utils.pm.getTasks.invalidate({ projectId })
      utils.pm.getAnalytics.invalidate({ projectId })
    }
  })

  const updateTaskDetails = api.pm.updateTaskDetails.useMutation({
    onSuccess: (data) => {
      utils.pm.getTasks.invalidate({ projectId })
      utils.pm.getAnalytics.invalidate({ projectId })
      
      // Update selectedTask if it is currently being inspected
      if (selectedTask?.id === data.id) {
        setSelectedTask(data)
      }
      toast.success('Task updated')
    }
  })

  const deleteTask = api.pm.deleteTask.useMutation({
    onSuccess: () => {
      utils.pm.getTasks.invalidate({ projectId })
      utils.pm.getAnalytics.invalidate({ projectId })
      setSelectedTask(null)
      toast.success('Task deleted')
    }
  })

  const createSprintMutation = api.pm.createSprint.useMutation({
    onSuccess: () => {
      utils.pm.getSprints.invalidate({ projectId })
      toast.success('Sprint created')
      setIsCreateSprintOpen(false)
    }
  })

  const updateSprintStatusMutation = api.pm.updateSprintStatus.useMutation({
    onSuccess: () => {
      utils.pm.getSprints.invalidate({ projectId })
      utils.pm.getTasks.invalidate({ projectId })
      utils.pm.getAnalytics.invalidate({ projectId })
      toast.success('Sprint status updated')
    }
  })

  const createSubTeamMutation = api.pm.createSubTeam.useMutation({
    onSuccess: () => {
      utils.pm.getSubTeams.invalidate({ projectId })
      toast.success('Team created')
      setNewTeamName('')
    }
  })

  const updateSubTeamMutation = api.pm.updateSubTeam.useMutation({
    onSuccess: () => {
      utils.pm.getSubTeams.invalidate({ projectId })
      toast.success('Team updated')
    }
  })

  const deleteSubTeamMutation = api.pm.deleteSubTeam.useMutation({
    onSuccess: () => {
      utils.pm.getSubTeams.invalidate({ projectId })
      toast.success('Team deleted')
    }
  })

  const addCommentMutation = api.pm.addComment.useMutation({
    onSuccess: () => { 
      refetchComments()
    }
  })

  const createAutomationMutation = api.pm.createAutomationRule.useMutation({
    onSuccess: () => {
      utils.pm.getAutomations.invalidate({ projectId })
      toast.success('Automation rule saved')
    }
  })

  const toggleAutomationMutation = api.pm.toggleAutomationRule.useMutation({
    onSuccess: () => { 
      utils.pm.getAutomations.invalidate({ projectId }) 
    }
  })

  const deleteAutomationMutation = api.pm.deleteAutomationRule.useMutation({
    onSuccess: () => {
      utils.pm.getAutomations.invalidate({ projectId })
      toast.success('Automation rule deleted')
    }
  })

  if (!projectId) return <NoProjectPlaceholder />
  if (!project && !tasksLoading) return <NoProjectPlaceholder />

  const activeSprint = sprints.find(s => s.status === 'ACTIVE')

  /* ─── Actions & Callbacks ─────────────────────────────────────────────── */
  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    const previousTasks = utils.pm.getTasks.getData({ projectId })
    if (previousTasks) {
      utils.pm.getTasks.setData({ projectId }, previousTasks.map(t => t.id === taskId ? { ...t, status } : t))
    }
    try { 
      await updateTaskStatus.mutateAsync({ taskId, status }) 
    } catch { 
      toast.error('Failed to move task')
      utils.pm.getTasks.invalidate({ projectId }) 
    }
  }

  const handleAssignTaskToSprint = (taskId: string, sprintId: string | null) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      updateTaskDetails.mutate({
        taskId,
        title: task.title,
        description: task.description,
        priority: task.priority as PriorityType,
        sprintId,
        subTeamId: task.subTeamId,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      })
    }
  }

  const handleUpdateTaskDetails = (taskId: string, fields: any) => {
    updateTaskDetails.mutate({
      taskId,
      title: fields.title,
      description: fields.description,
      priority: fields.priority,
      sprintId: fields.sprintId,
      subTeamId: fields.subTeamId,
      assigneeId: fields.assigneeId,
      dueDate: fields.dueDate ? new Date(fields.dueDate) : null,
      startDate: fields.startDate ? new Date(fields.startDate) : null,
    })
  }

  const handleCreateTask = (
    title: string,
    description: string | null,
    priority: PriorityType,
    sprintId: string | null,
    subTeamId: string | null,
    assigneeId: string | null,
    status?: string,
    dueDate?: Date | null,
    startDate?: Date | null
  ) => {
    createTask.mutate({
      projectId,
      title,
      description: description || undefined,
      priority,
      sprintId: sprintId || undefined,
      subTeamId: subTeamId || undefined,
      assigneeId: assigneeId || undefined,
      status: status || undefined,
      dueDate: dueDate || undefined,
      startDate: startDate || undefined,
    })
  }

  const handleCreateSprint = (name: string, startDate: Date, endDate: Date) => {
    createSprintMutation.mutate({
      projectId,
      name,
      startDate,
      endDate,
    })
  }

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      createSubTeamMutation.mutate({ projectId, name: newTeamName.trim() })
    }
  }

  const handleSaveAutomationRule = (trigger: string, action: string) => {
    createAutomationMutation.mutate({
      projectId,
      trigger,
      action,
    })
  }

  const handleToggleAutomationRule = (ruleId: string, isActive: boolean) => {
    toggleAutomationMutation.mutate({
      ruleId,
      isActive,
    })
  }

  const handleAddComment = (taskId: string, text: string) => {
    addCommentMutation.mutate({
      taskId,
      text,
    })
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none">
      
      {/* Title & Tab Bar */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{project?.name} PM Studio</h1>
          {activeSprint ? (
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg px-2.5 py-0.5">
              Active: {activeSprint.name}
            </span>
          ) : (
            <span className="text-sm font-medium text-muted-foreground bg-muted border border-border rounded-lg px-2.5 py-0.5">
              No active sprint
            </span>
          )}
        </div>
      </div>

      <Tabs defaultValue="board" className="w-full flex-1 flex flex-col">
        <TabsList className="w-fit bg-muted p-1 rounded-xl mb-4 border border-border">
          <TabsTrigger value="board" className="text-sm font-semibold rounded-lg px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Board</TabsTrigger>
          <TabsTrigger value="calendar" className="text-sm font-semibold rounded-lg px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Calendar</TabsTrigger>
          <TabsTrigger value="teams" className="text-sm font-semibold rounded-lg px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Teams</TabsTrigger>
          <TabsTrigger value="automations" className="text-sm font-semibold rounded-lg px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Automations</TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm font-semibold rounded-lg px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="flex-1 min-h-0 border-t border-border mt-0 data-[state=active]:flex data-[state=active]:flex-col">
          <KanbanBoard 
            tasks={tasks}
            teams={teams}
            members={members}
            sprints={sprints}
            filterSprint={filterSprint}
            setFilterSprint={setFilterSprint}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onCreateTaskInline={handleCreateTask}
            onCardClick={setSelectedTask}
            onNewIssueClick={() => setIsCreateTaskOpen(true)}
            onNewSprintClick={() => setIsCreateSprintOpen(true)}
          />
        </TabsContent>

        <TabsContent value="calendar" className="flex-1 min-h-0 border-t border-border mt-0 data-[state=active]:flex data-[state=active]:flex-col">
          <CalendarView 
            tasks={tasks}
            teams={teams}
            members={members}
            onCardClick={setSelectedTask}
            onNewIssueClick={(date) => {
              setDefaultDueDate(date || null)
              setIsCreateTaskOpen(true)
            }}
            onCreateLoomSyncTask={(title, description, subTeamId) => {
              handleCreateTask(title, description, "LOW", null, subTeamId, null, "TODO", new Date(), new Date())
            }}
          />
        </TabsContent>
        
        <TabsContent value="teams" className="flex-1 min-h-0 border-t border-border mt-0">
          <TeamsView 
            teams={teams}
            tasks={tasks}
            members={members}
            newTeamName={newTeamName}
            setNewTeamName={setNewTeamName}
            onCreateTeam={handleCreateTeam}
            isCreatingTeam={createSubTeamMutation.isPending}
            onUpdateTeam={(id, name) => updateSubTeamMutation.mutate({ subTeamId: id, name })}
            onDeleteTeam={(id) => deleteSubTeamMutation.mutate({ subTeamId: id })}
            onCreatePlaceholderTask={(assigneeId, subTeamId) => handleCreateTask("Onboarding Placeholder", "Placeholder task created automatically when adding this member to the sub-team.", "LOW", null, subTeamId, assigneeId, "TODO")}
            onCardClick={setSelectedTask}
          />
        </TabsContent>

        <TabsContent value="automations" className="flex-1 min-h-0 border-t border-border mt-0">
          <AutomationsView 
            automations={automations}
            onSaveRule={handleSaveAutomationRule}
            onToggleRule={handleToggleAutomationRule}
            onDeleteRule={(ruleId) => deleteAutomationMutation.mutate({ ruleId })}
            members={members}
            teams={teams}
          />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 min-h-0 border-t border-border mt-0">
          <AnalyticsView 
            tasks={tasks}
            activeSprintName={activeSprint?.name ?? null}
            analytics={analytics}
          />
        </TabsContent>
      </Tabs>

      {/* Detail Sheet & Modals */}
      <TaskDetailSheet 
        selectedTask={selectedTask}
        onClose={() => setSelectedTask(null)}
        onDelete={(id) => deleteTask.mutate({ taskId: id })}
        onUpdateTaskDetails={handleUpdateTaskDetails}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        comments={comments}
        onAddComment={handleAddComment}
        isAddingComment={addCommentMutation.isPending}
        members={members}
        sprints={sprints}
        teams={teams}
      />

      <CreateTaskDialog 
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false)
          setDefaultDueDate(null)
        }}
        onCreateTask={handleCreateTask}
        isCreating={createTask.isPending}
        members={members}
        sprints={sprints}
        teams={teams}
        defaultDueDate={defaultDueDate}
      />

      <CreateSprintDialog 
        isOpen={isCreateSprintOpen}
        onClose={() => setIsCreateSprintOpen(false)}
        onCreateSprint={handleCreateSprint}
        isCreating={createSprintMutation.isPending}
      />
    </div>
  )
}
