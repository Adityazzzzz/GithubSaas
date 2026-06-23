import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Trash2,
  MessageSquare,
  Send,
  Check,
  CalendarDays,
  Activity
} from 'lucide-react'
import { 
  PRIORITY_CONFIG, 
  STATUS_CONFIG, 
  getInitials, 
  getUserName 
} from './types'

interface TaskDetailSheetProps {
  selectedTask: any | null
  onClose: () => void
  onDelete: (taskId: string) => void
  onUpdateTaskDetails: (taskId: string, fields: any) => void
  onUpdateTaskStatus: (taskId: string, status: string) => void
  comments: any[]
  onAddComment: (taskId: string, text: string) => void
  isAddingComment: boolean
  members: any[]
  sprints: any[]
  teams: any[]
}

export function TaskDetailSheet({
  selectedTask,
  onClose,
  onDelete,
  onUpdateTaskDetails,
  onUpdateTaskStatus,
  comments,
  onAddComment,
  isAddingComment,
  members,
  sprints,
  teams,
}: TaskDetailSheetProps) {
  const [localTitle, setLocalTitle] = useState('')
  const [localDesc, setLocalDesc] = useState('')
  const [newCommentText, setNewCommentText] = useState('')

  // Sync state with selectedTask prop changes
  useEffect(() => {
    if (selectedTask) {
      setLocalTitle(selectedTask.title || '')
      setLocalDesc(selectedTask.description || '')
    }
  }, [selectedTask])

  if (!selectedTask) return null

  const handleSaveDetails = () => {
    if (localTitle.trim() !== selectedTask.title || localDesc !== (selectedTask.description || '')) {
      onUpdateTaskDetails(selectedTask.id, {
        title: localTitle.trim() || selectedTask.title,
        description: localDesc,
        priority: selectedTask.priority,
        sprintId: selectedTask.sprintId,
        subTeamId: selectedTask.subTeamId,
        assigneeId: selectedTask.assigneeId,
        dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
        startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
      })
    }
  }

  const getChecklistStats = (description: string | null) => {
    if (!description) return { total: 0, done: 0, percentage: 0 }
    const totalMatches = description.match(/- \[[ xX]\]/g) || []
    const doneMatches = description.match(/- \[[xX]\]/g) || []
    const total = totalMatches.length
    const done = doneMatches.length
    return { total, done, percentage: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  const toggleChecklistItem = (index: number) => {
    if (!selectedTask.description) return
    let currentIdx = 0
    const updatedDesc = selectedTask.description.replace(/- \[[ xX]\]/g, (match: string) => {
      if (currentIdx === index) {
        currentIdx++
        return match.includes('x') || match.includes('X') ? '- [ ]' : '- [x]'
      }
      currentIdx++
      return match
    })
    setLocalDesc(updatedDesc)
    onUpdateTaskDetails(selectedTask.id, {
      title: localTitle.trim() || selectedTask.title,
      description: updatedDesc,
      priority: selectedTask.priority,
      sprintId: selectedTask.sprintId,
      subTeamId: selectedTask.subTeamId,
      assigneeId: selectedTask.assigneeId,
      dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
      startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
    })
  }

  const handleAddComment = () => {
    if (newCommentText.trim()) {
      onAddComment(selectedTask.id, newCommentText.trim())
      setNewCommentText('')
    }
  }

  return (
    <Dialog open={!!selectedTask} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-5xl p-0 flex flex-col h-[85vh] overflow-hidden bg-background border-border rounded-2xl shadow-2xl select-none">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0 bg-muted/10">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs font-bold bg-card text-muted-foreground border-border/60 shadow-sm">{selectedTask.issueKey}</Badge>
              <DialogTitle className="text-sm sr-only">Issue Inspector</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg gap-1.5 px-3 text-xs font-semibold"
              onClick={() => onDelete(selectedTask.id)}>
              <Trash2 className="size-3.5" /> Delete Issue
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Left Pane: Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 min-w-0">
            {/* Title */}
            <div className="space-y-1">
              <Input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleSaveDetails}
                className="text-2xl font-extrabold border-0 shadow-none p-0 h-auto focus-visible:ring-0 text-foreground focus:bg-muted/30 rounded-lg px-3 py-2 -ml-3 transition-all placeholder-muted-foreground"
                placeholder="Issue title"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur()
                  }
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Description</label>
              <Textarea
                value={localDesc}
                onChange={(e) => setLocalDesc(e.target.value)}
                onBlur={handleSaveDetails}
                placeholder="Describe this issue... Support markdown checklists (- [ ] task)."
                className="min-h-[200px] resize-none border-border/60 rounded-xl text-sm placeholder-muted-foreground bg-background hover:bg-muted/20 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-all p-4 shadow-sm"
              />
            </div>

            {/* Checklist */}
            {getChecklistStats(selectedTask.description).total > 0 && (
              <div className="space-y-3 p-5 border border-border/60 rounded-xl bg-card shadow-sm">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Sub-task Checklist</label>
                <div className="space-y-1.5">
                  {selectedTask.description?.split('\n').map((line: string, idx: number) => {
                    const isCheckbox = /^- \[[ xX]\]/.test(line)
                    if (!isCheckbox) return null
                    const isChecked = /^- \[[xX]\]/.test(line)
                    const text = line.replace(/^- \[[ xX]\]\s*/, '')
                    const checkIdx = selectedTask.description
                      ?.substring(0, selectedTask.description.split('\n').slice(0, idx).join('\n').length + idx)
                      .split(/- \[[ xX]\]/g).length - 1

                    return (
                      <div key={idx} className="flex items-center gap-3.5 py-2 hover:bg-muted/40 px-3 rounded-lg transition-colors cursor-pointer" onClick={() => toggleChecklistItem(checkIdx)}>
                        <button
                          className={`size-5 rounded-lg border flex items-center justify-center transition-all ${
                            isChecked 
                              ? 'bg-blue-500 border-blue-500 text-white shadow-sm shadow-blue-500/20' 
                              : 'border-border bg-background hover:border-muted-foreground/50'
                          }`}
                        >
                          {isChecked && <Check className="size-3.5 text-white stroke-[3px]" />}
                        </button>
                        <span className={`text-sm font-semibold ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Comments / Activity */}
            <Separator className="bg-border/50" />
            <div className="space-y-5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" /> Discussion Thread
              </label>
              <div className="flex gap-3 mb-6">
                <Input
                  placeholder="Post a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment()
                  }}
                  className="flex-1 h-12 border-border/60 rounded-xl text-sm bg-background hover:bg-muted/30 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-all shadow-sm"
                />
                <Button size="lg" disabled={!newCommentText.trim() || isAddingComment}
                  onClick={handleAddComment}
                  className="h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 px-5">
                  <Send className="size-4" />
                </Button>
              </div>
              <div className="space-y-4 pt-2">
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8 font-medium">No comments posted yet.</p>
                )}
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="size-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500 shrink-0 shadow-sm">
                      {getInitials(comment.user)}
                    </div>
                    <div className="flex-1 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-foreground">{getUserName(comment.user)}</span>
                        <span className="text-xs font-bold text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pane: Properties Panel */}
          <div className="w-[300px] overflow-y-auto p-6 border-l border-border bg-muted/10 space-y-7 shrink-0 select-none">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" /> Issue Properties
            </h4>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Status</label>
              <Select value={selectedTask.status} onValueChange={(val) => {
                onUpdateTaskStatus(selectedTask.id, val)
              }}>
                <SelectTrigger className="h-11 text-sm border-border/60 rounded-xl bg-card shadow-sm hover:bg-muted/50 font-semibold focus:ring-1 focus:ring-blue-500"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-sm cursor-pointer">
                      <span className="flex items-center gap-2.5"><span className={`size-2 rounded-full ${v.dot}`} />{v.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Priority</label>
              <Select value={selectedTask.priority} onValueChange={(val) => {
                onUpdateTaskDetails(selectedTask.id, {
                  ...selectedTask,
                  priority: val,
                  dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
                  startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
                })
              }}>
                <SelectTrigger className="h-11 text-sm border-border/60 rounded-xl bg-card shadow-sm hover:bg-muted/50 font-semibold focus:ring-1 focus:ring-blue-500"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-sm cursor-pointer">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Assignee</label>
              <Select value={selectedTask.assigneeId ?? 'unassigned'} onValueChange={(val) => {
                const assigneeId = val === 'unassigned' ? null : val
                onUpdateTaskDetails(selectedTask.id, {
                  ...selectedTask,
                  assigneeId,
                  dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
                  startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
                })
              }}>
                <SelectTrigger className="h-11 text-sm border-border/60 rounded-xl bg-card shadow-sm hover:bg-muted/50 font-semibold focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="unassigned" className="text-sm cursor-pointer">Unassigned</SelectItem>
                  {members.map(m => <SelectItem key={m.id} value={m.id} className="text-sm cursor-pointer">{getUserName(m)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Sprint */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Sprint</label>
              <Select value={selectedTask.sprintId ?? 'none'} onValueChange={(val) => {
                const sprintId = val === 'none' ? null : val
                onUpdateTaskDetails(selectedTask.id, {
                  ...selectedTask,
                  sprintId,
                  dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
                  startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
                })
              }}>
                <SelectTrigger className="h-11 text-sm border-border/60 rounded-xl bg-card shadow-sm hover:bg-muted/50 font-semibold focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="none" className="text-sm cursor-pointer">None</SelectItem>
                  {sprints.filter(s => s.status !== 'COMPLETED').map(s =>
                    <SelectItem key={s.id} value={s.id} className="text-sm cursor-pointer">{s.name}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-team */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Sub-team</label>
              <Select value={selectedTask.subTeamId ?? 'none'} onValueChange={(val) => {
                const subTeamId = val === 'none' ? null : val
                onUpdateTaskDetails(selectedTask.id, {
                  ...selectedTask,
                  subTeamId,
                  dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
                  startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
                })
              }}>
                <SelectTrigger className="h-11 text-sm border-border/60 rounded-xl bg-card shadow-sm hover:bg-muted/50 font-semibold focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="none" className="text-sm cursor-pointer">None</SelectItem>
                  {teams.map(t => <SelectItem key={t.id} value={t.id} className="text-sm cursor-pointer">{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={selectedTask.startDate ? new Date(selectedTask.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const val = e.target.value
                  onUpdateTaskDetails(selectedTask.id, {
                    ...selectedTask,
                    startDate: val ? new Date(val) : null,
                    dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null
                  })
                }}
                className="w-full h-11 text-sm border border-border/60 rounded-xl bg-card shadow-sm hover:bg-muted/50 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 px-4 text-foreground"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Due Date</label>
              <input
                type="date"
                value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const val = e.target.value
                  onUpdateTaskDetails(selectedTask.id, {
                    ...selectedTask,
                    dueDate: val ? new Date(val) : null,
                    startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null
                  })
                }}
                className="w-full h-11 text-sm border border-border/60 rounded-xl bg-card shadow-sm hover:bg-muted/50 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 px-4 text-foreground"
              />
            </div>

            <Separator className="bg-border/50" />

            {/* Timestamps */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                <CalendarDays className="size-4 text-muted-foreground" /> Time Metrics
              </div>
              <div className="space-y-2.5 text-xs font-semibold text-muted-foreground">
                <p className="flex justify-between items-center">
                  <span>Created:</span>
                  <span className="text-foreground">{new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                </p>
                <p className="flex justify-between items-center">
                  <span>Updated:</span>
                  <span className="text-foreground">{new Date(selectedTask.updatedAt).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
