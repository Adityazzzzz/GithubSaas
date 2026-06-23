import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRIORITY_CONFIG, getUserName } from './types'
import type { PriorityType } from './types'

interface CreateTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (
    title: string,
    description: string | null,
    priority: PriorityType,
    sprintId: string | null,
    subTeamId: string | null,
    assigneeId: string | null,
    status?: string,
    dueDate?: Date | null,
    startDate?: Date | null
  ) => void
  isCreating: boolean
  members: any[]
  sprints: any[]
  teams: any[]
  defaultDueDate?: Date | null
}

export function CreateTaskDialog({
  isOpen,
  onClose,
  onCreateTask,
  isCreating,
  members,
  sprints,
  teams,
  defaultDueDate,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<PriorityType>('MEDIUM')
  const [assigneeId, setAssigneeId] = useState<string>('none')
  const [sprintId, setSprintId] = useState<string>('none')
  const [subTeamId, setSubTeamId] = useState<string>('none')
  const [dueDate, setDueDate] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')

  // Sync date when dialog opens
  useEffect(() => {
    if (isOpen) {
      setDueDate(defaultDueDate ? (defaultDueDate.toISOString().split('T')[0] ?? '') : '')
      setStartDate(defaultDueDate ? (defaultDueDate.toISOString().split('T')[0] ?? '') : '')
    }
  }, [isOpen, defaultDueDate])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('MEDIUM')
    setAssigneeId('none')
    setSprintId('none')
    setSubTeamId('none')
    setDueDate('')
    setStartDate('')
  }

  const handleCreate = () => {
    if (title.trim()) {
      onCreateTask(
        title.trim(),
        description.trim() || null,
        priority,
        sprintId === 'none' ? null : sprintId,
        subTeamId === 'none' ? null : subTeamId,
        assigneeId === 'none' ? null : assigneeId,
        undefined, // status
        defaultDueDate ? defaultDueDate : (dueDate ? new Date(dueDate) : null),
        defaultDueDate ? defaultDueDate : (startDate ? new Date(startDate) : null)
      )
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetForm(); } }}>
      <DialogContent className="sm:max-w-xl rounded-2xl border-border bg-card shadow-2xl p-7 select-none">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">Create New Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Issue Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What needs to be done?" 
              className="h-11 border-border/60 rounded-xl text-sm bg-background hover:bg-muted/30 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Description</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Add details or checklist items (- [ ] check)..." 
              className="min-h-[120px] border-border/60 rounded-xl text-sm bg-background hover:bg-muted/30 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-sm p-3.5 resize-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as PriorityType)}>
                <SelectTrigger className="h-10 text-sm border-border/60 rounded-xl bg-background hover:bg-muted/30 shadow-sm font-semibold focus:ring-1 focus:ring-blue-500"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-sm cursor-pointer">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Assignee</label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-10 text-sm border-border/60 rounded-xl bg-background hover:bg-muted/30 shadow-sm font-semibold focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="none" className="text-sm cursor-pointer">Unassigned</SelectItem>
                  {members.map(m => <SelectItem key={m.id} value={m.id} className="text-sm cursor-pointer">{getUserName(m)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Sprint</label>
              <Select value={sprintId} onValueChange={setSprintId}>
                <SelectTrigger className="h-10 text-sm border-border/60 rounded-xl bg-background hover:bg-muted/30 shadow-sm font-semibold focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="Backlog" /></SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="none" className="text-sm cursor-pointer">Backlog</SelectItem>
                  {sprints.filter(s => s.status !== 'COMPLETED').map(s => <SelectItem key={s.id} value={s.id} className="text-sm cursor-pointer">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Sub-Team</label>
              <Select value={subTeamId} onValueChange={setSubTeamId}>
                <SelectTrigger className="h-10 text-sm border-border/60 rounded-xl bg-background hover:bg-muted/30 shadow-sm font-semibold focus:ring-1 focus:ring-blue-500"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="none" className="text-sm cursor-pointer">None</SelectItem>
                  {teams.map(t => <SelectItem key={t.id} value={t.id} className="text-sm cursor-pointer">{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!defaultDueDate && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 text-sm border-border/60 rounded-xl bg-background hover:bg-muted/30 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-sm font-semibold px-4 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Due Date</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 text-sm border-border/60 rounded-xl bg-background hover:bg-muted/30 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-sm font-semibold px-4 py-2"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <DialogFooter className="pt-3">
          <Button variant="outline" className="h-10 border-border/60 rounded-xl text-sm font-semibold px-6 hover:bg-muted/50" onClick={() => { onClose(); resetForm(); }}>Cancel</Button>
          <Button
            disabled={!title.trim() || isCreating}
            onClick={handleCreate}
            className="h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 text-sm font-semibold px-6"
          >
            Create Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
