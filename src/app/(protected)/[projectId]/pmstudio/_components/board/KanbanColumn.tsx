import React, { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  col: { id: string; label: string; dot: string; topBorder: string }
  tasks: any[]
  dragOverColId: string | null
  setDragOverColId: (id: string | null) => void
  onDrop: (e: React.DragEvent, status: string) => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onCardClick: (task: any) => void
  onCreateTaskInline: (status: string, title: string) => void
}

export function KanbanColumn({
  col,
  tasks,
  dragOverColId,
  setDragOverColId,
  onDrop,
  onDragStart,
  onCardClick,
  onCreateTaskInline
}: KanbanColumnProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [inlineTitle, setInlineTitle] = useState('')

  const isDragOver = dragOverColId === col.id

  const handleCreateInline = () => {
    if (inlineTitle.trim()) {
      onCreateTaskInline(col.id, inlineTitle.trim())
      setInlineTitle('')
      setIsCreating(false)
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (dragOverColId !== col.id) setDragOverColId(col.id) }}
      onDragLeave={() => setDragOverColId(null)}
      onDrop={(e) => onDrop(e, col.id)}
      className={`w-[280px] shrink-0 flex flex-col max-h-full rounded-xl transition-all duration-200 ${
        isDragOver ? 'bg-muted border border-border' : 'bg-muted/50 border border-transparent'
      }`}
    >
      {/* Column Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${col.dot}`} />
          <span className="text-base font-semibold text-foreground tracking-tight">{col.label}</span>
          <span className="px-1.5 py-0.5 rounded text-xs font-bold text-muted-foreground tabular-nums">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Body */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-1 space-y-3 min-h-[200px]">
          {isDragOver && (
            <div className="h-16 border-2 border-dashed border-primary/20 bg-primary/10 rounded-xl flex items-center justify-center text-sm text-primary font-semibold animate-pulse">
              Drop here
            </div>
          )}

          {tasks.map(task => (
            <KanbanCard 
              key={task.id} 
              task={task} 
              onDragStart={onDragStart} 
              onClick={onCardClick} 
            />
          ))}
        </div>
      </ScrollArea>

      {/* Inline Creator */}
      <div className="p-2 shrink-0 bg-transparent mt-1 border-t border-border">
        {isCreating ? (
          <div className="space-y-2 bg-background p-2 rounded-lg border border-border shadow-sm">
            <Input 
              value={inlineTitle}
              onChange={(e) => setInlineTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="h-9 text-sm border-border rounded-lg focus-visible:ring-1 bg-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateInline()
                if (e.key === 'Escape') setIsCreating(false)
              }}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 text-xs px-4 rounded-lg font-bold" onClick={handleCreateInline}>Add Card</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-muted" onClick={() => setIsCreating(false)}>
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-9 text-sm font-semibold text-muted-foreground hover:text-foreground justify-start gap-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => {
              setIsCreating(true)
              setInlineTitle('')
            }}
          >
            <Plus className="size-4" />
            Create task
          </Button>
        )}
      </div>
    </div>
  )
}
