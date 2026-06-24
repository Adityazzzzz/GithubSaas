import React, { useState, useEffect, useRef } from 'react'
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
  const MOCK_TRANSCRIPT = [
    { start: 0, end: 3, text: "Hey squad! I wanted to show you a quick status update on the sprint." },
    { start: 3, end: 7, text: "The backend tRPC mutations for rules execution are now fully completed." },
    { start: 7, end: 12, text: "I also updated the calendar timeline with sub-team groupings and vertical stacking." },
    { start: 12, end: 16, text: "Google Meet rooms now have lobby exit paths and close buttons in the corner." },
    { start: 16, end: 20, text: "Please check the PR details and let me know if you have any questions." },
    { start: 20, end: 25, text: "I'll upload the compiled build logs for staging verification next. Thanks!" }
  ]

  const [localTitle, setLocalTitle] = useState('')
  const [localDesc, setLocalDesc] = useState('')
  const [newCommentText, setNewCommentText] = useState('')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
      videoRef.current.play()
    }
  }

  // Sync state with selectedTask prop changes
  useEffect(() => {
    if (selectedTask) {
      setLocalTitle(selectedTask.title || '')
      
      // Strip Loom headers & video tags for clean text editing
      let desc = selectedTask.description || ''
      desc = desc.replace(/### 📹 Loom Video Sync[\s\S]*?(?=<video|<iframe|$)/g, '')
      desc = desc.replace(/<video[\s\S]*?\/>/g, '')
      desc = desc.trim()
      setLocalDesc(desc)
    }
  }, [selectedTask])

  if (!selectedTask) return null

  // Extract Loom details
  const videoUrlMatch = selectedTask.description?.match(/<video src="([^"]+)"/);
  const videoUrl = videoUrlMatch ? videoUrlMatch[1] : null;

  const transcriptMatch = selectedTask.description?.match(/data-transcript="([^"]+)"/);
  const activeTranscript = (() => {
    if (transcriptMatch) {
      try {
        return JSON.parse(decodeURIComponent(transcriptMatch[1]))
      } catch (e) {
        console.error("Failed to parse real transcript:", e)
      }
    }
    return MOCK_TRANSCRIPT
  })()

  const handleSaveDetails = () => {
    let finalDesc = localDesc.trim()
    
    // Append Loom video details back if they were present
    const prevVideoUrlMatch = selectedTask.description?.match(/<video src="([^"]+)"/);
    if (prevVideoUrlMatch) {
      const recordedVideoUrl = prevVideoUrlMatch[1];
      
      const prevTranscriptMatch = selectedTask.description?.match(/data-transcript="([^"]+)"/);
      const dataTranscriptAttr = prevTranscriptMatch ? `data-transcript="${prevTranscriptMatch[1]}" ` : '';

      const videoHtml = `<video src="${recordedVideoUrl}" ${dataTranscriptAttr}controls class="w-full max-w-md rounded-xl my-2 border border-border shadow" />`
      
      const publicLinkMatch = selectedTask.description?.match(/\[🔗 Copy Public Share Link\]\(([^)]+)\)/);
      const publicUrl = publicLinkMatch ? publicLinkMatch[1] : '';

      finalDesc = `### 📹 Loom Video Sync
Recorded asynchronous status update for squad review.

[🔗 Copy Public Share Link](${publicUrl})

${videoHtml}

${finalDesc}`.trim();
    }

    if (localTitle.trim() !== selectedTask.title || finalDesc !== (selectedTask.description || '')) {
      onUpdateTaskDetails(selectedTask.id, {
        title: localTitle.trim() || selectedTask.title,
        description: finalDesc,
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
      <DialogContent className="max-w-[92vw] lg:max-w-7xl p-0 flex flex-col h-[90vh] overflow-hidden bg-background border-border rounded-2xl shadow-2xl select-none">
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
          <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8 min-w-0 scrollbar-thin">
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

            {videoUrl && (
              <div className="border border-border/70 rounded-2xl bg-card/30 backdrop-blur-sm overflow-hidden shadow-lg p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Video Player */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between shrink-0">
                    <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <span className="size-2 bg-rose-500 rounded-full animate-pulse" /> Live Status Recording
                    </label>
                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-0.5 px-2 font-bold uppercase tracking-wider">Cloud Storage</Badge>
                  </div>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-border/80 relative shadow-2xl">
                    <video 
                      ref={videoRef}
                      src={videoUrl} 
                      controls 
                      className="size-full object-contain"
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    />
                  </div>
                </div>

                {/* Live Transcription */}
                <div className="md:col-span-5 flex flex-col h-full min-h-[300px]">
                  <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-4 flex items-center justify-between shrink-0">
                    <span className="flex items-center gap-1.5">✨ Live Transcription</span>
                    <Badge variant="secondary" className="text-[9px] bg-blue-500/10 text-blue-600 border-blue-500/20 font-mono py-0.5 px-2 hover:bg-blue-500/15 font-bold">Interactive</Badge>
                  </label>
                  <div className="flex-1 bg-muted/20 border border-border/60 rounded-2xl p-5 overflow-y-auto max-h-[380px] min-h-[300px] space-y-3 scrollbar-thin">
                    {activeTranscript.map((seg: any, sIdx: number) => {
                      const isActive = currentTime >= seg.start && currentTime <= seg.end;
                      return (
                        <div 
                          key={sIdx} 
                          onClick={() => handleSeek(seg.start)}
                          className={`text-xs p-3.5 rounded-xl cursor-pointer border transition-all duration-200 leading-relaxed ${
                            isActive 
                              ? 'bg-blue-500/10 border-blue-500/30 text-foreground font-semibold shadow-md translate-x-1' 
                              : 'bg-card/40 border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/10 hover:border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[9px] font-mono font-bold tracking-wider ${isActive ? 'text-blue-500' : 'text-muted-foreground/60'}`}>
                              {Math.floor(seg.start / 60)}:{(seg.start % 60).toString().padStart(2, '0')}
                            </span>
                            {isActive && <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />}
                          </div>
                          <p className="font-medium">{seg.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Description</label>
              <Textarea
                value={localDesc}
                onChange={(e) => setLocalDesc(e.target.value)}
                onBlur={handleSaveDetails}
                placeholder="Describe this issue... Support markdown checklists (- [ ] task)."
                className="min-h-[220px] resize-none border-border/60 rounded-xl text-sm placeholder-muted-foreground bg-background hover:bg-muted/20 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-all p-4 shadow-sm"
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
          <div className="w-[320px] overflow-y-auto p-6 border-l border-border bg-muted/5 space-y-6 shrink-0 select-none scrollbar-thin">
            <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
              <Activity className="size-4 text-muted-foreground" /> Issue Properties
            </h4>

            <div className="space-y-4">
              {/* Status */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <label className="col-span-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                <div className="col-span-2">
                  <Select value={selectedTask.status} onValueChange={(val) => {
                    onUpdateTaskStatus(selectedTask.id, val)
                  }}>
                    <SelectTrigger className="h-9 text-xs border-border/50 rounded-lg bg-card shadow-none hover:bg-muted/30 font-semibold focus:ring-1 focus:ring-blue-500 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs cursor-pointer">
                          <span className="flex items-center gap-2"><span className={`size-2 rounded-full ${v.dot}`} />{v.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Priority */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <label className="col-span-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
                <div className="col-span-2">
                  <Select value={selectedTask.priority} onValueChange={(val) => {
                    onUpdateTaskDetails(selectedTask.id, {
                      ...selectedTask,
                      priority: val,
                      dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
                      startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
                    })
                  }}>
                    <SelectTrigger className="h-9 text-xs border-border/50 rounded-lg bg-card shadow-none hover:bg-muted/30 font-semibold focus:ring-1 focus:ring-blue-500 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                      {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs cursor-pointer">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assignee */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <label className="col-span-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assignee</label>
                <div className="col-span-2">
                  <Select value={selectedTask.assigneeId ?? 'unassigned'} onValueChange={(val) => {
                    const assigneeId = val === 'unassigned' ? null : val
                    onUpdateTaskDetails(selectedTask.id, {
                      ...selectedTask,
                      assigneeId,
                      dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
                      startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
                    })
                  }}>
                    <SelectTrigger className="h-9 text-xs border-border/50 rounded-lg bg-card shadow-none hover:bg-muted/30 font-semibold focus:ring-1 focus:ring-blue-500 w-full"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                      <SelectItem value="unassigned" className="text-xs cursor-pointer">Unassigned</SelectItem>
                      {members.map(m => <SelectItem key={m.id} value={m.id} className="text-xs cursor-pointer">{getUserName(m)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sprint */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <label className="col-span-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sprint</label>
                <div className="col-span-2">
                  <Select value={selectedTask.sprintId ?? 'none'} onValueChange={(val) => {
                    const sprintId = val === 'none' ? null : val
                    onUpdateTaskDetails(selectedTask.id, {
                      ...selectedTask,
                      sprintId,
                      dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
                      startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
                    })
                  }}>
                    <SelectTrigger className="h-9 text-xs border-border/50 rounded-lg bg-card shadow-none hover:bg-muted/30 font-semibold focus:ring-1 focus:ring-blue-500 w-full"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                      <SelectItem value="none" className="text-xs cursor-pointer">None</SelectItem>
                      {sprints.filter(s => s.status !== 'COMPLETED').map(s =>
                        <SelectItem key={s.id} value={s.id} className="text-xs cursor-pointer">{s.name}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sub-team */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <label className="col-span-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sub-team</label>
                <div className="col-span-2">
                  <Select value={selectedTask.subTeamId ?? 'none'} onValueChange={(val) => {
                    const subTeamId = val === 'none' ? null : val
                    onUpdateTaskDetails(selectedTask.id, {
                      ...selectedTask,
                      subTeamId,
                      dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null,
                      startDate: selectedTask.startDate ? new Date(selectedTask.startDate) : null,
                    })
                  }}>
                    <SelectTrigger className="h-9 text-xs border-border/50 rounded-lg bg-card shadow-none hover:bg-muted/30 font-semibold focus:ring-1 focus:ring-blue-500 w-full"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                      <SelectItem value="none" className="text-xs cursor-pointer">None</SelectItem>
                      {teams.map(t => <SelectItem key={t.id} value={t.id} className="text-xs cursor-pointer">{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Start Date */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <label className="col-span-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Start Date</label>
                <div className="col-span-2">
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
                    className="w-full h-9 text-xs border border-border/50 rounded-lg bg-card shadow-none hover:bg-muted/30 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 text-foreground"
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <label className="col-span-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Due Date</label>
                <div className="col-span-2">
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
                    className="w-full h-9 text-xs border border-border/50 rounded-lg bg-card shadow-none hover:bg-muted/30 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 text-foreground"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Timestamps */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                <CalendarDays className="size-4 text-muted-foreground" /> Time Metrics
              </div>
              <div className="space-y-2 text-xs font-semibold text-muted-foreground">
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
