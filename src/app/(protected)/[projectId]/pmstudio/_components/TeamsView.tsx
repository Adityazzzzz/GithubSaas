import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Users,
  Plus,
  LayoutGrid,
  Activity,
  MoreHorizontal,
  CheckCircle2,
  ArrowLeft,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  Check,
  X,
  TrendingUp,
  UserPlus,
  FileText,
  Briefcase
} from 'lucide-react'
import { getInitials, getUserName, STATUS_CONFIG, PRIORITY_CONFIG } from './types'
import { toast } from 'sonner'

interface TeamsViewProps {
  teams: any[]
  tasks: any[]
  members: any[]
  newTeamName: string
  setNewTeamName: (name: string) => void
  onCreateTeam: () => void
  isCreatingTeam: boolean
  onUpdateTeam: (id: string, name: string) => void
  onDeleteTeam: (id: string) => void
  onCreatePlaceholderTask: (assigneeId: string, subTeamId: string) => void
  onCardClick: (task: any) => void
}

export function TeamsView({
  teams,
  tasks,
  members,
  newTeamName,
  setNewTeamName,
  onCreateTeam,
  isCreatingTeam,
  onUpdateTeam,
  onDeleteTeam,
  onCreatePlaceholderTask,
  onCardClick,
}: TeamsViewProps) {
  // Navigation & Details State
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'tasks'>('overview')

  // Edit / Delete Dialogs State
  const [editingTeam, setEditingTeam] = useState<{ id: string; name: string } | null>(null)
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // LocalStorage Persisted States
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [capacities, setCapacities] = useState<Record<string, number>>({})
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({}) // key: `${teamId}-${memberId}`

  // Inline Edit Description State
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [tempDesc, setTempDesc] = useState('')

  // Member Search State
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [isInviteDropdownOpen, setIsInviteDropdownOpen] = useState(false)

  // Task Filter State (for profile Tasks tab)
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL')

  // Load persisted data on mount
  useEffect(() => {
    const loadedDescs = localStorage.getItem('pm-studio-team-descriptions')
    const loadedCaps = localStorage.getItem('pm-studio-team-capacities')
    const loadedRoles = localStorage.getItem('pm-studio-team-member-roles')

    if (loadedDescs) setDescriptions(JSON.parse(loadedDescs))
    if (loadedCaps) setCapacities(JSON.parse(loadedCaps))
    if (loadedRoles) setMemberRoles(JSON.parse(loadedRoles))
  }, [])

  // Helper to save descriptions
  const saveDescription = (teamId: string, desc: string) => {
    const updated = { ...descriptions, [teamId]: desc }
    setDescriptions(updated)
    localStorage.setItem('pm-studio-team-descriptions', JSON.stringify(updated))
    setIsEditingDesc(false)
    toast.success('Description updated')
  }

  // Helper to save capacities
  const saveCapacity = (teamId: string, cap: number) => {
    const updated = { ...capacities, [teamId]: cap }
    setCapacities(updated)
    localStorage.setItem('pm-studio-team-capacities', JSON.stringify(updated))
    toast.success('Team capacity updated')
  }

  // Helper to save member roles
  const saveMemberRole = (teamId: string, memberId: string, role: string) => {
    const key = `${teamId}-${memberId}`
    const updated = { ...memberRoles, [key]: role }
    setMemberRoles(updated)
    localStorage.setItem('pm-studio-team-member-roles', JSON.stringify(updated))
    toast.success('Member role updated')
  }

  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  // If the selected team was deleted externally or updated, handle safely
  useEffect(() => {
    if (selectedTeamId && !selectedTeam) {
      setSelectedTeamId(null)
    }
  }, [teams, selectedTeamId, selectedTeam])

  // Get active team context details if a team is selected
  const teamTasks = selectedTeam ? tasks.filter(t => t.subTeamId === selectedTeam.id) : []
  const doneTasks = teamTasks.filter(t => t.status === 'DONE')
  const inProgressTasks = teamTasks.filter(t => t.status === 'IN_PROGRESS')
  const todoTasks = teamTasks.filter(t => t.status === 'TODO')
  const backlogTasks = teamTasks.filter(t => t.status === 'BACKLOG')
  const reviewTasks = teamTasks.filter(t => t.status === 'REVIEW')
  
  const percentage = teamTasks.length > 0 ? Math.round((doneTasks.length / teamTasks.length) * 100) : 0

  // Dynamically resolve team members based on assignees
  const assigneeIds = Array.from(new Set(teamTasks.map(t => t.assigneeId).filter(Boolean))) as string[]
  const teamMembers = members.filter(m => assigneeIds.includes(m.id))

  // Non-team project members for invitation
  const nonTeamMembers = members.filter(m => !assigneeIds.includes(m.id))

  // Filtered tasks in selected team
  const filteredTasks = teamTasks.filter(t => {
    if (taskStatusFilter === 'ALL') return true
    return t.status === taskStatusFilter
  })

  // Open Edit Dialog
  const handleOpenEdit = (team: any) => {
    setEditingTeam({ id: team.id, name: team.name })
    setIsEditDialogOpen(true)
  }

  // Submit Edit Team Name
  const handleSaveTeamName = () => {
    if (editingTeam && editingTeam.name.trim()) {
      onUpdateTeam(editingTeam.id, editingTeam.name.trim())
      setIsEditDialogOpen(false)
      setEditingTeam(null)
    }
  }

  // Open Delete Dialog
  const handleOpenDelete = (teamId: string) => {
    setDeletingTeamId(teamId)
    setIsDeleteDialogOpen(true)
  }

  // Confirm Delete Team
  const handleConfirmDelete = () => {
    if (deletingTeamId) {
      onDeleteTeam(deletingTeamId)
      setIsDeleteDialogOpen(false)
      setDeletingTeamId(null)
      if (selectedTeamId === deletingTeamId) {
        setSelectedTeamId(null)
      }
    }
  }

  // Handle Invite Member (creates placeholder task assigned to them)
  const handleInviteMember = (memberId: string) => {
    if (selectedTeamId) {
      onCreatePlaceholderTask(memberId, selectedTeamId)
      setIsInviteDropdownOpen(false)
      setMemberSearchQuery('')
      toast.success('Member added to team (assigned to onboarding task)')
    }
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      
      {/* ─── DIRECTORY VIEW ─── */}
      {!selectedTeamId ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="py-6 px-8 border-b border-border shrink-0 bg-card">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                    Workspace
                  </Badge>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                  Teams Directory
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                  Organize departments, squads, and track sprint velocity & capacity.
                </p>
              </div>
              
              {/* Create Team Inline Container */}
              <div className="flex items-center gap-2 bg-background p-1 rounded-xl border border-border shadow-sm max-w-sm w-full md:w-auto">
                <Input
                  placeholder="Create sub-team..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full md:w-44 h-8 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTeamName.trim() && !isCreatingTeam) {
                      onCreateTeam()
                    }
                  }}
                />
                <Button
                  onClick={onCreateTeam}
                  disabled={!newTeamName.trim() || isCreatingTeam}
                  size="sm"
                  className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-lg shadow-sm font-semibold px-3 text-xs"
                >
                  <Plus className="size-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>

          {/* Directory Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/40">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <LayoutGrid className="size-3.5 text-muted-foreground" /> All Active Squads ({teams.length})
                </h3>
              </div>

              {teams.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border bg-card rounded-2xl p-6">
                  <div className="size-14 rounded-2xl bg-muted border border-border text-muted-foreground flex items-center justify-center mx-auto mb-4">
                    <Users className="size-6" />
                  </div>
                  <p className="text-base font-bold text-foreground">No Teams Configured</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    Get started by typing a team name in the header input to create your first sub-team.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map(team => {
                    const squadTasks = tasks.filter(t => t.subTeamId === team.id)
                    const squadDone = squadTasks.filter(t => t.status === 'DONE')
                    const squadPct = squadTasks.length > 0 ? Math.round((squadDone.length / squadTasks.length) * 100) : 0
                    
                    const squadAssigneeIds = Array.from(new Set(squadTasks.map(t => t.assigneeId).filter(Boolean))) as string[]
                    const squadMembers = members.filter(m => squadAssigneeIds.includes(m.id))
                    const squadCap = capacities[team.id] ?? 8

                    const initials = team.name.substring(0, 2).toUpperCase()

                    return (
                      <Card 
                        key={team.id} 
                        className="group overflow-hidden border border-border bg-card hover:border-muted-foreground/30 hover:shadow-md transition-all duration-200 rounded-xl shadow-sm flex flex-col"
                      >
                        {/* Card Header Info */}
                        <div className="h-10 bg-muted/40 border-b border-border/80 flex items-center justify-between px-4 shrink-0">
                          <Badge variant="outline" className="bg-background border-border shadow-sm text-[10px] uppercase font-bold tracking-wider">
                            Squad
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border text-card-foreground rounded-lg">
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(team); }}
                                className="cursor-pointer hover:bg-muted text-sm gap-2"
                              >
                                <Edit className="size-3.5" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); handleOpenDelete(team.id); }}
                                className="cursor-pointer hover:bg-destructive/10 text-destructive text-sm gap-2"
                              >
                                <Trash2 className="size-3.5" /> Delete Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Card Body */}
                        <div 
                          onClick={() => { setSelectedTeamId(team.id); setActiveTab('overview'); }}
                          className="p-5 flex-1 flex flex-col justify-between cursor-pointer"
                        >
                          <div>
                            <div className="flex items-start gap-3.5 mb-5">
                              <Avatar className="size-11 rounded-lg border border-border shadow-sm shrink-0">
                                <AvatarFallback className="bg-muted border border-border text-muted-foreground font-bold text-base rounded-lg">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                  {team.name}
                                </h4>
                                <p className="text-xs font-semibold text-muted-foreground mt-0.5 flex items-center gap-1">
                                  <Activity className="size-3 text-muted-foreground" /> {squadTasks.length} tasks assigned
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3.5">
                              {/* Velocity Info */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-end text-xs font-semibold">
                                  <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Velocity Completion</span>
                                  <span className="text-foreground font-extrabold">{squadPct}%</span>
                                </div>
                                <Progress value={squadPct} className="h-1.5 bg-muted" />
                              </div>

                              <div className="flex justify-between items-center text-xs border-t border-border pt-3 mt-1">
                                <span className="text-muted-foreground">Done Tasks</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-450">{squadDone.length} <span className="text-muted-foreground text-[10px] font-semibold">/ {squadTasks.length}</span></span>
                              </div>
                            </div>
                          </div>

                          {/* Member avatars & Capacity */}
                          <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-1.5">
                              {squadMembers.length === 0 ? (
                                <span className="text-[11px] font-medium text-muted-foreground italic">No members</span>
                              ) : (
                                <div className="flex -space-x-2 overflow-hidden">
                                  {squadMembers.slice(0, 4).map(m => (
                                    <Avatar key={m.id} className="size-6.5 border-2 border-background rounded-full">
                                      {m.imageUrl ? (
                                        <AvatarImage src={m.imageUrl} alt={getUserName(m)} />
                                      ) : null}
                                      <AvatarFallback className="bg-muted text-[9px] font-bold text-muted-foreground">
                                        {getInitials(m)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {squadMembers.length > 4 && (
                                    <div className="size-6.5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                      +{squadMembers.length - 4}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">Capacity</span>
                              <span className={`text-xs font-bold ${squadTasks.length > squadCap ? 'text-destructive' : squadTasks.length === squadCap ? 'text-amber-500' : 'text-foreground/80'}`}>
                                {squadTasks.length}/{squadCap} slots
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ─── TEAM PROFILE / DETAIL VIEW ─── */
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          
          {/* Header Area */}
          <div className="bg-card shrink-0 border-b border-border py-6 px-8 relative">
            <div className="max-w-6xl mx-auto flex flex-col gap-4 relative">
              {/* Back Link */}
              <button 
                onClick={() => setSelectedTeamId(null)}
                className="w-fit flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Back to squads directory
              </button>

              {/* Main Metadata row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
                <div className="flex items-center gap-4">
                  <Avatar className="size-14 rounded-xl border border-border shadow-sm shrink-0">
                    <AvatarFallback className="bg-muted border border-border text-muted-foreground font-bold text-xl rounded-xl">
                      {selectedTeam.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                        {selectedTeam.name}
                      </h2>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                        Active Profile
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
                      <span>Squad ID: <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-[10px]">{selectedTeam.id}</code></span>
                      <span className="text-muted-foreground">•</span>
                      <span>Created: {new Date(selectedTeam.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                {/* Profile Controls */}
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(selectedTeam)}
                    className="border-border bg-background text-foreground hover:bg-muted font-semibold rounded-lg text-xs"
                  >
                    <Edit className="size-3.5 mr-1" /> Rename
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDelete(selectedTeam.id)}
                    className="border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 font-semibold rounded-lg text-xs"
                  >
                    <Trash2 className="size-3.5 mr-1" /> Delete Team
                  </Button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-6 mt-4 border-t border-border pt-3">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Members <Badge className="bg-muted hover:bg-muted text-muted-foreground text-[10px] py-0 px-1.5 rounded">{teamMembers.length}</Badge>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'tasks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Tasks <Badge className="bg-muted hover:bg-muted text-muted-foreground text-[10px] py-0 px-1.5 rounded">{teamTasks.length}</Badge>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Tabs Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/40">
            <div className="max-w-6xl mx-auto">
              
              {/* ─── TAB: OVERVIEW ─── */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Left: About details */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border bg-card">
                      <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b border-border">
                        <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                          <FileText className="size-4 text-muted-foreground" /> About this squad
                        </CardTitle>
                        {!isEditingDesc && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setTempDesc(descriptions[selectedTeam.id] ?? '')
                              setIsEditingDesc(true)
                            }}
                            className="h-8 hover:bg-muted text-primary hover:text-primary/90 text-xs font-semibold rounded-lg"
                          >
                            <Edit className="size-3.5 mr-1" /> Edit
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="pt-5">
                        {isEditingDesc ? (
                          <div className="space-y-4">
                            <Textarea
                              value={tempDesc}
                              onChange={(e) => setTempDesc(e.target.value)}
                              placeholder="Describe what this team is responsible for, their goals, tech stack..."
                              className="min-h-[140px] bg-background border-border text-foreground placeholder-muted-foreground rounded-xl p-4 text-sm focus-visible:ring-primary focus-visible:ring-1"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsEditingDesc(false)}
                                className="border-border hover:bg-muted text-muted-foreground text-xs rounded-lg font-semibold"
                              >
                                <X className="size-3.5 mr-1" /> Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => saveDescription(selectedTeam.id, tempDesc)}
                                className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs rounded-lg font-semibold"
                              >
                                <Check className="size-3.5 mr-1" /> Save Details
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {descriptions[selectedTeam.id] ? (
                              descriptions[selectedTeam.id]
                            ) : (
                              <p className="text-muted-foreground italic">
                                No description provided for this team. Click Edit above to add details about team focus, mission, or technologies.
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Member Quick Preview */}
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-3.5 border-b border-border">
                        <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                          <Users className="size-4 text-muted-foreground" /> Active Roster ({teamMembers.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-5">
                        {teamMembers.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No members assigned to this team's tasks yet.</p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {teamMembers.map(member => {
                              const roleKey = `${selectedTeam.id}-${member.id}`
                              const role = memberRoles[roleKey] ?? 'Team Member'
                              return (
                                <div key={member.id} className="flex items-center gap-2.5 bg-muted/40 p-2.5 rounded-xl border border-border">
                                  <Avatar className="size-8 rounded-lg shrink-0">
                                    {member.imageUrl ? <AvatarImage src={member.imageUrl} /> : null}
                                    <AvatarFallback className="bg-muted text-[10px] font-bold text-muted-foreground">{getInitials(member)}</AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate">{getUserName(member)}</p>
                                    <p className="text-[10px] text-muted-foreground truncate font-semibold">{role}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: Metrics & Capacity */}
                  <div className="space-y-6">
                    {/* Capacity Tracker */}
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-3.5 border-b border-border flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                          <Activity className="size-4 text-muted-foreground" /> Capacity Plan
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={
                            teamTasks.length > (capacities[selectedTeam.id] ?? 8)
                              ? 'bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-bold'
                              : teamTasks.length === (capacities[selectedTeam.id] ?? 8)
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] font-bold'
                          }
                        >
                          {teamTasks.length > (capacities[selectedTeam.id] ?? 8) ? 'Over Capacity' : 'Available Capacity'}
                        </Badge>
                      </CardHeader>
                      <CardContent className="pt-5 space-y-4">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs font-semibold">Active Workload Distribution</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-foreground">{teamTasks.length}</span>
                            <span className="text-muted-foreground text-sm">/ {capacities[selectedTeam.id] ?? 8} capacity slots</span>
                          </div>
                        </div>

                        <Progress 
                          value={Math.min(100, (teamTasks.length / (capacities[selectedTeam.id] ?? 8)) * 100)} 
                          className={`h-2 bg-muted ${teamTasks.length > (capacities[selectedTeam.id] ?? 8) ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`} 
                        />

                        {/* Capacity editor buttons */}
                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-semibold">Adjust team capacity</span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={(capacities[selectedTeam.id] ?? 8) <= 1}
                              onClick={() => saveCapacity(selectedTeam.id, (capacities[selectedTeam.id] ?? 8) - 1)}
                              className="size-7 border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded"
                            >
                              <span className="text-lg font-bold">-</span>
                            </Button>
                            <span className="w-8 text-center text-sm font-bold text-foreground">{capacities[selectedTeam.id] ?? 8}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => saveCapacity(selectedTeam.id, (capacities[selectedTeam.id] ?? 8) + 1)}
                              className="size-7 border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded"
                            >
                              <span className="text-lg font-bold">+</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Team Metrics Card */}
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-3.5 border-b border-border">
                        <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="size-4 text-muted-foreground" /> Velocity Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-5 space-y-4">
                        <div className="flex items-center justify-between text-xs border-b border-border pb-2.5">
                          <span className="text-muted-foreground font-medium">Done Rate</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-450 text-sm">{percentage}%</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase tracking-wider">Done</span>
                            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{doneTasks.length}</span>
                          </div>
                          
                          <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1">
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block uppercase tracking-wider">In Progress</span>
                            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{inProgressTasks.length}</span>
                          </div>
                          
                          <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1">
                            <span className="text-[10px] text-violet-650 dark:text-violet-450 font-bold block uppercase tracking-wider">In Review</span>
                            <span className="text-xl font-black text-violet-650 dark:text-violet-450">{reviewTasks.length}</span>
                          </div>
                          
                          <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1">
                            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">To Do & Backlog</span>
                            <span className="text-xl font-black text-foreground/80">{todoTasks.length + backlogTasks.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* ─── TAB: MEMBERS ─── */}
              {activeTab === 'members' && (
                <div className="space-y-6">
                  {/* Search and Invite header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Squad Members ({teamMembers.length})</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Invite project members to assign tasks and manage roles.</p>
                    </div>

                    <div className="relative">
                      <DropdownMenu open={isInviteDropdownOpen} onOpenChange={setIsInviteDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9 rounded-lg"
                          >
                            <UserPlus className="size-4 mr-1.5" /> Invite Member
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-card border-border text-foreground rounded-xl p-2 space-y-2">
                          <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-lg border border-border">
                            <Search className="size-3.5 text-muted-foreground" />
                            <Input
                              value={memberSearchQuery}
                              onChange={(e) => setMemberSearchQuery(e.target.value)}
                              placeholder="Search project directory..."
                              className="border-0 p-0 h-6 bg-transparent text-xs text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>

                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {nonTeamMembers
                              .filter(m => getUserName(m).toLowerCase().includes(memberSearchQuery.toLowerCase()))
                              .length === 0 ? (
                                <p className="text-[10px] text-muted-foreground italic p-2 text-center">No other members available</p>
                              ) : (
                                nonTeamMembers
                                  .filter(m => getUserName(m).toLowerCase().includes(memberSearchQuery.toLowerCase()))
                                  .map(m => (
                                    <button
                                      key={m.id}
                                      onClick={() => handleInviteMember(m.id)}
                                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2 transition-colors text-xs"
                                    >
                                      <Avatar className="size-6 rounded-md">
                                        {m.imageUrl ? <AvatarImage src={m.imageUrl} /> : null}
                                        <AvatarFallback className="bg-muted text-[8px] font-bold text-muted-foreground">{getInitials(m)}</AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-foreground truncate">{getUserName(m)}</p>
                                        <p className="text-[9px] text-muted-foreground truncate">{m.emailAddress}</p>
                                      </div>
                                    </button>
                                  ))
                              )}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Members list */}
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border bg-muted/25 rounded-2xl">
                      <Users className="size-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-bold text-muted-foreground">This team has no members assigned.</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        Click "Invite Member" above to add project users to this squad.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teamMembers.map((member, index) => {
                        const roleKey = `${selectedTeam.id}-${member.id}`
                        const role = memberRoles[roleKey] ?? 'Team Member'
                        const memberTasks = teamTasks.filter(t => t.assigneeId === member.id)

                        // Role suggestions based on index if default
                        const placeholderRoles = ["Product Owner", "Tech Lead", "Senior Developer", "Developer", "QA Engineer", "Designer"]
                        const placeholderRole = placeholderRoles[index % placeholderRoles.length]!

                        return (
                          <Card key={member.id} className="border-border bg-card rounded-xl overflow-hidden shadow-sm flex flex-col justify-between p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="size-10 rounded-lg shrink-0">
                                  {member.imageUrl ? <AvatarImage src={member.imageUrl} /> : null}
                                  <AvatarFallback className="bg-muted border border-border text-muted-foreground font-bold text-sm rounded-lg">
                                    {getInitials(member)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-foreground truncate">{getUserName(member)}</h4>
                                  <p className="text-[10px] text-muted-foreground truncate font-semibold">{member.emailAddress}</p>
                                </div>
                              </div>
                              
                              <Badge className="bg-muted border border-border text-[9px] font-bold py-0.5 text-muted-foreground shrink-0">
                                {memberTasks.length} tasks
                              </Badge>
                            </div>

                            {/* Role management */}
                            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-4">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Briefcase className="size-3" /> Role
                              </span>
                              <Input
                                value={role === 'Team Member' ? '' : role}
                                placeholder={placeholderRole}
                                onChange={(e) => saveMemberRole(selectedTeam.id, member.id, e.target.value)}
                                className="h-8 max-w-[160px] bg-background border-border text-xs rounded-lg text-foreground placeholder:text-muted-foreground font-semibold px-2 py-1 text-right focus-visible:ring-primary focus-visible:ring-1"
                              />
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB: TASKS ─── */}
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Task tab controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Squad Tasks ({filteredTasks.length})</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Tasks assigned to this team. Click any task to inspect details.</p>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider hidden sm:inline">Filter</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-muted rounded-lg text-xs font-semibold">
                            Status: {taskStatusFilter === 'ALL' ? 'All Tasks' : STATUS_CONFIG[taskStatusFilter]?.label ?? taskStatusFilter}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground rounded-lg">
                          <DropdownMenuItem onClick={() => setTaskStatusFilter('ALL')} className="cursor-pointer hover:bg-muted text-xs font-medium">All Tasks</DropdownMenuItem>
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <DropdownMenuItem key={k} onClick={() => setTaskStatusFilter(k)} className="cursor-pointer hover:bg-muted text-xs font-medium flex items-center gap-2">
                              <span className={`size-1.5 rounded-full ${v.dot}`} /> {v.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Task list table */}
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border bg-muted/20 rounded-2xl">
                      <FileText className="size-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-bold text-muted-foreground">No matching squad tasks found.</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        To add tasks, go to the Kanban Board and update the sub-team field on an issue.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              <th className="py-3 px-4 w-28">Key</th>
                              <th className="py-3 px-4">Title</th>
                              <th className="py-3 px-4 w-28">Status</th>
                              <th className="py-3 px-4 w-28">Priority</th>
                              <th className="py-3 px-4 w-36">Assignee</th>
                              <th className="py-3 px-4 w-28">Due Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredTasks.map(task => {
                              const status = STATUS_CONFIG[task.status] || { label: task.status, color: 'text-foreground bg-muted border-border', dot: 'bg-muted-foreground' }
                              const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || { label: task.priority, color: 'text-muted-foreground bg-muted border-border' }
                              const taskAssignee = members.find(m => m.id === task.assigneeId)

                              return (
                                <tr 
                                  key={task.id}
                                  onClick={() => onCardClick(task)}
                                  className="group cursor-pointer hover:bg-muted/50 transition-colors text-sm"
                                >
                                  <td className="py-3 px-4 font-bold text-primary text-xs">
                                    ISS-{task.id.slice(-4).toUpperCase()}
                                  </td>
                                  <td className="py-3 px-4 font-bold text-foreground group-hover:text-primary transition-colors max-w-xs truncate">
                                    {task.title}
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${status.color} flex items-center gap-1.5 w-fit`}>
                                      <span className={`size-1.5 rounded-full ${status.dot}`} />
                                      {status.label}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border w-fit ${priority.color}`}>
                                      {priority.label}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    {taskAssignee ? (
                                      <div className="flex items-center gap-2">
                                        <Avatar className="size-6 rounded-md border border-border">
                                          {taskAssignee.imageUrl ? <AvatarImage src={taskAssignee.imageUrl} /> : null}
                                          <AvatarFallback className="bg-muted text-[8px] font-extrabold text-muted-foreground">{getInitials(taskAssignee)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-foreground/90 font-semibold truncate max-w-[110px]">{getUserName(taskAssignee)}</span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-xs font-semibold text-muted-foreground">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : <span className="text-muted-foreground/60">—</span>}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ─── RENAME TEAM DIALOG ─── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Edit className="size-4 text-muted-foreground" /> Rename Squad
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">New Name</label>
            <Input
              value={editingTeam?.name || ''}
              onChange={(e) => setEditingTeam(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="bg-background border-border text-foreground placeholder-muted-foreground rounded-lg h-10 text-sm focus-visible:ring-primary focus-visible:ring-1"
              placeholder="e.g. Frontend Platform"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTeamName()
              }}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-border hover:bg-muted text-muted-foreground text-xs rounded-lg font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTeamName}
              disabled={!editingTeam?.name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs rounded-lg font-semibold"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRMATION DIALOG ─── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="size-4.5 text-destructive animate-pulse" /> Confirm Team Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm text-foreground/80 leading-relaxed">
              Are you sure you want to delete this sub-team? This action will:
            </p>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
              <li>Remove this sub-team categorization from all project tasks.</li>
              <li>Delete the team profile description and capacity limits.</li>
              <li>This action is permanent and cannot be undone.</li>
            </ul>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-border hover:bg-muted text-muted-foreground text-xs rounded-lg font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs rounded-lg font-semibold"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
