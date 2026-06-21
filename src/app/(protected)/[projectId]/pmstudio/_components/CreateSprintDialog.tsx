import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
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

  // Default dates to today and today + 14 days when the sheet opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const future = new Date()
      future.setDate(today.getDate() + 14)

      setStartDate(today.toISOString().split('T')[0] ?? '')
      setEndDate(future.toISOString().split('T')[0] ?? '')
    }
  }, [isOpen])

  const handleCreate = () => {
    if (name.trim()) {
      const start = startDate ? new Date(startDate) : new Date()
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      onCreateSprint(name.trim(), start, end)
      setName('')
      onClose()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent 
        side="bottom" 
        className="w-full max-w-xl mx-auto rounded-t-[28px] border-t border-x border-border bg-card p-8 shadow-2xl focus:outline-none select-none text-foreground"
      >
        <SheetHeader className="mb-5">
          <SheetTitle className="text-lg font-bold text-foreground">Create New Sprint</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Sprint Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Sprint 1 - Core Backend" 
              className="h-11 border-border/60 rounded-xl text-sm bg-background hover:bg-muted/30 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Start Date</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="h-11 border-border/60 rounded-xl text-sm bg-background hover:bg-muted/30 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-sm px-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">End Date</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="h-11 border-border/60 rounded-xl text-sm bg-background hover:bg-muted/30 focus:bg-background focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-sm px-4"
              />
            </div>
          </div>
        </div>
        <SheetFooter className="mt-8 flex gap-3">
          <Button variant="outline" className="h-11 border-border/60 rounded-xl text-sm font-semibold px-6 hover:bg-muted/50" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!name.trim() || isCreating}
            onClick={handleCreate}
            className="h-11 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 text-sm font-semibold px-6"
          >
            Start Sprint
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
