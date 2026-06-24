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

interface CreateSprintDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateSprint: (name: string, startDate: Date, endDate: Date) => void
  isCreating: boolean
}

export function CreateSprintDialog({
  isOpen,
  onClose,
  onCreateSprint,
  isCreating,
}: CreateSprintDialogProps) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Default dates to today and today + 14 days when the dialog opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const future = new Date()
      future.setDate(today.getDate() + 14)

      setStartDate(today.toISOString().split('T')[0]!)
      setEndDate(future.toISOString().split('T')[0]!)
    }
  }, [isOpen])

  const handleCreate = () => {
    if (name.trim()) {
      const start = startDate ? new Date(startDate) : new Date()
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      onCreateSprint(name.trim(), start, end)
      setName('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md rounded-2xl border-slate-100 bg-white shadow-2xl p-6 select-none">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-800">Create Sprint</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sprint Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Sprint 1" 
              className="h-10 border-slate-200 rounded-xl text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Start Date</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="h-10 border-slate-200 rounded-xl text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">End Date</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="h-10 border-slate-200 rounded-xl text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button variant="outline" className="h-10 border-slate-200 rounded-xl text-xs font-semibold" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!name.trim() || isCreating}
            onClick={handleCreate}
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10 text-xs font-semibold px-4"
          >
            Create Sprint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
