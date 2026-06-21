import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Globe, Video, Clock, Settings, CalendarDays, LayoutGrid, LayoutList, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface CalendarViewProps {
  tasks: any[]
  onCardClick: (task: any) => void
  onNewIssueClick: (date?: Date) => void
}

export function CalendarView({ tasks, onCardClick, onNewIssueClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h')
  const [overlayCalendar, setOverlayCalendar] = useState(false)

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
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

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
            <div className="grid grid-cols-7 border border-border/80 rounded-2xl overflow-hidden flex-1 min-h-[400px] bg-background">
              {weekDays.map((day, idx) => {
                const isToday = today.toDateString() === day.toDateString()
                const isSelected = selectedDate.toDateString() === day.toDateString()
                const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === day.toDateString())
                const dayMockEvents = overlayCalendar ? getMockEvents(day) : []
                const allItems = [
                  ...dayTasks.map(t => ({ ...t, isMock: false })),
                  ...dayMockEvents.map(e => ({ ...e, isMock: true }))
                ]

                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col border-r border-border last:border-r-0 h-full hover:bg-muted/5 transition-colors group cursor-pointer ${
                      isSelected ? 'bg-primary/[0.01]' : ''
                    }`}
                  >
                    <div className="p-4 border-b border-border text-center flex flex-col items-center select-none bg-muted/10">
                      <span className="text-[10px] font-extrabold text-muted-foreground tracking-widest">{dayNames[day.getDay()]}</span>
                      <span className={`text-base font-extrabold mt-1.5 size-8 flex items-center justify-center rounded-xl transition-all ${
                        isToday 
                          ? 'bg-foreground text-background shadow-md' 
                          : isSelected
                            ? 'text-primary font-black'
                            : 'text-foreground'
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>

                    <ScrollArea className="flex-1">
                      <div className="p-3 space-y-2">
                        {allItems.map((item, itemIdx) => {
                          if (item.isMock) {
                            return (
                              <div 
                                key={`mock-${itemIdx}`}
                                className="border border-primary/20 bg-primary/5 rounded-xl p-3 text-left space-y-1 cursor-default select-none"
                              >
                                <div className="flex items-center gap-1.5 text-primary">
                                  <Video className="size-3" />
                                  <span className="text-xs font-bold truncate">{item.title}</span>
                                </div>
                                <div className="text-[10px] text-primary/70 font-semibold">{formatTimeStr(item.time)} ({item.duration})</div>
                              </div>
                            )
                          } else {
                            return (
                              <div 
                                key={item.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onCardClick(item)
                                }}
                                className="border border-border hover:border-foreground/30 bg-background rounded-xl p-3 text-left space-y-2 cursor-pointer transition-colors relative"
                              >
                                <p className="text-xs font-bold text-foreground line-clamp-2 leading-relaxed">{item.title}</p>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                                    item.priority === 'HIGH' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                    item.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                    'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                  }`}>
                                    {item.priority}
                                  </span>
                                  <span className="text-muted-foreground font-semibold uppercase">{item.status}</span>
                                </div>
                              </div>
                            )
                          }
                        })}

                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDate(day)
                            onNewIssueClick(day)
                          }}
                          className="w-full border border-dashed border-border hover:border-primary/50 hover:bg-primary/[0.01] rounded-xl py-4 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Plus className="size-4" />
                          <span className="text-[10px] font-bold">Add Task</span>
                        </button>
                      </div>
                    </ScrollArea>
                  </div>
                )
              })}
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

