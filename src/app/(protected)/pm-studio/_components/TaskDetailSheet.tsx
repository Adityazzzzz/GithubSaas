import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Trash2,
  MessageSquare,
  Send,
  Check,
  Clock,
  CheckCircle2,
  User,
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
    })
  }

  const handleAddComment = () => {
    if (newCommentText.trim()) {
      onAddComment(selectedTask.id, newCommentText.trim())
      setNewCommentText('')
    }
  }

  return (
    <Sheet open={!!selectedTask} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="sm:max-w-3xl p-0 flex flex-col overflow-hidden bg-white select-none border-l border-slate-100 shadow-2xl">
        {/* Header */}
        <SheetHeader className="px-6 py-4.5 border-b border-slate-100 shrink-0 bg-slate-50/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs font-bold bg-slate-50 text-slate-500 border-slate-200">{selectedTask.issueKey}</Badge>
              <SheetTitle className="text-sm sr-only">Issue Inspector</SheetTitle>
            </div>
            <Button variant="ghost" size="sm" className="h-8.5 text-red-600 hover:text-red-700 hover:bg-red-50/80 rounded-lg gap-1.5 px-3 text-xs font-semibold"
              onClick={() => onDelete(selectedTask.id)}>
              <Trash2 className="size-3.5" /> Delete Issue
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Left Pane: Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0">
            {/* Title */}
            <div className="space-y-1">
              <Input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleSaveDetails}
                className="text-lg font-bold border-0 shadow-none p-0 h-auto focus-visible:ring-0 text-slate-800 focus:bg-slate-50/50 rounded-lg px-2 py-1.5 -ml-2 transition-all placeholder-slate-300"
                placeholder="Issue title"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur()
                  }
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
              <Textarea
                value={localDesc}
                onChange={(e) => setLocalDesc(e.target.value)}
                onBlur={handleSaveDetails}
                placeholder="Describe this issue... Support markdown checklists (- [ ] task)."
                className="min-h-[140px] resize-none border-slate-200 rounded-xl text-sm placeholder-slate-400 bg-slate-50/20 hover:bg-slate-50/40 focus:bg-white transition-all p-3"
              />
            </div>

            {/* Checklist */}
            {getChecklistStats(selectedTask.description).total > 0 && (
              <div className="space-y-3 p-4 border border-slate-100 rounded-xl bg-slate-50/30">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sub-task Checklist</label>
                <div className="space-y-1">
                  {selectedTask.description?.split('\n').map((line: string, idx: number) => {
                    const isCheckbox = /^- \[[ xX]\]/.test(line)
                    if (!isCheckbox) return null
                    const isChecked = /^- \[[xX]\]/.test(line)
                    const text = line.replace(/^- \[[ xX]\]\s*/, '')
                    const checkIdx = selectedTask.description
                      ?.substring(0, selectedTask.description.split('\n').slice(0, idx).join('\n').length + idx)
                      .split(/- \[[ xX]\]/g).length - 1

                    return (
                      <div key={idx} className="flex items-center gap-3.5 py-1.5 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                        <button
                          onClick={() => toggleChecklistItem(checkIdx)}
                          className={`size-4.5 rounded-lg border flex items-center justify-center transition-all ${
                            isChecked 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10' 
                              : 'border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          {isChecked && <Check className="size-3 text-white stroke-[3px]" />}
                        </button>
                        <span className={`text-xs font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>{text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Comments / Activity */}
            <Separator className="bg-slate-100" />
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="size-3.5 text-slate-400" /> Discussion Thread
              </label>
              <div className="flex gap-2.5 mb-4">
                <Input
                  placeholder="Post a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment()
                  }}
                  className="flex-1 h-10 border-slate-200 rounded-xl text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all"
                />
                <Button size="sm" disabled={!newCommentText.trim() || isAddingComment}
                  onClick={handleAddComment}
                  className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10 px-4">
                  <Send className="size-4" />
                </Button>
              </div>
              <div className="space-y-4 pt-2">
                {comments.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4 font-medium">No comments posted yet.</p>
                )}
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="size-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0 shadow-sm">
                      {getInitials(comment.user)}
                    </div>
                    <div className="flex-1 bg-slate-50/40 p-3 rounded-xl border border-slate-100/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">{getUserName(comment.user)}</span>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pane: Properties Panel */}
          <div className="w-[260px] overflow-y-auto p-5 border-l border-slate-100 bg-slate-50/30 space-y-5 shrink-0 select-none">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="size-3.5 text-slate-400" /> Issue Properties
            </h4>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</label>
              <Select value={selectedTask.status} onValueChange={(val) => {
                onUpdateTaskStatus(selectedTask.id, val)
              }}>
                <SelectTrigger className="h-9 text-xs border-slate-200 rounded-xl bg-white shadow-sm hover:bg-slate-50 font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">
                      <span className="flex items-center gap-2"><span className={`size-1.5 rounded-full ${v.dot}`} />{v.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority</label>
              <Select value={selectedTask.priority} onValueChange={(val) => {
                onUpdateTaskDetails(selectedTask.id, {
                  ...selectedTask,
                  priority: val,
                  dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null
                })
              }}>
                <SelectTrigger className="h-9 text-xs border-slate-200 rounded-xl bg-white shadow-sm hover:bg-slate-50 font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assignee</label>
              <Select value={selectedTask.assigneeId ?? 'unassigned'} onValueChange={(val) => {
                const assigneeId = val === 'unassigned' ? null : val
                onUpdateTaskDetails(selectedTask.id, {
                  ...selectedTask,
                  assigneeId,
                  dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null
                })
              }}>
                <SelectTrigger className="h-9 text-xs border-slate-200 rounded-xl bg-white shadow-sm hover:bg-slate-50 font-semibold"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
                  {members.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{getUserName(m)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Sprint */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sprint</label>
              <Select value={selectedTask.sprintId ?? 'none'} onValueChange={(val) => {
                const sprintId = val === 'none' ? null : val
                onUpdateTaskDetails(selectedTask.id, {
                  ...selectedTask,
                  sprintId,
                  dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null
                })
              }}>
                <SelectTrigger className="h-9 text-xs border-slate-200 rounded-xl bg-white shadow-sm hover:bg-slate-50 font-semibold"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none" className="text-xs">None</SelectItem>
                  {sprints.filter(s => s.status !== 'COMPLETED').map(s =>
                    <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-team */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sub-team</label>
              <Select value={selectedTask.subTeamId ?? 'none'} onValueChange={(val) => {
                const subTeamId = val === 'none' ? null : val
                onUpdateTaskDetails(selectedTask.id, {
                  ...selectedTask,
                  subTeamId,
                  dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null
                })
              }}>
                <SelectTrigger className="h-9 text-xs border-slate-200 rounded-xl bg-white shadow-sm hover:bg-slate-50 font-semibold"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none" className="text-xs">None</SelectItem>
                  {teams.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-slate-150" />

            {/* Timestamps */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                <CalendarDays className="size-3.5 text-slate-400" /> Time Metrics
              </div>
              <div className="space-y-1.5 text-[11px] font-semibold text-slate-500">
                <p className="flex justify-between">
                  <span>Created:</span>
                  <span className="text-slate-600">{new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                </p>
                <p className="flex justify-between">
                  <span>Updated:</span>
                  <span className="text-slate-600">{new Date(selectedTask.updatedAt).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
