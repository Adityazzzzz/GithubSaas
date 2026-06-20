'use client'

import React, { useState } from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Kanban, Calendar, Users, Settings, BarChart3, ArrowLeft, Plus, Trash2,
  Clock, CheckCircle2, AlertTriangle, Circle, RefreshCw, Play, Check,
  MessageSquare, User, Tag, CalendarRange, Sparkles, FolderKanban
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts'

type TabType = 'board' | 'backlog' | 'teams' | 'automations' | 'analytics'
type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

const PRIORITY_COLORS = {
  LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
} as const

const BOARD_COLUMNS = [
  { id: 'BACKLOG', label: 'Backlog', color: 'border-slate-500/30' },
  { id: 'TODO', label: 'To Do', color: 'border-blue-500/30' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-yellow-500/30' },
  { id: 'REVIEW', label: 'In Review', color: 'border-purple-500/30' },
  { id: 'DONE', label: 'Done', color: 'border-emerald-500/30' },
]

export default function PmStudioPage() {
  const { project, projectId } = useProject()
  const [activeTab, setActiveTab] = useState<TabType>('board')
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL')

  // Modals / Detail drawer
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)

  // Creation form states
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityType>('MEDIUM')
  const [newTaskSprint, setNewTaskSprint] = useState<string>('')
  const [newTaskTeam, setNewTaskTeam] = useState<string>('')
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('')

  const [newSprintName, setNewSprintName] = useState('')
  const [newSprintStart, setNewSprintStart] = useState('')
  const [newSprintEnd, setNewSprintEnd] = useState('')

  const [newTeamName, setNewTeamName] = useState('')
  const [newCommentText, setNewCommentText] = useState('')

  const utils = api.useUtils()

  // Queries
  const { data: tasks = [], isLoading: tasksLoading } = api.pm.getTasks.useQuery(
    { projectId },
    { enabled: !!projectId }
  )
  const { data: sprints = [] } = api.pm.getSprints.useQuery(
    { projectId },
    { enabled: !!projectId }
  )
  const { data: teams = [] } = api.pm.getSubTeams.useQuery(
    { projectId },
    { enabled: !!projectId }
  )
  const { data: members = [] } = api.pm.getMembers.useQuery(
    { projectId },
    { enabled: !!projectId }
  )
  const { data: automations = [] } = api.pm.getAutomations.useQuery(
    { projectId },
    { enabled: !!projectId }
  )
  const { data: analytics } = api.pm.getAnalytics.useQuery(
    { projectId },
    { enabled: !!projectId && activeTab === 'analytics' }
  )
  const { data: comments = [], refetch: refetchComments } = api.pm.getComments.useQuery(
    { taskId: selectedTask?.id ?? '' },
    { enabled: !!selectedTask?.id }
  )

  // Mutations
  const createTask = api.pm.createTask.useMutation({
    onSuccess: () => {
      utils.pm.getTasks.invalidate({ projectId })
      utils.pm.getAnalytics.invalidate({ projectId })
      toast.success('Task created successfully')
      setIsCreateTaskOpen(false)
      resetTaskForm()
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
      setSelectedTask(data)
      toast.success('Task details updated')
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

  const createSprint = api.pm.createSprint.useMutation({
    onSuccess: () => {
      utils.pm.getSprints.invalidate({ projectId })
      toast.success('Sprint created')
      setIsCreateSprintOpen(false)
      setNewSprintName('')
      setNewSprintStart('')
      setNewSprintEnd('')
    }
  })

  const updateSprintStatus = api.pm.updateSprintStatus.useMutation({
    onSuccess: () => {
      utils.pm.getSprints.invalidate({ projectId })
      utils.pm.getTasks.invalidate({ projectId })
      utils.pm.getAnalytics.invalidate({ projectId })
      toast.success('Sprint status updated')
    }
  })

  const createSubTeam = api.pm.createSubTeam.useMutation({
    onSuccess: () => {
      utils.pm.getSubTeams.invalidate({ projectId })
      toast.success('Sub-team created')
      setIsCreateTeamOpen(false)
      setNewTeamName('')
    }
  })

  const addComment = api.pm.addComment.useMutation({
    onSuccess: () => {
      refetchComments()
      setNewCommentText('')
    }
  })

  const createAutomation = api.pm.createAutomationRule.useMutation({
    onSuccess: () => {
      utils.pm.getAutomations.invalidate({ projectId })
      toast.success('Automation rule saved')
    }
  })

  const toggleAutomation = api.pm.toggleAutomationRule.useMutation({
    onSuccess: () => {
      utils.pm.getAutomations.invalidate({ projectId })
    }
  })

  const syncGit = api.pm.syncCommitsAndPRs.useMutation({
    onSuccess: (data) => {
      utils.pm.getTasks.invalidate({ projectId })
      utils.pm.getAnalytics.invalidate({ projectId })
      toast.success(data.message)
    },
    onError: () => {
      toast.error('Sync failed')
    }
  })

  if (!project) return <NoProjectPlaceholder />

  const activeSprint = sprints.find(s => s.status === 'ACTIVE')

  const resetTaskForm = () => {
    setNewTaskTitle('')
    setNewTaskDesc('')
    setNewTaskPriority('MEDIUM')
    setNewTaskSprint('')
    setNewTaskTeam('')
    setNewTaskAssignee('')
  }

  // native HTML5 drag events
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (!taskId) return

    // Optimistic UI update
    const previousTasks = utils.pm.getTasks.getData({ projectId })
    if (previousTasks) {
      const updated = previousTasks.map(t => t.id === taskId ? { ...t, status } : t)
      utils.pm.getTasks.setData({ projectId }, updated)
    }

    try {
      await updateTaskStatus.mutateAsync({ taskId, status })
    } catch {
      toast.error('Failed to move task')
      utils.pm.getTasks.invalidate({ projectId })
    }
  }

  const filteredTasks = tasks.filter(task => {
    const teamMatch = selectedTeamFilter === 'ALL' || task.subTeamId === selectedTeamFilter
    return teamMatch
  })

  const getInitials = (user: any) => {
    if (!user) return '?'
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`
    if (user.firstName) return user.firstName[0]
    return user.emailAddress ? user.emailAddress[0].toUpperCase() : '?'
  }

  const handleSaveTaskDetails = () => {
    if (!selectedTask) return
    updateTaskDetails.mutate({
      taskId: selectedTask.id,
      title: selectedTask.title,
      description: selectedTask.description,
      priority: selectedTask.priority,
      sprintId: selectedTask.sprintId,
      subTeamId: selectedTask.subTeamId,
      assigneeId: selectedTask.assigneeId,
      dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
    })
  }

  return (
    <div className="flex h-screen w-screen bg-[#060a12] text-slate-100 overflow-hidden font-sans">
      {/* ─── Immersive Sidebar ────────────────────────────────────────────────── */}
      <div className="w-64 border-r border-slate-800 bg-[#090f1d] flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="p-2 rounded-xl bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <FolderKanban className="size-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-slate-200">GitBrain PM</h1>
            <p className="text-[10px] text-cyan-400 font-mono">Workspace Studio</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('board')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === 'board' ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
          >
            <Kanban className="size-4" />
            Active Board
          </button>
          <button
            onClick={() => setActiveTab('backlog')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === 'backlog' ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
          >
            <Calendar className="size-4" />
            Backlog & Sprints
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === 'teams' ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
          >
            <Users className="size-4" />
            Sub-teams
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === 'automations' ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
          >
            <Settings className="size-4" />
            Automations
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === 'analytics' ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
          >
            <BarChart3 className="size-4" />
            Analytics
          </button>
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <Button
            asChild
            variant="ghost"
            className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 justify-start gap-3 rounded-xl py-5"
          >
            <a href="/dashboard">
              <ArrowLeft className="size-4" />
              <span className="text-xs font-semibold">Back to Code Hub</span>
            </a>
          </Button>
        </div>
      </div>

      {/* ─── Main Content Cockpit ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-[#090f1d] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-200">{project.name}</span>
            <div className="h-4 w-px bg-slate-800"></div>
            {activeSprint ? (
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] py-0.5 px-2">
                Active Sprint: {activeSprint.name}
              </Badge>
            ) : (
              <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] py-0.5 px-2">
                No Active Sprint
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => syncGit.mutate({ projectId })}
              disabled={syncGit.isPending}
              variant="outline"
              className="border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-xs gap-2 py-4 h-9 shadow-sm"
            >
              <RefreshCw className={`size-3.5 ${syncGit.isPending ? 'animate-spin text-cyan-400' : ''}`} />
              Sync Git & Automations
            </Button>
          </div>
        </header>

        {/* Tab Router Container */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'board' && (
            <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden">
              {/* Board controls */}
              <div className="flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Team Filter:</span>
                  <select
                    value={selectedTeamFilter}
                    onChange={(e) => setSelectedTeamFilter(e.target.value)}
                    className="bg-slate-900/80 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500/50 outline-none text-slate-200 cursor-pointer"
                  >
                    <option value="ALL">All Teams</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-semibold text-xs shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-lg"
                >
                  <Plus className="size-3.5 mr-1" /> Create Task
                </Button>
              </div>

              {/* Columns grid */}
              <div className="flex-1 grid grid-cols-5 gap-4 overflow-hidden min-h-0">
                {BOARD_COLUMNS.map(col => {
                  const colTasks = filteredTasks.filter(t => t.status === col.id)
                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, col.id)}
                      className="flex flex-col h-full bg-[#080d19]/40 border border-slate-800/80 rounded-xl overflow-hidden"
                    >
                      <div className={`p-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#090f1d]/50`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">{col.label}</span>
                          <Badge className="bg-slate-800 text-slate-400 hover:bg-slate-800 text-[10px] px-1.5 py-0">
                            {colTasks.length}
                          </Badge>
                        </div>
                      </div>

                      <ScrollArea className="flex-1 p-2 bg-[#060a12]/30">
                        <div className="space-y-2 pb-6 min-h-[300px]">
                          {colTasks.map(task => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onClick={() => setSelectedTask(task)}
                              className="group p-3 border border-slate-800/80 bg-slate-900/60 hover:bg-[#0c1324] hover:border-cyan-500/30 rounded-xl cursor-pointer transition-all shadow-sm select-none"
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="font-mono text-[9px] text-cyan-400 font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/30">
                                  {task.issueKey}
                                </span>
                                <Badge className={`text-[9px] font-semibold border px-1.5 py-0 ${PRIORITY_COLORS[task.priority as PriorityType]}`}>
                                  {task.priority}
                                </Badge>
                              </div>

                              <p className="text-xs text-slate-200 font-medium line-clamp-2 mb-3">
                                {task.title}
                              </p>

                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex gap-1 items-center">
                                  {task.subTeam && (
                                    <span className="text-[9px] text-cyan-400/80 border border-cyan-950 bg-cyan-950/20 px-1 py-0.2 rounded font-medium">
                                      {task.subTeam.name}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center shrink-0">
                                  {task.assignee ? (
                                    <div
                                      className="size-5 rounded-full border border-slate-700 bg-cyan-800/40 flex items-center justify-center text-[8px] font-bold text-cyan-300"
                                      title={`${task.assignee.firstName ?? ''} ${task.assignee.lastName ?? ''}`}
                                    >
                                      {getInitials(task.assignee)}
                                    </div>
                                  ) : (
                                    <div className="size-5 rounded-full border border-dashed border-slate-800 flex items-center justify-center text-slate-600">
                                      <User className="size-2.5" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'backlog' && (
            <div className="h-full flex p-6 gap-6 overflow-hidden">
              {/* Left Column: Sprints list */}
              <div className="w-1/2 flex flex-col h-full bg-[#080d19]/40 border border-slate-800/80 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-[#090f1d]/50 flex items-center justify-between shrink-0">
                  <h3 className="text-xs font-bold text-slate-200">Sprints</h3>
                  <Button
                    onClick={() => setIsCreateSprintOpen(true)}
                    variant="outline"
                    className="border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-xs py-1 h-7 rounded-lg"
                  >
                    <Plus className="size-3 mr-1" /> New Sprint
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 pb-6">
                    {sprints.map(sprint => (
                      <div
                        key={sprint.id}
                        className={`p-4 border border-slate-800/80 bg-slate-900/40 rounded-xl space-y-3 ${sprint.status === 'ACTIVE' ? 'ring-1 ring-cyan-500/30 bg-[#0b1425]/40 border-cyan-800/20' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-200">{sprint.name}</h4>
                          <div className="flex gap-2">
                            {sprint.status === 'UPCOMING' && (
                              <Button
                                onClick={() => updateSprintStatus.mutate({ sprintId: sprint.id, status: 'ACTIVE' })}
                                className="bg-cyan-600 hover:bg-cyan-500 text-slate-900 text-[9px] font-bold h-6 px-2.5 rounded-md"
                              >
                                Start
                              </Button>
                            )}
                            {sprint.status === 'ACTIVE' && (
                              <Button
                                onClick={() => updateSprintStatus.mutate({ sprintId: sprint.id, status: 'COMPLETED' })}
                                className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 text-[9px] font-bold h-6 px-2.5 rounded-md"
                              >
                                Complete
                              </Button>
                            )}
                            <Badge className={`text-[9px] py-0.5 px-2 ${sprint.status === 'ACTIVE' ? 'bg-cyan-500/10 text-cyan-400' : sprint.status === 'COMPLETED' ? 'bg-slate-800 text-slate-400' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                              {sprint.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-4 text-[10px] text-slate-400 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3 text-slate-500" />
                            {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                          </div>
                          <div>
                            {tasks.filter(t => t.sprintId === sprint.id).length} Tasks
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Column: Sprint backlog list */}
              <div className="w-1/2 flex flex-col h-full bg-[#080d19]/40 border border-slate-800/80 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-[#090f1d]/50 flex items-center justify-between shrink-0">
                  <h3 className="text-xs font-bold text-slate-200">Backlog Planning</h3>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-2 pb-6">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3 border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[9px] text-cyan-400 font-bold bg-cyan-950/40 w-fit px-1.5 py-0.5 rounded border border-cyan-800/30">
                            {task.issueKey}
                          </span>
                          <span className="text-slate-200 font-medium">{task.title}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={task.sprintId || ''}
                            onChange={(e) => updateTaskDetails.mutate({
                              taskId: task.id,
                              title: task.title,
                              description: task.description,
                              priority: task.priority as any,
                              sprintId: e.target.value || null,
                              subTeamId: task.subTeamId,
                              assigneeId: task.assigneeId,
                            })}
                            className="bg-slate-900 border border-slate-800 text-[10px] rounded px-2 py-1 outline-none text-slate-300"
                          >
                            <option value="">Move to Backlog</option>
                            {sprints.filter(s => s.status !== 'COMPLETED').map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="h-full p-6 flex gap-6 overflow-hidden">
              {/* Create Team Form */}
              <div className="w-1/3 space-y-4">
                <Card className="border-slate-800 bg-[#080d19]/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-slate-200">Create Sub-team</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Organize your project into specific functional units.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Team Name</label>
                      <Input
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="e.g. Frontend Team"
                        className="bg-slate-950 border-slate-800 focus:border-cyan-500/50"
                      />
                    </div>
                    <Button
                      onClick={() => createSubTeam.mutate({ projectId, name: newTeamName })}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-semibold"
                    >
                      Add Team
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Teams List */}
              <div className="flex-1 bg-[#080d19]/40 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-[#090f1d]/50 shrink-0">
                  <h3 className="text-xs font-bold text-slate-200">Functional Teams</h3>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="grid grid-cols-2 gap-4 pb-6">
                    {teams.map(team => {
                      const teamTasks = tasks.filter(t => t.subTeamId === team.id)
                      return (
                        <div key={team.id} className="p-4 border border-slate-800 bg-slate-900/40 rounded-xl space-y-2">
                          <h4 className="text-xs font-bold text-slate-200">{team.name}</h4>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400">
                            <div>{teamTasks.length} Tasks assigned</div>
                            <div>{teamTasks.filter(t => t.status === 'DONE').length} Completed</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {activeTab === 'automations' && (
            <div className="h-full p-6 flex gap-6 overflow-hidden">
              {/* Setup panel */}
              <div className="w-1/2 space-y-4">
                <Card className="border-slate-800 bg-[#080d19]/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-slate-200">Setup Automation Rules</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Instruct GitBrain to automatically transition tasks based on codebase activity.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Commit Rule */}
                    <div className="p-4 border border-slate-800 bg-slate-950/60 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-cyan-400" />
                        <span className="text-xs font-bold text-slate-200">When Commit Message references task key:</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">Move task to</span>
                        <select
                          value={automations.find(a => a.trigger === 'COMMIT_PUSHED')?.action ?? 'IN_PROGRESS'}
                          onChange={(e) => createAutomation.mutate({
                            projectId,
                            trigger: 'COMMIT_PUSHED',
                            action: e.target.value
                          })}
                          className="bg-slate-900 border border-slate-800 text-xs rounded px-2.5 py-1.5 text-slate-200"
                        >
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="REVIEW">In Review</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>
                    </div>

                    {/* PR Rule */}
                    <div className="p-4 border border-slate-800 bg-slate-950/60 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-cyan-400" />
                        <span className="text-xs font-bold text-slate-200">When Pull Request is merged:</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">Move task to</span>
                        <select
                          value={automations.find(a => a.trigger === 'PR_MERGED')?.action ?? 'DONE'}
                          onChange={(e) => createAutomation.mutate({
                            projectId,
                            trigger: 'PR_MERGED',
                            action: e.target.value
                          })}
                          className="bg-slate-900 border border-slate-800 text-xs rounded px-2.5 py-1.5 text-slate-200"
                        >
                          <option value="DONE">Done</option>
                          <option value="REVIEW">In Review</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Rules List */}
              <div className="flex-1 bg-[#080d19]/40 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-[#090f1d]/50 shrink-0">
                  <h3 className="text-xs font-bold text-slate-200">Active Automation Log</h3>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3 pb-6">
                    {automations.map(rule => (
                      <div key={rule.id} className="p-4 border border-slate-800 bg-slate-900/40 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-200">
                            {rule.trigger === 'COMMIT_PUSHED' ? 'Git Commit Pushed Trigger' : 'Pull Request Merged Trigger'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Action: Move associated task to <span className="text-cyan-400">{rule.action}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          onChange={(e) => toggleAutomation.mutate({ ruleId: rule.id, isActive: e.target.checked })}
                          className="size-4 rounded border-slate-800 text-cyan-600 focus:ring-cyan-500 bg-slate-950"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <ScrollArea className="h-full p-6">
              <div className="space-y-6 pb-12">
                {/* Top Row charts */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Burndown Chart */}
                  <Card className="border-slate-800 bg-[#080d19]/40">
                    <CardHeader>
                      <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider">Sprint Burndown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                      {analytics.burndown.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.burndown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} />
                            <YAxis stroke="#9ca3af" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#090f1d', border: '1px solid #1f2937' }} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Area type="monotone" dataKey="ideal" name="Ideal Remaining" stroke="#9ca3af" fill="none" strokeDasharray="5 5" />
                            <Area type="monotone" dataKey="actual" name="Actual Remaining" stroke="#06b6d4" fill="rgba(6, 182, 212, 0.1)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">
                          Activate a sprint to visualize burndown charts.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Team allocation */}
                  <Card className="border-slate-800 bg-[#080d19]/40">
                    <CardHeader>
                      <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider">Sub-team Distributions</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                      {analytics.teamDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.teamDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                            <YAxis stroke="#9ca3af" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#090f1d', border: '1px solid #1f2937' }} />
                            <Bar dataKey="total" name="Total Tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="completed" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">
                          Create sub-teams to see resource allocation.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Row charts */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Sprint Velocity */}
                  <Card className="border-slate-800 bg-[#080d19]/40">
                    <CardHeader>
                      <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider">Sprint Velocity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                      {analytics.velocity.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.velocity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                            <YAxis stroke="#9ca3af" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#090f1d', border: '1px solid #1f2937' }} />
                            <Bar dataKey="completed" name="Tasks Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">
                          Complete sprints to construct velocity indexes.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Priority breakdown */}
                  <Card className="border-slate-800 bg-[#080d19]/40">
                    <CardHeader>
                      <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider">Tasks by Priority</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center">
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(analytics.priorityDistribution).map(([name, value]) => ({ name, value }))}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill="#3b82f6" />
                              <Cell fill="#eab308" />
                              <Cell fill="#f97316" />
                              <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#090f1d', border: '1px solid #1f2937' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between text-blue-400">
                          <span>Low:</span>
                          <span>{analytics.priorityDistribution.LOW}</span>
                        </div>
                        <div className="flex items-center justify-between text-yellow-400">
                          <span>Medium:</span>
                          <span>{analytics.priorityDistribution.MEDIUM}</span>
                        </div>
                        <div className="flex items-center justify-between text-orange-400">
                          <span>High:</span>
                          <span>{analytics.priorityDistribution.HIGH}</span>
                        </div>
                        <div className="flex items-center justify-between text-red-400">
                          <span>Urgent:</span>
                          <span>{analytics.priorityDistribution.URGENT}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Drawer: Task Details slide-over */}
          {selectedTask && (
            <div className="absolute inset-y-0 right-0 w-[460px] bg-[#090f1d] border-l border-slate-800 shadow-2xl flex flex-col z-40 transition-transform">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#080d19]/60 shrink-0">
                <span className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                  {selectedTask.issueKey}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      if (confirm('Delete this task?')) {
                        deleteTask.mutate({ taskId: selectedTask.id })
                      }
                    }}
                    variant="ghost"
                    className="size-8 p-0 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <Button
                    onClick={() => setSelectedTask(null)}
                    variant="ghost"
                    className="size-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg font-bold"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-5 space-y-5">
                <div className="space-y-4 pb-12">
                  {/* Task name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Title</label>
                    <Input
                      value={selectedTask.title}
                      onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                      onBlur={handleSaveTaskDetails}
                      className="bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500/50"
                    />
                  </div>

                  {/* Task description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Description</label>
                    <Textarea
                      value={selectedTask.description ?? ''}
                      onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                      onBlur={handleSaveTaskDetails}
                      placeholder="Add description..."
                      rows={3}
                      className="bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500/50 text-xs"
                    />
                  </div>

                  {/* Attributes grid */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-800/80 py-4">
                    {/* Priority */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
                        <Tag className="size-3 text-slate-600" /> Priority
                      </label>
                      <select
                        value={selectedTask.priority}
                        onChange={(e) => {
                          const priority = e.target.value
                          setSelectedTask({ ...selectedTask, priority })
                          updateTaskDetails.mutate({
                            ...selectedTask,
                            priority: priority as any,
                          })
                        }}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-300 w-full outline-none focus:border-cyan-500/30"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>

                    {/* Assignee */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
                        <User className="size-3 text-slate-600" /> Assignee
                      </label>
                      <select
                        value={selectedTask.assigneeId || ''}
                        onChange={(e) => {
                          const assigneeId = e.target.value || null
                          setSelectedTask({ ...selectedTask, assigneeId })
                          updateTaskDetails.mutate({
                            ...selectedTask,
                            assigneeId,
                          })
                        }}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-300 w-full outline-none focus:border-cyan-500/30"
                      >
                        <option value="">Unassigned</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.firstName ? `${m.firstName} ${m.lastName ?? ''}` : m.emailAddress}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sprint */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
                        <CalendarRange className="size-3 text-slate-600" /> Sprint
                      </label>
                      <select
                        value={selectedTask.sprintId || ''}
                        onChange={(e) => {
                          const sprintId = e.target.value || null
                          setSelectedTask({ ...selectedTask, sprintId })
                          updateTaskDetails.mutate({
                            ...selectedTask,
                            sprintId,
                          })
                        }}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-300 w-full outline-none focus:border-cyan-500/30"
                      >
                        <option value="">Backlog</option>
                        {sprints.filter(s => s.status !== 'COMPLETED').map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sub-Team */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
                        <Users className="size-3 text-slate-600" /> Sub-Team
                      </label>
                      <select
                        value={selectedTask.subTeamId || ''}
                        onChange={(e) => {
                          const subTeamId = e.target.value || null
                          setSelectedTask({ ...selectedTask, subTeamId })
                          updateTaskDetails.mutate({
                            ...selectedTask,
                            subTeamId,
                          })
                        }}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-300 w-full outline-none focus:border-cyan-500/30"
                      >
                        <option value="">No sub-team</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Discussion Comments */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
                      <MessageSquare className="size-3 text-slate-600" /> Discussion
                    </label>

                    <div className="flex gap-2">
                      <Input
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Leave a comment..."
                        className="bg-slate-950 border-slate-800 text-xs text-slate-200 focus:border-cyan-500/30 h-8"
                      />
                      <Button
                        onClick={() => addComment.mutate({ taskId: selectedTask.id, text: newCommentText })}
                        className="bg-cyan-600 hover:bg-cyan-500 text-slate-900 text-xs font-semibold px-3 h-8"
                      >
                        Post
                      </Button>
                    </div>

                    <div className="space-y-3 mt-4">
                      {comments.map(c => (
                        <div key={c.id} className="p-3 border border-slate-800/80 bg-slate-950/60 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="size-4.5 rounded-full border border-slate-700 bg-cyan-900/30 flex items-center justify-center text-[7px] font-bold text-cyan-400">
                                {getInitials(c.user)}
                              </div>
                              <span className="text-[10px] font-bold text-slate-300">
                                {c.user.firstName ? `${c.user.firstName} ${c.user.lastName ?? ''}` : 'Member'}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(c.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                            {c.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </main>
      </div>

      {/* ─── Create Task Dialog Modal ────────────────────────────────────────── */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-[#090f1d] shadow-2xl">
            <CardHeader className="pb-4 border-b border-slate-800/50">
              <CardTitle className="text-sm font-bold text-slate-200">Create Work Item</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Title</label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="bg-slate-950 border-slate-800 focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Description</label>
                <Textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Provide context or instructions..."
                  rows={3}
                  className="bg-slate-950 border-slate-800 focus:border-cyan-500/50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as PriorityType)}
                    className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-2.5 text-slate-300 w-full outline-none focus:border-cyan-500/50"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-2.5 text-slate-300 w-full outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.firstName ? `${m.firstName} ${m.lastName ?? ''}` : m.emailAddress}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Sprint Target</label>
                  <select
                    value={newTaskSprint}
                    onChange={(e) => setNewTaskSprint(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-2.5 text-slate-300 w-full outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Backlog</option>
                    {sprints.filter(s => s.status !== 'COMPLETED').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Sub-team</label>
                  <select
                    value={newTaskTeam}
                    onChange={(e) => setNewTaskTeam(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-2.5 text-slate-300 w-full outline-none focus:border-cyan-500/50"
                  >
                    <option value="">None</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800/80 pt-4 mt-6">
                <Button
                  onClick={() => setIsCreateTaskOpen(false)}
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createTask.mutate({
                    projectId,
                    title: newTaskTitle,
                    description: newTaskDesc,
                    priority: newTaskPriority,
                    sprintId: newTaskSprint || null,
                    subTeamId: newTaskTeam || null,
                    assigneeId: newTaskAssignee || null,
                  })}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Save Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Create Sprint Dialog Modal ──────────────────────────────────────── */}
      {isCreateSprintOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-slate-800 bg-[#090f1d] shadow-2xl">
            <CardHeader className="pb-4 border-b border-slate-800/50">
              <CardTitle className="text-sm font-bold text-slate-200">Initialize Sprint</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Sprint Name</label>
                <Input
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  placeholder="e.g. Sprint 1"
                  className="bg-slate-950 border-slate-800 focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Start Date</label>
                  <Input
                    type="date"
                    value={newSprintStart}
                    onChange={(e) => setNewSprintStart(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus:border-cyan-500/50 text-slate-300 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">End Date</label>
                  <Input
                    type="date"
                    value={newSprintEnd}
                    onChange={(e) => setNewSprintEnd(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus:border-cyan-500/50 text-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800/80 pt-4 mt-6">
                <Button
                  onClick={() => setIsCreateSprintOpen(false)}
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createSprint.mutate({
                    projectId,
                    name: newSprintName,
                    startDate: new Date(newSprintStart),
                    endDate: new Date(newSprintEnd),
                  })}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Create Sprint
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
