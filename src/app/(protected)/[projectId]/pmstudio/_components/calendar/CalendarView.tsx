import React, { useState, useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Video,
  Clock,
  Settings,
  CalendarDays,
  LayoutGrid,
  LayoutList,
  Plus,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Send,
  ScreenShare,
  Hand,
  Circle,
  Square,
  Monitor,
  Sparkles,
  Volume2,
  Users,
  X,
  Copy,
  Check,
  CloudLightning,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getInitials, getUserName, STATUS_CONFIG, PRIORITY_CONFIG } from '../types'

interface CalendarViewProps {
  tasks: any[]
  teams?: any[]
  members?: any[]
  onCardClick: (task: any) => void
  onNewIssueClick: (date?: Date) => void
  onCreateLoomSyncTask?: (title: string, description: string, subTeamId: string | null) => void
}

export function CalendarView({
  tasks,
  teams = [],
  members = [],
  onCardClick,
  onNewIssueClick,
  onCreateLoomSyncTask,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h')
  const [overlayCalendar, setOverlayCalendar] = useState(false)
  const [now, setNow] = useState(new Date())

  // Video Meetings State
  const [activeMeeting, setActiveMeeting] = useState<any | null>(null)
  const [meetingState, setMeetingState] = useState<'lobby' | 'call'>('lobby')
  const [meetingStream, setMeetingStream] = useState<MediaStream | null>(null)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [isRecordingMeeting, setIsRecordingMeeting] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Loom Recording State
  const [loomState, setLoomState] = useState<'idle' | 'recording' | 'preview'>('idle')
  const [loomStream, setLoomStream] = useState<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [loomTitle, setLoomTitle] = useState('')
  const [loomSquadId, setLoomSquadId] = useState('none')
  const [loomRecordType, setLoomRecordType] = useState<'camera' | 'screen' | 'both'>('both')
  
  // Loom Camera preview stream (used for rendering local face bubble while recording both)
  const [loomCameraStream, setLoomCameraStream] = useState<MediaStream | null>(null)
  const [isUploadingLoom, setIsUploadingLoom] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [generatedShareUrl, setGeneratedShareUrl] = useState('')
  const [copiedShareUrl, setCopiedShareUrl] = useState(false)

  // Canvas composite loop cancellation reference
  const canvasLoopRef = useRef<boolean>(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Timer effect for Loom
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loomState === 'recording') {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [loomState])

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
      { bg: "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 border-indigo-500/20 hover:border-indigo-500/30", pill: "bg-indigo-500/20 text-indigo-550" },
      { bg: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 border-emerald-500/20 hover:border-emerald-500/30", pill: "bg-emerald-500/20 text-emerald-550" },
      { bg: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/20 hover:border-amber-500/30", pill: "bg-amber-500/20 text-amber-550" },
      { bg: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-300 border-rose-500/20 hover:border-rose-500/30", pill: "bg-rose-500/20 text-rose-550" },
      { bg: "bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 dark:text-sky-300 border-sky-500/20 hover:border-sky-500/30", pill: "bg-sky-500/20 text-sky-550" },
      { bg: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 dark:text-purple-300 border-purple-500/20 hover:border-purple-500/30", pill: "bg-purple-500/20 text-purple-550" },
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

  // Loom Recording Functionality
  const startLoomRecording = async (type: 'camera' | 'screen' | 'both') => {
    try {
      setLoomRecordType(type)
      let camStream: MediaStream | null = null
      let screenStream: MediaStream | null = null
      
      if (type === 'camera' || type === 'both') {
        camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setLoomCameraStream(camStream)
      }
      
      if (type === 'screen' || type === 'both') {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: type !== 'both' })
      }
      
      let recordStream: MediaStream
      
      if (type === 'both' && camStream && screenStream) {
        // Draw screen and camera overlay composite on canvas
        const canvas = document.createElement('canvas')
        canvas.width = 1280
        canvas.height = 720
        const ctx = canvas.getContext('2d')
        
        const screenVideo = document.createElement('video')
        screenVideo.srcObject = screenStream
        screenVideo.muted = true
        screenVideo.play()
        
        const camVideo = document.createElement('video')
        camVideo.srcObject = camStream
        camVideo.muted = true
        camVideo.play()
        
        canvasLoopRef.current = true
        const draw = () => {
          if (!canvasLoopRef.current) return
          if (ctx) {
            // Draw screen
            ctx.drawImage(screenVideo, 0, 0, 1280, 720)
            
            // Draw camera circle in bottom left
            ctx.save()
            ctx.beginPath()
            ctx.arc(140, 580, 90, 0, Math.PI * 2)
            ctx.closePath()
            ctx.clip()
            ctx.drawImage(camVideo, 50, 490, 180, 180)
            ctx.restore()
            
            // Draw border
            ctx.strokeStyle = '#2563eb'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.arc(140, 580, 90, 0, Math.PI * 2)
            ctx.stroke()
          }
          requestAnimationFrame(draw)
        }
        
        // Wait for videos to load dimensions
        screenVideo.onloadedmetadata = () => requestAnimationFrame(draw)
        camVideo.onloadedmetadata = () => requestAnimationFrame(draw)
        
        const canvasStream = (canvas as any).captureStream(30)
        
        // Add mic audio track
        const micAudioTrack = camStream.getAudioTracks()[0]
        if (micAudioTrack) {
          canvasStream.addTrack(micAudioTrack)
        }
        
        recordStream = canvasStream
        
        // Custom stopper to release device tracks
        const stopCompositeTracks = () => {
          canvasLoopRef.current = false
          camStream?.getTracks().forEach(t => t.stop())
          screenStream?.getTracks().forEach(t => t.stop())
        }
        (recordStream as any).stopDevices = stopCompositeTracks
      } else {
        // Single stream mode
        recordStream = (type === 'screen' ? screenStream : camStream) as MediaStream
      }
      
      setLoomStream(recordStream)
      setLoomState('recording')
      setRecordedChunks([])
      setRecordingSeconds(0)
      setGeneratedShareUrl('')
      
      const recorder = new MediaRecorder(recordStream, { mimeType: 'video/webm' })
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedVideoUrl(url)
        setLoomState('preview')
        setLoomTitle(`Loom Video Sync - ${monthNames[new Date().getMonth()]} ${new Date().getDate()}`)
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      toast.success("Loom recording started!")
    } catch (e) {
      console.error(e)
      toast.error("Failed to start Loom recording. Check permissions.")
    }
  }

  const stopLoomRecording = () => {
    if (mediaRecorder) mediaRecorder.stop()
    if (loomStream) {
      if ((loomStream as any).stopDevices) {
        (loomStream as any).stopDevices()
      } else {
        loomStream.getTracks().forEach(t => t.stop())
      }
      setLoomStream(null)
    }
    if (loomCameraStream) {
      loomCameraStream.getTracks().forEach(t => t.stop())
      setLoomCameraStream(null)
    }
  }

  const cancelLoomRecording = () => {
    stopLoomRecording()
    setLoomState('idle')
    setRecordedVideoUrl(null)
    toast.error("Recording cancelled.")
  }

  // Handle posting Loom task with progress loader simulation
  const handlePostLoomSync = () => {
    if (!recordedVideoUrl) return
    setIsUploadingLoom(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          finalizeLoomSync()
          return 100
        }
        return prev + 25
      })
    }, 400)
  }

  const finalizeLoomSync = () => {
    setIsUploadingLoom(false)
    const syncId = `GB-Sync-${Math.floor(Math.random() * 9000 + 1000)}`
    const publicUrl = `https://gitbrain.ai/share/loom/${syncId}`
    
    setGeneratedShareUrl(publicUrl)

    if (onCreateLoomSyncTask && recordedVideoUrl) {
      const videoHtml = `<video src="${recordedVideoUrl}" controls class="w-full max-w-md rounded-xl my-2 border border-border shadow" />`
      const description = `### 📹 Loom Video Sync
Recorded asynchronous status update for squad review.

[🔗 Copy Public Share Link](${publicUrl})

${videoHtml}`

      onCreateLoomSyncTask(
        loomTitle,
        description,
        loomSquadId === 'none' ? null : loomSquadId
      )

      toast.success("Sync uploaded! Share link copied to clipboard.")
      navigator.clipboard.writeText(publicUrl)
      setCopiedShareUrl(true)
      
      // Auto close preview dialog after success alert
      setTimeout(() => {
        setLoomState('idle')
        setRecordedVideoUrl(null)
        setCopiedShareUrl(false)
      }, 2500)
    }
  }

  const handleCopyShareUrl = () => {
    if (generatedShareUrl) {
      navigator.clipboard.writeText(generatedShareUrl)
      setCopiedShareUrl(true)
      toast.success("Share link copied to clipboard!")
      setTimeout(() => setCopiedShareUrl(false), 2000)
    }
  }

  // Live Video Meetings Functionality
  const handleJoinMeeting = async (meet: any) => {
    setActiveMeeting(meet)
    setMeetingState('lobby')
    setIsMicMuted(false)
    setIsCameraOff(false)
    setIsSharingScreen(false)
    setIsHandRaised(false)
    setIsRecordingMeeting(false)
    
    // Pre-populate chat
    setChatMessages([
      { sender: 'Aditi', initials: 'AD', text: "Hey team! Glad you could make it to our scheduled sync.", time: '9:31 AM', isSelf: false },
      { sender: 'Sarah', initials: 'SA', text: "Hey! Just waiting for John to hop in too.", time: '9:32 AM', isSelf: false },
      { sender: 'John', initials: 'JO', text: "Morning! I'm here now, ready to go.", time: '9:32 AM', isSelf: false },
    ])
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setMeetingStream(stream)
    } catch (e) {
      console.error(e)
      toast.error("Cannot access camera/microphone. Joining meeting without video feeds.")
    }
  }

  const handleLeaveMeeting = () => {
    if (meetingStream) {
      meetingStream.getTracks().forEach(t => t.stop())
      setMeetingStream(null)
    }
    setActiveMeeting(null)
    toast.success("You left the video call.")
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    const msg = {
      sender: 'You',
      initials: 'YO',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    }
    setChatMessages(prev => [...prev, msg])
    setNewMessage('')

    // Trigger dynamic mock reply
    setTimeout(() => {
      const replies = [
        { sender: 'Aditi', initials: 'AD', text: "Great point! Let's update that in our PM Studio sprint task description." },
        { sender: 'John', initials: 'JO', text: "I already committed the backend fix for that module. I'll link the PR shortly." },
        { sender: 'Sarah', initials: 'SA', text: "I can check the Figma wireframe to make sure the margins are aligned." }
      ]
      const reply = replies[Math.floor(Math.random() * replies.length)]!
      setChatMessages(prev => [...prev, {
        sender: reply.sender,
        initials: reply.initials,
        text: reply.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: false
      }])
    }, 1500)
  }

  // Header Navigation Month Name
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

  /* ─── RENDER VIDEO MEETING PANEL ─── */
  if (activeMeeting) {
    return (
      <div className="h-full w-full flex flex-col bg-background text-foreground select-none">
        
        {/* LOBBY STATE */}
        {meetingState === 'lobby' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/30">
            <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-2xl border border-border shadow-lg relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLeaveMeeting}
                className="absolute top-4 right-4 size-8 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
                title="Exit Meeting Lobby"
              >
                <X className="size-5" />
              </Button>
              
              {/* Left Column: Cam Preview */}
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border bg-zinc-950 flex items-center justify-center relative shadow-inner">
                  {isCameraOff || !meetingStream ? (
                    <Avatar className="size-16 border border-border bg-muted">
                      <AvatarFallback className="text-xl font-bold">ME</AvatarFallback>
                    </Avatar>
                  ) : (
                    <video
                      ref={(el) => {
                        if (el && meetingStream) el.srcObject = meetingStream
                      }}
                      autoPlay
                      muted
                      playsInline
                      className="size-full object-cover scale-x-[-1]"
                    />
                  )}
                  
                  {/* Floating Lobby Controls */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    <Button
                      variant={isMicMuted ? 'destructive' : 'secondary'}
                      size="icon"
                      onClick={() => {
                        if (meetingStream) {
                          meetingStream.getAudioTracks().forEach(t => t.enabled = isMicMuted)
                          setIsMicMuted(!isMicMuted)
                        }
                      }}
                      className="size-8 rounded-full shadow"
                    >
                      {isMicMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                    </Button>
                    <Button
                      variant={isCameraOff ? 'destructive' : 'secondary'}
                      size="icon"
                      onClick={() => {
                        if (meetingStream) {
                          meetingStream.getVideoTracks().forEach(t => t.enabled = isCameraOff)
                          setIsCameraOff(!isCameraOff)
                        }
                      }}
                      className="size-8 rounded-full shadow"
                    >
                      {isCameraOff ? <VideoOff className="size-4" /> : <Video className="size-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Info & Join Button */}
              <div className="space-y-6">
                <div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 uppercase text-[9px] tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
                    Video Sync Lobby
                  </Badge>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">{activeMeeting.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">Ready to align with the team? Sarah, John, and Aditi are already in the call.</p>
                </div>

                <div className="space-y-2 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>Duration: {activeMeeting.duration || '30m'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    <span>Participants: 3 active members</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    onClick={() => setMeetingState('call')}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm h-10 rounded-xl shadow-md"
                  >
                    Join Meeting
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLeaveMeeting}
                    className="border-border hover:bg-muted font-bold text-xs h-10 rounded-xl px-4"
                  >
                    Cancel
                  </Button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ACTIVE CALL STATE */
          <div className="flex-1 flex overflow-hidden bg-zinc-950 text-slate-100">
            
            {/* Main Call Workspace */}
            <div className="flex-1 flex flex-col justify-between p-6 relative">
              {/* Top info bar */}
              <div className="flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                    {activeMeeting.title}
                  </span>
                  {isRecordingMeeting && (
                    <Badge variant="destructive" className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 animate-pulse rounded">
                      <span className="size-1.5 rounded-full bg-white shrink-0" /> REC
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Asia/Kolkata
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLeaveMeeting}
                    className="size-8 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
                    title="Exit Meeting"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </div>

              {/* Grid Layout of Participants */}
              <div className="flex-1 min-h-0 py-6 grid grid-cols-2 gap-4 items-center max-w-4xl mx-auto w-full">
                
                {/* USER BOX */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center relative shadow-xl">
                  {isCameraOff || !meetingStream ? (
                    <div className="size-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-lg text-slate-200">
                      ME
                    </div>
                  ) : (
                    <video
                      ref={(el) => {
                        if (el && meetingStream) el.srcObject = meetingStream
                      }}
                      autoPlay
                      muted
                      playsInline
                      className="size-full object-cover scale-x-[-1]"
                    />
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur border border-white/5 py-1 px-2.5 rounded-lg text-[10px] font-bold text-slate-200">
                    You (Developer)
                  </div>
                  {isHandRaised && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white p-1 rounded-full shadow-lg border border-white/10">
                      <Hand className="size-4 fill-white" />
                    </div>
                  )}
                </div>

                {/* SARAH BOX (Active Speaker Mock) */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-primary/40 bg-zinc-900 flex items-center justify-center relative shadow-xl ring-2 ring-primary/30 animate-pulse">
                  <div className="size-14 rounded-full bg-indigo-600 border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                    SA
                  </div>
                  <div className="absolute top-3 right-3 flex items-end gap-0.5 h-3 bg-black/40 px-1.5 py-1 rounded">
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite]" />
                    <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-[bounce_1.2s_infinite_0.2s]" />
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_0.4s]" />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur border border-white/5 py-1 px-2.5 rounded-lg text-[10px] font-bold text-slate-200 flex items-center gap-1.5">
                    <Volume2 className="size-3.5 text-emerald-400" /> Sarah (Product Designer)
                  </div>
                </div>

                {/* ADITI BOX */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center relative shadow-xl">
                  <div className="size-14 rounded-full bg-emerald-600 border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                    AD
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur border border-white/5 py-1 px-2.5 rounded-lg text-[10px] font-bold text-slate-200">
                    Aditi (Project Lead)
                  </div>
                </div>

                {/* JOHN BOX */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center relative shadow-xl">
                  <div className="size-14 rounded-full bg-amber-600 border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                    JO
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur border border-white/5 py-1 px-2.5 rounded-lg text-[10px] font-bold text-slate-200">
                    John (Senior Developer)
                  </div>
                </div>

              </div>

              {/* Bottom Meeting Controls Bar */}
              <div className="flex justify-center items-center gap-3 shrink-0 z-10">
                <Button
                  variant={isMicMuted ? 'destructive' : 'secondary'}
                  size="icon"
                  onClick={() => {
                    if (meetingStream) {
                      meetingStream.getAudioTracks().forEach(t => t.enabled = isMicMuted)
                      setIsMicMuted(!isMicMuted)
                    }
                  }}
                  className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 shadow-lg"
                >
                  {isMicMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                </Button>

                <Button
                  variant={isCameraOff ? 'destructive' : 'secondary'}
                  size="icon"
                  onClick={() => {
                    if (meetingStream) {
                      meetingStream.getVideoTracks().forEach(t => t.enabled = isCameraOff)
                      setIsCameraOff(!isCameraOff)
                    }
                  }}
                  className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 shadow-lg"
                >
                  {isCameraOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
                </Button>

                <Button
                  variant={isSharingScreen ? 'default' : 'secondary'}
                  size="icon"
                  onClick={() => {
                    setIsSharingScreen(!isSharingScreen)
                    toast.success(isSharingScreen ? "Stopped screen sharing." : "Simulated screen sharing active.")
                  }}
                  className={`size-10 rounded-full border-0 shadow-lg ${
                    isSharingScreen ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <ScreenShare className="size-5" />
                </Button>

                <Button
                  variant={isHandRaised ? 'default' : 'secondary'}
                  size="icon"
                  onClick={() => setIsHandRaised(!isHandRaised)}
                  className={`size-10 rounded-full border-0 shadow-lg ${
                    isHandRaised ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Hand className="size-5" />
                </Button>

                <Button
                  variant={isRecordingMeeting ? 'default' : 'secondary'}
                  size="icon"
                  onClick={() => {
                    setIsRecordingMeeting(!isRecordingMeeting)
                    toast.info(isRecordingMeeting ? "Recording saved." : "Meeting recording started.")
                  }}
                  className={`size-10 rounded-full border-0 shadow-lg ${
                    isRecordingMeeting ? 'bg-rose-600 text-white hover:bg-rose-500 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Circle className="size-5 fill-current" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setShowChat(!showChat)}
                  className={`size-10 rounded-full border-0 shadow-lg ${
                    showChat ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <MessageSquare className="size-5" />
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleLeaveMeeting}
                  className="h-10 rounded-full shadow-lg bg-rose-600 hover:bg-rose-500 px-4 font-bold text-xs flex items-center gap-1.5"
                >
                  <PhoneOff className="size-4" /> Leave Meeting
                </Button>
              </div>

            </div>

            {/* Live Chat Side Panel */}
            {showChat && (
              <div className="w-80 border-l border-white/10 bg-zinc-900 flex flex-col justify-between shrink-0">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-350">Meeting Chat</span>
                  <Button variant="ghost" size="icon" onClick={() => setShowChat(false)} className="size-7 hover:bg-white/5 rounded text-slate-400">
                    <X className="size-4" />
                  </Button>
                </div>

                {/* Message list */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex items-start gap-2.5 ${msg.isSelf ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="size-7 rounded-md shrink-0">
                          <AvatarFallback className="bg-slate-800 text-[9px] font-bold text-slate-350">{msg.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className={`flex items-baseline gap-1.5 ${msg.isSelf ? 'justify-end' : ''}`}>
                            <span className="text-[10px] font-bold text-slate-300">{msg.sender}</span>
                            <span className="text-[8px] text-slate-500">{msg.time}</span>
                          </div>
                          <p className={`text-xs mt-1 px-3 py-2 rounded-xl leading-relaxed break-words ${
                            msg.isSelf ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-200 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Chat input form */}
                <div className="p-3 border-t border-white/10 flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                    className="h-8.5 bg-white/5 border-white/10 text-white placeholder-slate-500 rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage()
                    }}
                  />
                  <Button size="icon" onClick={handleSendMessage} className="size-8.5 bg-blue-600 hover:bg-blue-500 text-white shrink-0 rounded-lg">
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    )
  }

  /* ─── DEFAULT CALENDAR RENDER ─── */
  const getDaysArray = () => {
    const days = []
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDateObj = new Date(year, month, i)
      days.push({ date: currentDateObj, isCurrentMonth: true })
    }
    const totalSlots = 42
    const remainingSlots = totalSlots - days.length
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({ date: nextDate, isCurrentMonth: false })
    }
    return days
  }

  return (
    <div className="h-full flex bg-background select-none text-foreground border-t border-border relative">
      
      {/* Left Pane: Info & Loom Meetings Sidebar */}
      <div className="w-64 border-r border-border bg-background p-6 flex flex-col gap-6 hidden lg:flex shrink-0">
        <div>
          <Avatar className="size-10 mb-3 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">PM</AvatarFallback>
          </Avatar>
          <p className="text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Sprint Overview</p>
          <p className="text-lg font-black text-foreground mt-1">PM Studio</p>
          <p className="text-xs text-muted-foreground mt-1">Manage project scope, check calendar events, and align with team meetings.</p>
        </div>

        {/* Start Loom Controller */}
        <div className="border border-border rounded-2xl p-4 bg-muted/20 hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Video className="size-4 text-rose-500" />
            <span className="text-xs font-bold text-foreground">Record Loom Sync</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">Share task status asynchronously with a quick Loom update.</p>
          
          {loomState === 'idle' ? (
            <div className="flex flex-col gap-2">
              <Select value={loomRecordType} onValueChange={(val: any) => setLoomRecordType(val)}>
                <SelectTrigger className="h-8.5 text-xs bg-background border-border rounded-lg font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="both" className="text-xs cursor-pointer">Screen + Camera</SelectItem>
                  <SelectItem value="screen" className="text-xs cursor-pointer">Screen Only</SelectItem>
                  <SelectItem value="camera" className="text-xs cursor-pointer">Camera Only</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="w-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg px-2 h-8.5"
                onClick={() => startLoomRecording(loomRecordType)}
              >
                <Video className="size-3.5 mr-1" /> Start Recording
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-500 animate-pulse">
                <span className="size-2 bg-rose-500 rounded-full" />
                <span>Recording... ({recordingSeconds}s)</span>
              </div>
            </div>
          )}
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
      <div className="flex-1 flex flex-col min-w-0 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 shrink-0">
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
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs font-bold rounded px-2.5 ${viewMode === 'month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs font-bold rounded px-2.5 ${viewMode === 'week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs font-bold rounded px-2.5 ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="flex-1 flex flex-col min-h-0 border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {dayNames.map(name => (
                <div key={name} className="py-2.5 text-center text-[10px] font-black text-muted-foreground tracking-wider">{name}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 flex-1 divide-x divide-y divide-border bg-muted/10">
              {getDaysArray().map(({ date: dateObj, isCurrentMonth }, idx) => {
                const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === dateObj.toDateString())
                const dayMockEvents = overlayCalendar ? getMockEvents(dateObj) : []
                const totalItems = dayTasks.length + dayMockEvents.length

                const isSelected = selectedDate.toDateString() === dateObj.toDateString()
                const isToday = today.toDateString() === dateObj.toDateString()

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(dateObj)}
                    className={`p-2 flex flex-col justify-between hover:bg-muted/30 transition-colors group cursor-pointer relative ${
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40 bg-muted/5'
                    } ${isSelected ? 'ring-1.5 ring-inset ring-primary/80 bg-primary/5 hover:bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${
                        isToday ? 'bg-blue-600 text-white size-5.5 rounded-full flex items-center justify-center font-black shadow-sm' : ''
                      }`}>{dateObj.getDate()}</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onNewIssueClick(dateObj)
                        }}
                        className="size-5 rounded hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add Task"
                      >
                        <Plus className="size-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>

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
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDate(dateObj)
                            handleJoinMeeting(meet)
                          }}
                          className="text-[10px] font-bold py-0.5 px-1.5 rounded truncate border bg-primary/5 border-primary/20 text-primary flex items-center gap-1 cursor-pointer hover:bg-primary/10 transition-colors"
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

        {/* WEEK VIEW TIMELINE */}
        {viewMode === 'week' && (
          <div className="flex-1 flex flex-col border border-border rounded-2xl overflow-hidden bg-card shadow-sm min-h-0">
            {/* Week View Header */}
            <div className="grid grid-cols-8 border-b border-border bg-muted/30 shrink-0">
              <div className="py-3 px-4 border-r border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Users className="size-3.5" /> Sub-Teams
              </div>
              {weekDays.map(day => {
                const isDayToday = today.toDateString() === day.toDateString()
                return (
                  <div key={day.toISOString()} className="py-2.5 text-center flex flex-col items-center justify-center border-r border-border last:border-0">
                    <span className="text-[9px] font-black text-muted-foreground/60 tracking-wider uppercase">{dayNames[day.getDay()]}</span>
                    <span className={`text-sm font-black mt-0.5 ${
                      isDayToday ? 'bg-blue-600 text-white size-6.5 rounded-full flex items-center justify-center shadow-md font-black' : 'text-foreground'
                    }`}>{day.getDate()}</span>
                  </div>
                )
              })}
            </div>

            {/* Week View Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-border bg-muted/5 relative">
              
              {/* CURRENT TIME INDICATOR LINE */}
              {now >= weekStart && now <= weekEnd && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                  style={{
                    left: `calc(12.5% + ${(now.getDay() + (now.getHours() * 60 + now.getMinutes()) / 1440) * 12.5}%)`
                  }}
                >
                  <div className="size-2 rounded-full bg-red-500 absolute -top-1 -left-[3px]" />
                  <div className="bg-red-500 text-[8px] text-white font-mono font-bold px-1.5 py-0.5 rounded shadow absolute top-2 -left-1/2 -translate-x-[20%]">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}

              {/* Rows grouped by Sub-Team */}
              {[...teams, { id: 'unassigned', name: 'Unassigned Tasks' }].map((team, tIdx) => {
                const teamTasks = tasks.filter(task => {
                  const range = getTaskRange(task)
                  if (!range) return false
                  const subTeamMatch = team.id === 'unassigned' ? !task.subTeamId : task.subTeamId === team.id
                  return subTeamMatch && range.start <= weekEnd && range.end >= weekStart
                })

                const tracks = allocateTracks(teamTasks)
                const rowHeight = Math.max(1, tracks.length) * 52 + 16

                return (
                  <div key={team.id} className="grid grid-cols-8 divide-x divide-border items-center relative group/row" style={{ height: `${rowHeight}px` }}>
                    {/* Team Label */}
                    <div className="h-full bg-card p-4 flex flex-col justify-center border-r border-border shrink-0">
                      <span className="text-xs font-bold text-foreground max-w-full truncate">{team.name}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 flex items-center gap-1">
                        <Badge variant="outline" className="text-[8px] py-0 px-1 font-bold rounded-lg border-border">{teamTasks.length} tasks</Badge>
                      </span>
                    </div>

                    {/* Timeline Grid (Clickable) */}
                    <div className="col-span-7 h-full relative p-2 overflow-hidden flex flex-col justify-center">
                      {/* Grid cells clickable for quick create */}
                      <div className="absolute inset-0 grid grid-cols-7 divide-x divide-border/30 pointer-events-none">
                        {Array.from({ length: 7 }).map((_, idx) => (
                          <div key={idx} className="h-full" />
                        ))}
                      </div>

                      {/* Interactive Task Bars */}
                      {tracks.map((track, trackIdx) => 
                        track.map(task => {
                          const range = getTaskRange(task)
                          if (!range) return null

                          // Bound dates within the current week
                          const boundStart = range.start < weekStart ? weekStart : range.start
                          const boundEnd = range.end > weekEnd ? weekEnd : range.end

                          const startDiff = (boundStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
                          const durationDays = (boundEnd.getTime() - boundStart.getTime()) / (1000 * 60 * 60 * 24) + 1

                          const leftPct = (startDiff / 7) * 100
                          const widthPct = (durationDays / 7) * 100

                          const colorConfig = getTeamColor(task.subTeamId, tIdx)

                          return (
                            <div
                              key={task.id}
                              onClick={() => onCardClick(task)}
                              className={`absolute h-10 rounded-xl border px-3 flex items-center justify-between text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer ${colorConfig.bg}`}
                              style={{
                                left: `calc(${leftPct}% + 4px)`,
                                width: `calc(${widthPct}% - 8px)`,
                                top: `${trackIdx * 52 + 8}px`
                              }}
                            >
                              <span className="truncate mr-2">{task.title}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className={`text-[8px] font-black rounded-lg uppercase tracking-wider py-0 px-1 ${colorConfig.pill}`}>
                                  {STATUS_CONFIG[task.status]?.label || task.status}
                                </span>
                                {task.assignee && (
                                  <Avatar className="size-5 border border-border rounded-full shadow-inner">
                                    <AvatarFallback className="text-[7px] font-bold bg-muted">{getInitials(task.assignee)}</AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}

            </div>
          </div>
        )}

        {/* LIST / AGENDA VIEW */}
        {viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto space-y-6">
            {['OVERDUE', 'TODAY', 'TOMORROW', 'THIS_WEEK', 'LATER', 'NO_DUE_DATE'].map(section => {
              const filterSectionTasks = () => {
                const midnight = new Date()
                midnight.setHours(0, 0, 0, 0)
                
                const tomorrow = new Date(midnight)
                tomorrow.setDate(midnight.getDate() + 1)
                
                const endOfWeek = new Date(midnight)
                endOfWeek.setDate(midnight.getDate() + (7 - midnight.getDay()))
                
                return tasks.filter(t => {
                  if (!t.dueDate) return section === 'NO_DUE_DATE'
                  const due = new Date(t.dueDate)
                  due.setHours(0,0,0,0)
                  
                  if (section === 'OVERDUE') return due < midnight && t.status !== 'DONE'
                  if (section === 'TODAY') return due.getTime() === midnight.getTime()
                  if (section === 'TOMORROW') return due.getTime() === tomorrow.getTime()
                  if (section === 'THIS_WEEK') return due > tomorrow && due <= endOfWeek
                  if (section === 'LATER') return due > endOfWeek
                  return false
                })
              }

              const sectionTasks = filterSectionTasks()
              if (sectionTasks.length === 0) return null

              const titleMap: Record<string, string> = {
                OVERDUE: 'Overdue Action Items',
                TODAY: 'Today',
                TOMORROW: 'Tomorrow',
                THIS_WEEK: 'Remaining This Week',
                LATER: 'Planned Later',
                NO_DUE_DATE: 'No Target Date Assigned'
              }

              return (
                <div key={section} className="space-y-3">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    section === 'OVERDUE' ? 'text-rose-500' : 'text-muted-foreground'
                  }`}>
                    <CalendarDays className="size-3.5" /> {titleMap[section]} ({sectionTasks.length})
                  </h3>
                  
                  <div className="border border-border rounded-xl divide-y divide-border bg-card shadow-sm overflow-hidden">
                    {sectionTasks.map(task => {
                      const status = STATUS_CONFIG[task.status] || { label: task.status, color: 'text-foreground bg-muted border-border', dot: 'bg-muted-foreground' }
                      const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || { label: task.priority, color: 'text-muted-foreground bg-muted border-border' }
                      return (
                        <div 
                          key={task.id}
                          onClick={() => onCardClick(task)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/20 transition-all cursor-pointer gap-3 text-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-[10px] text-muted-foreground font-semibold shrink-0 bg-muted/60 border px-1.5 py-0.5 rounded">
                              GB-{task.id.slice(-3).toUpperCase()}
                            </span>
                            <span className="font-bold text-foreground truncate max-w-sm">{task.title}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priority.color}`}>{priority.label}</span>
                            <Badge variant="outline" className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${status.color} flex items-center gap-1 w-fit`}>
                              <span className={`size-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs font-bold text-muted-foreground/80">{new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Right Pane: Day Schedule Details */}
      <div className="w-80 border-l border-border bg-background p-6 flex flex-col gap-6 hidden xl:flex shrink-0">
        <div>
          <p className="text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Schedule inspector</p>
          <h3 className="text-lg font-black text-foreground mt-1">{selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Timeline listing of scheduled tasks and virtual meetings.</p>
        </div>

        <ScrollArea className="flex-1 pr-1">
          <div className="space-y-5">
            {generateMockTimes(9, 18).map(slot => {
              const displayTime = formatTimeStr(slot)
              
              // Filter real tasks that belong to this 30m slot
              const slotTasks = formattedTasks.filter(t => t.time === slot)
              // Filter mock overlay events
              const slotEvents = formattedMockEvents.filter(e => e.time === slot)
              
              const hasItems = slotTasks.length > 0 || slotEvents.length > 0

              const getSlotDate = () => {
                const d = new Date(selectedDate)
                const match = slot.match(/(\d+):(\d+)\s*(AM|PM|am|pm)/)
                if (match) {
                  let [_, hStr, mStr, period] = match
                  let h = parseInt(hStr ?? '0')
                  let m = parseInt(mStr ?? '0')
                  const isPm = period && period.toLowerCase() === 'pm'
                  if (isPm && h !== 12) h += 12
                  if (!isPm && h === 12) h = 0
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
                        onClick={() => onCardClick(task.taskData)}
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

                    {/* Mock Meetings (Now Clickable to Join!) */}
                    {slotEvents.map(meet => (
                      <button
                        key={meet.id}
                        onClick={() => handleJoinMeeting(meet)}
                        className="w-full flex items-center justify-between border border-primary/20 hover:border-primary/45 bg-primary/5 hover:bg-primary/10 rounded-xl py-3 px-4 text-xs font-semibold text-primary transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Video className="size-3.5 shrink-0 text-primary" />
                          <span className="truncate text-left">{meet.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] opacity-80">{meet.duration}</span>
                          <span className="text-[9px] bg-primary/25 text-primary group-hover:bg-primary group-hover:text-primary-foreground px-1.5 py-0.5 rounded font-bold uppercase tracking-wider transition-colors">Join</span>
                        </div>
                      </button>
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

      {/* FLOATING LOOM RECORDER WIDGET CONTAINER */}
      {loomState === 'recording' && loomStream && (
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-center gap-3 bg-card border border-border shadow-2xl p-4 rounded-2xl max-w-xs">
          
          {/* Circular Camera Preview (only rendered in Face Camera or Screen + Camera mode) */}
          {(loomRecordType === 'camera' || loomRecordType === 'both') && loomCameraStream && (
            <div className="size-24 rounded-full overflow-hidden border-2 border-primary shadow-inner relative bg-zinc-950">
              <video
                ref={(el) => {
                  if (el) el.srcObject = loomCameraStream
                }}
                autoPlay
                muted
                playsInline
                className="size-full object-cover scale-x-[-1]"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 text-rose-550">
            <span className="size-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-mono font-black">
              {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="text-[10px] text-center text-muted-foreground font-semibold px-2">
            {loomRecordType === 'both' ? 'Screen + camera active' : loomRecordType === 'screen' ? 'Recording screen sharing...' : 'Camera stream active'}
          </div>

          <div className="flex gap-2 w-full pt-1.5 border-t border-border mt-1 shrink-0">
            <Button 
              size="sm" 
              variant="destructive"
              onClick={stopLoomRecording}
              className="flex-1 text-xs font-bold rounded-lg px-2 h-8.5 bg-rose-600 hover:bg-rose-500 text-white"
            >
              <Square className="size-3 mr-1 fill-white" /> Stop & Save
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={cancelLoomRecording}
              className="flex-1 text-xs font-bold rounded-lg border-border hover:bg-muted h-8.5"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* LOOM RECORDING PREVIEW DIALOG */}
      <Dialog open={loomState === 'preview'} onOpenChange={(open) => {
        if (!open) {
          setLoomState('idle')
          setRecordedVideoUrl(null)
          setGeneratedShareUrl('')
        }
      }}>
        <DialogContent className="sm:max-w-lg bg-card border-border text-foreground rounded-xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Sparkles className="size-4.5 text-rose-550" /> Review Loom Video Sync
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-3 min-h-0">
            
            {/* Loading/Uploading screen */}
            {isUploadingLoom ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="size-8 text-primary animate-spin" />
                <div className="space-y-1 text-center">
                  <p className="text-sm font-bold text-foreground">Uploading sync video...</p>
                  <p className="text-xs text-muted-foreground">Uploading to GitBrain Cloud storage ({uploadProgress}%)</p>
                </div>
                <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : (
              <>
                {recordedVideoUrl && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-black shadow-inner">
                    <video src={recordedVideoUrl} controls autoPlay className="size-full object-contain" />
                  </div>
                )}

                {/* Show public share link if rule was created */}
                {generatedShareUrl && (
                  <div className="bg-emerald-550/5 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 block uppercase tracking-wider">Cloud Public Link Generated</span>
                      <code className="text-foreground/90 font-semibold truncate block mt-0.5">{generatedShareUrl}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyShareUrl}
                      className="border-border bg-background hover:bg-muted text-xs font-bold px-3 shrink-0 h-8 rounded-lg"
                    >
                      {copiedShareUrl ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-muted-foreground" />}
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sync Title</label>
                  <Input
                    value={loomTitle}
                    onChange={(e) => setLoomTitle(e.target.value)}
                    placeholder="Status Update title..."
                    className="h-9 border-border bg-background focus-visible:ring-primary rounded-lg text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Team Squad</label>
                  <Select value={loomSquadId} onValueChange={setLoomSquadId}>
                    <SelectTrigger className="h-9 text-xs bg-background border-border rounded-lg font-semibold">
                      <SelectValue placeholder="Project Backlog (No Squad)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="none" className="text-xs cursor-pointer">Project Backlog (No Squad)</SelectItem>
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id} className="text-xs cursor-pointer">{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {!isUploadingLoom && (
            <DialogFooter className="gap-2 border-t border-border pt-4 shrink-0">
              {generatedShareUrl ? (
                <Button
                  onClick={() => {
                    setLoomState('idle')
                    setRecordedVideoUrl(null)
                    setGeneratedShareUrl('')
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-lg font-semibold px-4 h-8.5"
                >
                  Done
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLoomState('idle')
                      setRecordedVideoUrl(null)
                    }}
                    className="border-border hover:bg-muted text-muted-foreground text-xs rounded-lg font-semibold"
                  >
                    Discard Sync
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePostLoomSync}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-lg font-semibold"
                  >
                    <Video className="size-3.5 mr-1" /> Upload & Post Sync
                  </Button>
                </>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
