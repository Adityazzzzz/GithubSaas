import React, { useState } from 'react'
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
    assigneeId: string | null
  ) => void
  isCreating: boolean
  members: any[]
  sprints: any[]
  teams: any[]
}

export function CreateTaskDialog({
  isOpen,
  onClose,
  onCreateTask,
  isCreating,
  members,
  sprints,
  teams,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<PriorityType>('MEDIUM')
  const [assigneeId, setAssigneeId] = useState<string>('none')
  const [sprintId, setSprintId] = useState<string>('none')
  const [subTeamId, setSubTeamId] = useState<string>('none')

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('MEDIUM')
    setAssigneeId('none')
    setSprintId('none')
    setSubTeamId('none')
  }

  const handleCreate = () => {
    if (title.trim()) {
      onCreateTask(
        title.trim(),
        description.trim() || null,
        priority,
        sprintId === 'none' ? null : sprintId,
        subTeamId === 'none' ? null : subTeamId,
        assigneeId === 'none' ? null : assigneeId
      )
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetForm(); } }}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-slate-100 bg-white shadow-2xl p-6 select-none">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-800">Create New Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Issue Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What needs to be done?" 
              className="h-10 border-slate-200 rounded-xl text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Add details or checklist items (- [ ] check)..." 
              className="min-h-[90px] border-slate-200 rounded-xl text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors p-3 resize-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as PriorityType)}>
                <SelectTrigger className="h-10 text-xs border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assignee</label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-10 text-xs border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 font-semibold"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none" className="text-xs">Unassigned</SelectItem>
                  {members.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{getUserName(m)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sprint</label>
              <Select value={sprintId} onValueChange={setSprintId}>
                <SelectTrigger className="h-10 text-xs border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 font-semibold"><SelectValue placeholder="Backlog" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none" className="text-xs">Backlog</SelectItem>
                  {sprints.filter(s => s.status !== 'COMPLETED').map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sub-Team</label>
              <Select value={subTeamId} onValueChange={setSubTeamId}>
                <SelectTrigger className="h-10 text-xs border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 font-semibold"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none" className="text-xs">None</SelectItem>
                  {teams.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button variant="outline" className="h-10 border-slate-200 rounded-xl text-xs font-semibold" onClick={() => { onClose(); resetForm(); }}>Cancel</Button>
          <Button
            disabled={!title.trim() || isCreating}
            onClick={handleCreate}
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10 text-xs font-semibold px-4"
          >
            Create Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
