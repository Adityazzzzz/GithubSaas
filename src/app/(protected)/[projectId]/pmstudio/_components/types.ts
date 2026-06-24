import { ArrowDown, ArrowUp, Minus, ChevronsUp } from 'lucide-react'

export type TabType = 'board' | 'calendar' | 'teams' | 'automations' | 'analytics'
export type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'text-blue-600 bg-slate-50 border-blue-200', dot: 'bg-blue-500', icon: ArrowDown },
  MEDIUM: { label: 'Medium', color: 'text-amber-600 bg-slate-50 border-amber-200', dot: 'bg-amber-500', icon: Minus },
  HIGH: { label: 'High', color: 'text-orange-600 bg-slate-50 border-orange-200', dot: 'bg-orange-500', icon: ArrowUp },
  URGENT: { label: 'Urgent', color: 'text-red-600 bg-slate-50 border-red-200', dot: 'bg-red-500', icon: ChevronsUp },
} as const

export const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  BACKLOG: { label: 'Backlog', color: 'text-slate-600 bg-slate-50 border-slate-200/60', dot: 'bg-slate-400' },
  TODO: { label: 'To Do', color: 'text-blue-700 bg-blue-50/80 border-blue-200/50', dot: 'bg-blue-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-700 bg-amber-50/80 border-amber-200/50', dot: 'bg-amber-500' },
  REVIEW: { label: 'In Review', color: 'text-violet-700 bg-violet-50/80 border-violet-200/50', dot: 'bg-violet-500' },
  DONE: { label: 'Done', color: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/50', dot: 'bg-emerald-500' },
}

export const BOARD_COLUMNS = [
  { id: 'BACKLOG', label: 'Backlog', dot: 'bg-slate-500', topBorder: 'border-t-4 border-t-slate-400' }, 
  { id: 'TODO', label: 'To Do', dot: 'bg-blue-500', topBorder: 'border-t-4 border-t-amber-500' }, 
  { id: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-amber-500', topBorder: 'border-t-4 border-t-blue-500' }, 
  { id: 'REVIEW', label: 'In Review', dot: 'bg-violet-500', topBorder: 'border-t-4 border-t-purple-500' }, 
  { id: 'DONE', label: 'Done', dot: 'bg-emerald-500', topBorder: 'border-t-4 border-t-emerald-500' }, 
]

export const getInitials = (user: any) => {
  if (!user) return '?'
  if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`
  if (user.firstName) return user.firstName[0]
  return user.emailAddress ? user.emailAddress[0]!.toUpperCase() : '?'
}

export const getUserName = (user: any) => {
  if (!user) return 'Unassigned'
  if (user.firstName) return `${user.firstName} ${user.lastName ?? ''}`.trim()
  return user.emailAddress ?? 'Unknown'
}
