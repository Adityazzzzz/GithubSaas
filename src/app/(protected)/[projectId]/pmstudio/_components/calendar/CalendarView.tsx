import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Globe, Video, Clock, Settings, CalendarDays, LayoutGrid, LayoutList, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface CalendarViewProps {
  tasks: any[]
  teams?: any[]
  members?: any[]
  onCardClick: (task: any) => void
  onNewIssueClick: (date?: Date) => void
}

export function CalendarView({ 
  tasks, 
  teams = [], 
  members = [], 
  onCardClick, 
  onNewIssueClick 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h')
  const [overlayCalendar, setOverlayCalendar] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1))
    } else if (viewMode === 'week') {
      const d = new Date(selectedDate)
      d.setDate(selectedDate.getDate() - 7)
      setSelectedDate(d)
      setCurrentDate(d)
    }
  }

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1))
    } else if (viewMode === 'week') {
      const d = new Date(selectedDate)
      d.setDate(selectedDate.getDate() + 7)
      setSelectedDate(d)
      setCurrentDate(d)
    }
  }

  const today = new Date()
  
  // Get tasks for the selected date
  const selectedDayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === selectedDate.toDateString())

  // Generate mock times for the UI
  const generateMockTimes = (startHour: number, count: number) => {
    const times = []
    for(let i=0; i<count; i++) {
      let h = startHour + Math.floor(i/2)
      let m = i % 2 === 0 ? "00" : "30"
      let suffix = h >= 12 ? "pm" : "am"
      let displayH = h > 12 ? h - 12 : h
      times.push(`${displayH}:${m}${suffix}`)
    }
    return times
  }

  const baseTimes = generateMockTimes(13, 16) // starts at 1:00pm

  // Deterministic mock events for personal calendar overlay
  const getMockEvents = (date: Date) => {
    const day = date.getDay()
    const dateNum = date.getDate()
    const events = []
    if (day === 1 || dateNum % 7 === 1) {
      events.push({
        id: `mock-standup-${dateNum}`,
        title: 'Daily Standup',
        time: '9:30 AM',
        isMeeting: true,
        duration: '15m',
      })
    }
    if (day === 3 || dateNum % 7 === 3) {
      events.push({
        id: `mock-design-${dateNum}`,
        title: 'Design Critique',
        time: '3:00 PM',
        isMeeting: true,
        duration: '30m',
      })
    }
    if (day === 5 || dateNum % 7 === 5) {
      events.push({
        id: `mock-retro-${dateNum}`,
        title: 'Weekly Retro',
        time: '5:00 PM',
        isMeeting: true,
        duration: '45m',
      })
    }
    return events
  }

  const formatTimeStr = (tStr: string | undefined) => {
    if (!tStr) return ''
    if (timeFormat === '12h') return tStr.toLowerCase()
    const match = tStr.match(/(\d+):(\d+)\s*(am|pm|AM|PM)?/)
    if (!match) return tStr
    let [_, hStr, mStr, period] = match
    let h = parseInt(hStr ?? '0')
    const isPm = period && period.toLowerCase() === 'pm'
    if (isPm && h !== 12) h += 12
    if (!isPm && h === 12) h = 0
    return `${h.toString().padStart(2, '0')}:${mStr}`
  }

  // Combine real tasks and mock events for the right sidebar
  const formattedTasks = selectedDayTasks.map((task, idx) => {
    const timeStr = baseTimes[idx % baseTimes.length] ?? '1:00pm'
    return {
      id: task.id,
      title: task.title as string,
      time: timeStr,
      isMeeting: false,
      taskData: task,
      priority: (task.priority ?? 'LOW') as string,
    }
  })

  const formattedMockEvents = overlayCalendar ? getMockEvents(selectedDate).map(e => ({
    id: e.id,
    title: e.title,
    time: e.time,
    isMeeting: true,
    duration: e.duration,
    taskData: null,
    priority: 'LOW',
  })) : []

  const allDayEvents = [...formattedMockEvents, ...formattedTasks].sort((a, b) => {
    const timeToMinutes = (tStr: string) => {
      const match = tStr.match(/(\d+):(\d+)\s*(am|pm|AM|PM)?/)
      if (!match) return 0
      let [_, hStr, mStr, period] = match
      let h = parseInt(hStr ?? '0')
      let m = parseInt(mStr ?? '0')
      const isPm = period && period.toLowerCase() === 'pm'
      if (isPm && h !== 12) h += 12
      if (!isPm && h === 12) h = 0
      return h * 60 + m
    }
    return timeToMinutes(a.time) - timeToMinutes(b.time)
  })

  // Week View dates computation
  const startOfWeek = new Date(selectedDate)
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  const weekStart = new Date(startOfWeek)
  const weekEnd = new Date(startOfWeek)
  weekEnd.setDate(startOfWeek.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const getTaskRange = (task: any) => {
    if (!task.dueDate) return null
    const due = new Date(task.dueDate)
    let start: Date
    
    if (task.startDate) {
      start = new Date(task.startDate)
    } else {
      start = new Date(due)
      // Organic duration based on priority/status
      let days = 1
      if (task.priority === 'URGENT') days = 3
      else if (task.priority === 'HIGH') days = 2
      else if (task.priority === 'MEDIUM') days = 2
      
      start.setDate(due.getDate() - (days - 1))
    }
    
    start.setHours(0, 0, 0, 0)
    due.setHours(23, 59, 59, 999)
    return { start, end: due }
  }

  const getTeamColor = (teamId: string | null, index: number) => {
    if (!teamId) return {
      bg: "bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 border-slate-500/20 hover:border-slate-500/30",
      pill: "bg-slate-500/20 text-slate-300",
    }
    const colors = [
      { bg: "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/20 hover:border-indigo-500/30", pill: "bg-indigo-500/20 text-indigo-300" },
      { bg: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20 hover:border-emerald-500/30", pill: "bg-emerald-500/20 text-emerald-300" },
      { bg: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20 hover:border-amber-500/30", pill: "bg-amber-500/20 text-amber-300" },
      { bg: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20 hover:border-rose-500/30", pill: "bg-rose-500/20 text-rose-300" },
      { bg: "bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/20 hover:border-sky-500/30", pill: "bg-sky-500/20 text-sky-300" },
      { bg: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20 hover:border-purple-500/30", pill: "bg-purple-500/20 text-purple-300" },
    ]
    return colors[index % colors.length]!
  }

  const allocateTracks = (rowTasks: any[]) => {
    const tracks: any[][] = []
    rowTasks.forEach(task => {
      const range = getTaskRange(task)
      if (!range) return
      
      let placed = false
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]!
        const overlaps = track.some(t => {
          const r = getTaskRange(t)!
          return range.start <= r.end && range.end >= r.start
        })
        if (!overlaps) {
          track.push(task)
          placed = true
          break
        }
      }
      if (!placed) {
        tracks.push([task])
      }
    })
    return tracks
  }

  const weekTasks = tasks.filter(task => {
    const range = getTaskRange(task)
    if (!range) return false
    return range.start <= weekEnd && range.end >= weekStart
  })

  const todayIndex = weekDays.findIndex(d => d.toDateString() === now.toDateString())
  const dayFraction = (now.getHours() + now.getMinutes() / 60) / 24
  const markerPosition = todayIndex !== -1 ? (todayIndex + dayFraction) / 7 : null

  const rows = [
    ...teams,
    { id: 'unassigned', name: 'Unassigned Tasks' }
  ]

  // Timeline slots structure
  const daySlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM"
  ]

  const getSlotDisplayTime = (slot: string) => {
    if (timeFormat === '12h') return slot.toLowerCase()
    const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/)
    if (!match) return slot
    let [_, hStr, mStr, period] = match
    let h = parseInt(hStr ?? '0')
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return `${h.toString().padStart(2, '0')}:${mStr}`
  }

  const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === selectedDate.toDateString())

  const allDayTasks = dayTasks.filter(t => {
    const d = new Date(t.dueDate)
    return d.getHours() === 0 && d.getMinutes() === 0
  })

  const getTasksForSlot = (slotStr: string) => {
    const match = slotStr.match(/(\d+):(\d+)\s*(AM|PM)/)
    if (!match) return []
    let [_, hStr, mStr, period] = match
    let sh = parseInt(hStr ?? '0')
    let sm = parseInt(mStr ?? '0')
    if (period === 'PM' && sh !== 12) sh += 12
    if (period === 'AM' && sh === 12) sh = 0

    return dayTasks.filter(t => {
      if (!t.dueDate) return false
      const date = new Date(t.dueDate)
      return date.getHours() === sh && date.getMinutes() === sm
    })
  }

  const getMockEventsForSlot = (slotStr: string) => {
    if (!overlayCalendar) return []
    const dayEvents = getMockEvents(selectedDate)
    const normalize = (s: string) => s.replace(/^0/, '').toLowerCase().replace(/\s+/g, '')
    return dayEvents.filter(e => normalize(e.time) === normalize(slotStr))
  }

  // List View sorting and grouping
  const sortedTasks = [...tasks]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const noDueDateTasks = tasks.filter(t => !t.dueDate)

  const getRelativeGroupName = (dueDateStr: any) => {
    if (!dueDateStr) return 'No Due Date'
    const d = new Date(dueDateStr)
    d.setHours(0,0,0,0)
    const t = new Date()
    t.setHours(0,0,0,0)
    const diffTime = d.getTime() - t.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays > 1 && diffDays <= 7) return 'This Week'
    return 'Upcoming / Later'
  }

  const groupedTasks: Record<string, any[]> = {}
  sortedTasks.forEach(task => {
    const group = getRelativeGroupName(task.dueDate)
    if (!groupedTasks[group]) groupedTasks[group] = []
    groupedTasks[group].push(task)
  })

  const groupOrder = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Upcoming / Later']

  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return `${monthNames[month]} ${year}`
    } else if (viewMode === 'week') {
      const start = weekDays[0] ?? new Date()
      const end = weekDays[6] ?? new Date()
      if (start.getMonth() === end.getMonth()) {
        return `${monthNames[start.getMonth()]} ${start.getFullYear()}`
      }
      return `${monthNames[start.getMonth()]} - ${monthNames[end.getMonth()]} ${end.getFullYear()}`
    } else {
      return 'Agenda / List'
    }
  }

  return (
    <div className="h-full flex bg-background select-none text-foreground border-t border-border">
      {/* Left Pane: Info & Loom Meetings Sidebar */}
      <div className="w-64 border-r border-border bg-background p-6 flex flex-col gap-6 hidden lg:flex">
        <div>
          <Avatar className="size-10 mb-3 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">PM</AvatarFallback>
          </Avatar>
          <p className="text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Sprint Overview</p>
          <p className="text-lg font-black text-foreground mt-1">PM Studio</p>
          <p className="text-xs text-muted-foreground mt-1">Manage project scope, check calendar events, and align with team meetings.</p>
        </div>

        <div className="border border-border rounded-2xl p-4 bg-muted/20 hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Video className="size-4 text-rose-500" />
            <span className="text-xs font-bold text-foreground">Record Loom Sync</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">Share task status asynchronously with a quick Loom update.</p>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full text-xs font-bold border-border bg-background hover:bg-muted"
            onClick={() => toast.info("Loom video recorder integration is set for later phase.")}
          >
            Start Loom
          </Button>
        </div>
        
        <div className="space-y-4">
          <p className="text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Meetings & Calendar</p>
          <div className="space-y-2 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-3">
              <Clock className="size-4" />
              <span>Timezone: Asia/Kolkata</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="size-4" />
              <span>Region: Global (UTC+5:30)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Pane: Calendar View */}
      <div className="flex-1 flex flex-col min-w-0 p-8">
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-foreground tracking-tight">{getHeaderTitle()}</h2>
            {viewMode !== 'list' && (
              <div className="flex items-center gap-1 ml-2">
                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-muted text-muted-foreground" onClick={handlePrev}>
                  <ChevronLeft className="size-5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-muted text-muted-foreground" onClick={handleNext}>
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                onClick={() => setOverlayCalendar(!overlayCalendar)}
                className={`w-8 h-4 bg-muted border border-border rounded-full relative cursor-pointer transition-colors ${
                  overlayCalendar ? 'bg-primary/20 border-primary/40' : ''
                }`}
              >
                 <div className={`size-3 rounded-full absolute top-0.5 transition-all ${
                   overlayCalendar ? 'left-[16px] bg-primary' : 'left-0.5 bg-foreground'
                 }`} />
              </div>
              <span className="text-xs font-bold text-foreground cursor-pointer" onClick={() => setOverlayCalendar(!overlayCalendar)}>Overlay my calendar</span>
            </div>
            <Button variant="outline" size="icon" className="size-8 rounded-lg border-border bg-background hover:bg-muted" onClick={() => onNewIssueClick(selectedDate)} title="Create Task">
              <Plus className="size-4 text-muted-foreground" />
            </Button>
            <div className="flex bg-muted/50 border border-border rounded-lg p-0.5">
              <button 
                onClick={() => setTimeFormat('12h')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeFormat === '12h' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                12h
              </button>
              <button 
                onClick={() => setTimeFormat('24h')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeFormat === '24h' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                24h
              </button>
            </div>
            <div className="flex bg-muted/50 border border-border rounded-lg p-0.5">
              <button 
                onClick={() => setViewMode('month')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Month View"
              >
                <CalendarDays className="size-4" />
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Week View"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="List View"
              >
                <LayoutList className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Body depending on active viewMode */}
        <div className="flex-1 flex flex-col min-h-0">
          {viewMode === 'month' && (
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-7 mb-3">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[10px] font-extrabold text-muted-foreground tracking-widest mb-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 flex-1 min-h-[450px]">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="border border-border/10 bg-muted/5 rounded-xl min-h-[90px]" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1
                  const dateObj = new Date(year, month, dayNum)
                  const isToday = today.toDateString() === dateObj.toDateString()
                  const isSelected = selectedDate.toDateString() === dateObj.toDateString()
                  
                  const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === dateObj.toDateString())
                  const dayMockEvents = overlayCalendar ? getMockEvents(dateObj) : []
                  const totalItems = dayTasks.length + dayMockEvents.length

                  return (
                    <div 
                      key={dayNum} 
                      onClick={() => setSelectedDate(dateObj)}
                      className={`min-h-[90px] border border-border/40 p-2.5 flex flex-col justify-between hover:bg-muted/10 transition-all cursor-pointer relative group rounded-xl ${
                        isSelected ? 'ring-1 ring-primary border-primary bg-primary/[0.02]' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold flex items-center justify-center rounded-lg size-6 transition-all ${
                          isToday 
                            ? 'bg-foreground text-background font-extrabold shadow-sm' 
                            : isSelected 
                              ? 'text-primary font-extrabold' 
                              : 'text-muted-foreground group-hover:text-foreground'
                        }`}>
                          {dayNum}
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDate(dateObj)
                            onNewIssueClick(dateObj)
                          }}
                          className="opacity-0 group-hover:opacity-100 size-5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all"
                          title="Add task"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      {/* Day Tasks List (directly inline) */}
                      <div className="mt-1 space-y-1 overflow-hidden flex-1 flex flex-col justify-end">
                        {dayTasks.slice(0, 2).map(task => (
                          <div 
                            key={task.id} 
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDate(dateObj)
                              onCardClick(task)
                            }}
                            className="text-[10px] font-bold py-0.5 px-1.5 rounded truncate border bg-muted/60 border-border text-foreground hover:border-foreground/50 transition-colors flex items-center gap-1"
                          >
                            <span className={`size-1.5 rounded-full shrink-0 ${
                              task.priority === 'HIGH' ? 'bg-red-500' :
                              task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <span className="truncate">{task.title}</span>
                          </div>
                        ))}
                        
                        {overlayCalendar && dayMockEvents.slice(0, 1).map((meet, idx) => (
                          <div 
                            key={`mock-${idx}`}
                            className="text-[10px] font-bold py-0.5 px-1.5 rounded truncate border bg-primary/5 border-primary/20 text-primary flex items-center gap-1"
                          >
                            <Video className="size-2.5 shrink-0" />
                            <span className="truncate">{meet.title}</span>
                          </div>
                        ))}

                        {totalItems > 3 && (
                          <div className="text-[9px] font-extrabold text-muted-foreground text-center py-0.5">
                            +{totalItems - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="flex flex-col border border-border rounded-2xl overflow-hidden flex-1 min-h-[400px] bg-background">
              {/* Timeline Header Row */}
              <div className="flex border-b border-border bg-muted/10 shrink-0 select-none">
                {/* Left Corner Spacing */}
                <div className="w-56 border-r border-border p-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Sub-Teams
                </div>
                {/* 7 Days Columns */}
                <div className="flex-1 grid grid-cols-7">
                  {weekDays.map((day, idx) => {
                    const isToday = today.toDateString() === day.toDateString()
                    return (
                      <div key={idx} className="p-3 border-r border-border/40 last:border-r-0 text-center flex flex-col items-center justify-center">
                        <span className="text-[10px] font-extrabold text-muted-foreground tracking-widest">{dayNames[day.getDay()]}</span>
                        <span className={`text-sm font-extrabold mt-1 size-7 flex items-center justify-center rounded-lg transition-all ${
                          isToday 
                            ? 'bg-foreground text-background shadow-sm font-black' 
                            : 'text-foreground'
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Timeline Rows Area */}
              <div className="flex-1 overflow-y-auto relative min-h-0">
                {/* Marker Line */}
                {markerPosition !== null && (
                  <div 
                    className="absolute top-0 bottom-0 w-[1.5px] bg-blue-500 z-30 pointer-events-none"
                    style={{ left: `calc(14rem + (100% - 14rem) * ${markerPosition})` }}
                  >
                    <div className="absolute -top-1.5 -left-5 px-1.5 py-0.5 rounded-full bg-blue-500 text-[8px] font-black text-white shadow-md">
                      {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
                    </div>
                  </div>
                )}

                <div className="divide-y divide-border">
                  {rows.map((row, rowIdx) => {
                    const rowTasks = weekTasks.filter(t => 
                      row.id === 'unassigned' ? !t.subTeamId : t.subTeamId === row.id
                    )
                    
                    const tracks = allocateTracks(rowTasks)

                    return (
                      <div key={row.id} className="flex min-h-[4rem] relative group/row hover:bg-muted/[0.01] transition-colors">
                        {/* Left Sub-team Header */}
                        <div className="w-56 border-r border-border p-4 flex flex-col justify-center shrink-0 bg-background z-10">
                          <div className="flex items-center gap-2">
                            <span className={`size-2 rounded-full shrink-0 ${
                              row.id === 'unassigned' ? 'bg-slate-400' : 
                              rowIdx % 5 === 0 ? 'bg-indigo-500' :
                              rowIdx % 5 === 1 ? 'bg-emerald-500' :
                              rowIdx % 5 === 2 ? 'bg-amber-500' :
                              rowIdx % 5 === 3 ? 'bg-rose-500' : 'bg-sky-500'
                            }`} />
                            <span className="text-xs font-bold text-foreground truncate">{row.name}</span>
                          </div>
                          {rowTasks.length > 0 && (
                            <span className="text-[10px] text-muted-foreground font-semibold mt-1">
                              {rowTasks.length} {rowTasks.length === 1 ? 'task' : 'tasks'} this week
                            </span>
                          )}
                        </div>

                        {/* Right Grid Column Area */}
                        <div className="flex-1 relative min-h-[4rem] flex flex-col justify-center py-2">
                          {/* Clickable Background Grid Cells */}
                          <div className="absolute inset-0 grid grid-cols-7 pointer-events-auto">
                            {weekDays.map((day, colIdx) => (
                              <div 
                                key={colIdx} 
                                onClick={() => {
                                  const d = new Date(day)
                                  d.setHours(9, 0, 0, 0)
                                  onNewIssueClick(d)
                                }}
                                className="border-r border-border/20 last:border-r-0 h-full hover:bg-muted/5 transition-colors cursor-pointer"
                              />
                            ))}
                          </div>

                          {/* Foreground Task Bars */}
                          <div className="relative z-10 pointer-events-none px-2 space-y-2">
                            {tracks.length === 0 ? (
                              <div className="h-8" />
                            ) : (
                              tracks.map((track, trackIdx) => (
                                <div key={trackIdx} className="grid grid-cols-7 gap-2 h-8 items-center">
                                  {track.map(task => {
                                    const range = getTaskRange(task)!
                                    const startDay = Math.max(0, Math.floor((range.start.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)))
                                    const endDay = Math.min(6, Math.floor((range.end.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)))
                                    const colStart = startDay + 1
                                    const colSpan = endDay - startDay + 1
                                    
                                    // Resolve team color index
                                    const teamIndex = teams.findIndex(t => t.id === task.subTeamId)
                                    const colors = getTeamColor(task.subTeamId, teamIndex >= 0 ? teamIndex : 0)
                                    
                                    // Resolve assignee name/initials
                                    const assignee = members.find(m => m.id === task.assigneeId)
                                    const initials = assignee ? (assignee.firstName && assignee.lastName ? `${assignee.firstName[0]}${assignee.lastName[0]}` : assignee.emailAddress?.[0]?.toUpperCase() || '?') : '?'
                                    
                                    return (
                                      <div
                                        key={task.id}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          onCardClick(task)
                                        }}
                                        style={{ gridColumn: `${colStart} / span ${colSpan}` }}
                                        className={`h-7 px-2.5 rounded-xl border flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-95 transition-all pointer-events-auto truncate select-none ${colors.bg}`}
                                      >
                                        <Avatar className="size-4 shrink-0 border border-current/10 bg-background text-[8px] font-bold">
                                          <AvatarFallback className="text-[8px] font-black text-foreground bg-muted">
                                            {initials}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-[11px] font-bold truncate leading-none">{task.title}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-8 pb-10">
                {groupOrder.map(group => {
                  const groupItems = groupedTasks[group] || []
                  if (groupItems.length === 0) return null
                  return (
                    <div key={group} className="space-y-3">
                      <h3 className={`text-xs font-black tracking-widest uppercase ${
                        group === 'Overdue' ? 'text-red-500' :
                        group === 'Today' ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {group}
                      </h3>
                      <div className="space-y-2">
                        {groupItems.map(task => (
                          <div 
                            key={task.id}
                            onClick={() => onCardClick(task)}
                            className="flex items-center justify-between border border-border hover:border-foreground/30 bg-background hover:bg-muted/10 rounded-2xl p-4 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className={`size-3 rounded-full shrink-0 ${
                                task.priority === 'HIGH' ? 'bg-red-500' :
                                task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{task.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold px-2.5 py-1 bg-muted border border-border rounded-lg text-muted-foreground">
                                {task.status}
                              </span>
                              {task.assignee && (
                                <Avatar className="size-6 border border-border">
                                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                    {task.assignee.name ? task.assignee.name.substring(0, 2).toUpperCase() : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {noDueDateTasks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black tracking-widest text-muted-foreground uppercase">No Due Date</h3>
                    <div className="space-y-2">
                      {noDueDateTasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => onCardClick(task)}
                          className="flex items-center justify-between border border-border hover:border-foreground/30 bg-background hover:bg-muted/10 rounded-2xl p-4 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`size-3 rounded-full shrink-0 ${
                              task.priority === 'HIGH' ? 'bg-red-500' :
                              task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{task.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">No due date assigned</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold px-2.5 py-1 bg-muted border border-border rounded-lg text-muted-foreground">
                              {task.status}
                            </span>
                            {task.assignee && (
                              <Avatar className="size-6 border border-border">
                                <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                  {task.assignee.name ? task.assignee.name.substring(0, 2).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Right Pane: Selected Date Timeslots / Schedule */}
      <div className="w-80 border-l border-border bg-background flex flex-col hidden md:flex">
        <div className="px-6 py-5 flex justify-between items-center border-b border-border mb-4">
          <h3 className="text-sm font-bold text-foreground">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })} <span className="text-muted-foreground font-medium ml-1">{selectedDate.getDate()}</span>
          </h3>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-xs font-bold text-primary hover:text-primary/90 flex items-center gap-1 px-2 h-7"
            onClick={() => onNewIssueClick(selectedDate)}
          >
            <Plus className="size-3.5" /> Add Task
          </Button>
        </div>

        {/* All-day Tasks (No Specific Time) */}
        {allDayTasks.length > 0 && (
          <div className="px-6 mb-4 shrink-0">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">All Day Tasks</p>
            <div className="space-y-1.5">
              {allDayTasks.map(task => (
                <button 
                  key={task.id}
                  onClick={() => onCardClick(task)}
                  className="w-full flex items-center justify-between border border-border bg-background hover:border-foreground/30 hover:bg-muted/10 rounded-xl py-2.5 px-4 text-xs font-bold text-foreground transition-all"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`size-1.5 rounded-full shrink-0 ${
                      task.priority === 'HIGH' ? 'bg-red-500' :
                      task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className="truncate">{task.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-2.5">
            {daySlots.map((slot) => {
              const slotTasks = getTasksForSlot(slot)
              const slotEvents = getMockEventsForSlot(slot)
              const displayTime = getSlotDisplayTime(slot)
              
              const hasItems = slotTasks.length > 0 || slotEvents.length > 0

              const getSlotDate = () => {
                const d = new Date(selectedDate)
                const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/)
                if (match) {
                  let [_, hStr, mStr, period] = match
                  let h = parseInt(hStr ?? '0')
                  let m = parseInt(mStr ?? '0')
                  if (period === 'PM' && h !== 12) h += 12
                  if (period === 'AM' && h === 12) h = 0
                  d.setHours(h, m, 0, 0)
                }
                return d
              }

              if (hasItems) {
                return (
                  <div key={slot} className="space-y-1">
                    <div className="text-[9px] font-black text-muted-foreground/60 tracking-wider uppercase">{displayTime}</div>
                    
                    {/* Real Tasks */}
                    {slotTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => onCardClick(task)}
                        className="w-full flex items-center justify-between border border-border hover:border-foreground/30 bg-background hover:bg-muted/10 rounded-xl py-3 px-4 text-xs font-bold text-foreground transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`size-2 rounded-full shrink-0 ${
                            task.priority === 'HIGH' ? 'bg-red-500' :
                            task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <span className="truncate text-left">{task.title}</span>
                        </div>
                      </button>
                    ))}

                    {/* Mock Meetings */}
                    {slotEvents.map(meet => (
                      <div
                        key={meet.id}
                        className="w-full flex items-center justify-between border border-primary/20 bg-primary/5 rounded-xl py-3 px-4 text-xs font-semibold text-primary"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Video className="size-3.5 shrink-0 text-primary" />
                          <span className="truncate text-left">{meet.title}</span>
                        </div>
                        <span className="shrink-0 text-[10px] opacity-80">{meet.duration}</span>
                      </div>
                    ))}
                  </div>
                )
              }

              // Empty/Available Slot
              return (
                <button 
                  key={slot} 
                  onClick={() => onNewIssueClick(getSlotDate())}
                  className="w-full flex items-center justify-between border border-border/40 hover:border-primary/40 rounded-xl py-2.5 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all bg-background group"
                >
                   <div className="flex items-center gap-3">
                     <span className="size-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" /> 
                     <span>{displayTime}</span>
                   </div>
                   <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                     + Add task
                   </span>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

