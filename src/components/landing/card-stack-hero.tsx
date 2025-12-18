'use client'

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useTransform, useSpring } from "framer-motion"
import { 
  GitBranch, Cpu, Database, 
  Settings, Activity, 
  LayoutDashboard, FolderOpen, Zap, Globe, Server, FileText, MoreHorizontal, Code2
} from "lucide-react"

// --- 1. MOCK COMPONENTS (Refined) ---

const MockAreaChart = ({ color }: { color: string }) => (
  <div className="h-28 w-full relative overflow-hidden rounded-xl border border-neutral-100 bg-gradient-to-b from-white to-neutral-50/50 mt-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
    <svg viewBox="0 0 400 100" className="w-full h-full absolute bottom-0">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
           <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" className={color} />
           <stop offset="100%" stopColor="currentColor" stopOpacity="0" className={color} />
        </linearGradient>
      </defs>
      <motion.path 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        d="M0,80 C50,80 50,40 100,40 C150,40 150,70 200,70 C250,70 250,30 300,30 C350,30 350,90 400,90 L400,100 L0,100 Z"
        fill={`url(#grad-${color})`}
        stroke="currentColor"
        strokeWidth="2"
        className={color}
      />
    </svg>
    {/* Refined Grid */}
    <div className="absolute inset-0 grid grid-cols-8 grid-rows-4">
        {[...Array(32)].map((_, i) => (
            <div key={i} className="border-r border-t border-neutral-200/30" />
        ))}
    </div>
  </div>
)

const MetricBlock = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-neutral-200 transition-all cursor-default group">
        <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100 group-hover:bg-white group-hover:scale-110 transition-all">
            <Icon className="w-4 h-4 text-neutral-500" />
        </div>
        <div>
            <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{label}</div>
            <div className="text-xs font-bold text-neutral-900 font-mono tracking-tight">{value}</div>
        </div>
    </div>
)

// --- DATA ---
const CARDS = [
  {
    id: 0,
    title: "Repository Sync",
    type: "Ingestion",
    icon: GitBranch,
    color: "text-blue-600",
    stats: [
        { label: "Memory", value: "240 MB", icon: Zap },
        { label: "Network", value: "1.2 GB/s", icon: Globe },
        { label: "Files", value: "4,209", icon: FileText },
    ],
    mainVisual: (
        <div className="space-y-2 mt-4 font-mono text-[10px] text-neutral-600 bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
             <div className="flex items-center gap-2 pb-2 border-b border-neutral-50 mb-2">
                 <Code2 className="w-3 h-3 text-neutral-400" />
                 <span className="text-neutral-400">src/middleware.ts</span>
             </div>
             <div className="flex gap-2"><span className="text-neutral-300">1</span> <span>export function <span className="text-blue-600">middleware</span>(req) &#123;</span></div>
             <div className="flex gap-2"><span className="text-neutral-300">2</span> <span className="pl-4">const url = req.nextUrl</span></div>
             <div className="flex gap-2"><span className="text-neutral-300">3</span> <span className="pl-4">if (url.pathname === <span className="text-green-600">'/admin'</span>) &#123;</span></div>
             <div className="flex gap-2"><span className="text-neutral-300">4</span> <span className="pl-8 text-neutral-400">// verifying auth token...</span></div>
        </div>
    ),
    logs: [
      "> git fetch origin main --depth=1",
      "> parsing dependency tree...",
      "> found 420 indexable nodes"
    ]
  },
  {
    id: 1,
    title: "Neural Engine",
    type: "Vectorization",
    icon: Cpu,
    color: "text-purple-600",
    stats: [
        { label: "GPU Load", value: "84%", icon: Zap },
        { label: "Tokens", value: "840k", icon: FileText },
        { label: "Latency", value: "12ms", icon: Activity },
    ],
    mainVisual: <MockAreaChart color="text-purple-500" />,
    logs: [
      "> loading 'text-embedding-3-large'...",
      "> batching tensors (size=512)...",
      "> converting syntax to semantics..."
    ]
  },
  {
    id: 2,
    title: "Knowledge Base",
    type: "Indexing",
    icon: Database,
    color: "text-emerald-600",
    stats: [
        { label: "IOPS", value: "4,200", icon: Server },
        { label: "Index", value: "142 MB", icon: Database },
        { label: "Cache", value: "Hit (99%)", icon: Zap },
    ],
    mainVisual: <MockAreaChart color="text-emerald-500" />,
    logs: [
      "> writing to pgvector shard_01...",
      "> optimizing HNSW graph links...",
      "> verifying vector distances..."
    ]
  },
]

export const CardStackWidget = () => {
  const [cards, setCards] = useState(CARDS)
  
  // --- MOUSE TILT LOGIC ---
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 150, damping: 20 })

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct * 200) // amplified for effect
    y.set(yPct * 200)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  // --- ROTATION LOGIC ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const newArray = [...prevCards]
        const first = newArray.shift()
        if (first) newArray.push(first)
        return newArray
      })
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const rotateCards = () => {
    setCards((prevCards) => {
      const newArray = [...prevCards]
      const first = newArray.shift()
      if (first) newArray.push(first)
      return newArray
    })
  }

  return (
    <div className="relative h-[700px] w-max flex items-center justify-center perspective-1000">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neutral-100 blur-[120px] rounded-full pointer-events-none" />
      
      {/* The Stack */}
      <motion.div 
        className="relative h-[500px] w-[24rem] sm:w-[36rem] lg:w-[42rem] cursor-pointer" 
        onClick={rotateCards}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1000 }} // Ensure perspective is applied here
      >
        <LayoutGroup>
          <AnimatePresence mode='popLayout'>
            {cards.map((card, index) => {
              if (index > 2) return null;
              
              const isTop = index === 0;

              return (
                <motion.div
                  layoutId={`card-${card.id}`}
                  key={card.id}
                  className="absolute h-full w-full rounded-3xl border border-neutral-200 bg-white flex overflow-hidden"
                  
                  // === REFINED SHADOWS & STYLES ===
                  style={{
                    transformOrigin: "center center",
                    transformStyle: "preserve-3d", // Critical for tilt
                    rotateX: isTop ? rotateX : 0,  // Only tilt top card
                    rotateY: isTop ? rotateY : 0,
                    boxShadow: isTop 
                        ? "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.02)" // Heavier shadow for top
                        : "0 10px 30px -10px rgba(0,0,0,0.05)",
                  }}
                  
                  // === STACK ANIMATION ===
                  initial={{ scale: 0.9, opacity: 0, y: -40, z: -100 }}
                  animate={{ 
                    scale: 1 - index * 0.04,
                    y: index * -22,
                    z: index * -40, // Real depth
                    zIndex: CARDS.length - index,
                    opacity: 1
                  }}
                  exit={{ 
                    scale: 1.1,
                    opacity: 0,
                    y: 40,
                    filter: "blur(10px)"
                  }}
                  transition={{ 
                    duration: 0.6, 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 25 
                  }}
                >
                   
                   {/* === COLUMN 1: DARK SIDEBAR (Pro Look) === */}
                   <div className="w-16 bg-[#0A0A0A] flex flex-col items-center py-6 gap-6 z-20 shrink-0 border-r border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shadow-inner">
                            <card.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col gap-4 mt-6 w-full items-center">
                            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center border-l-2 border-white cursor-pointer">
                                <LayoutDashboard className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:bg-neutral-800 hover:opacity-100 transition-all cursor-pointer">
                                <FolderOpen className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:bg-neutral-800 hover:opacity-100 transition-all cursor-pointer">
                                <Settings className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="mt-auto pb-4">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
                        </div>
                   </div>

                   {/* === COLUMN 2: MAIN CONTENT === */}
                   <div className="flex-1 flex flex-col bg-[#FBFBFB]">
                        
                        {/* Header */}
                        <div className="h-16 border-b border-neutral-100 bg-white flex items-center justify-between px-6 z-10">
                            <div>
                                <div className="flex items-center gap-2 text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                                    <span className="px-2 py-1 rounded bg-neutral-50 border border-neutral-100">Project_Alpha</span>
                                    <span className="text-neutral-300">/</span>
                                    <span>{card.type}</span>
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mt-1 tracking-tight">{card.title}</h3>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-neutral-600 shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Live
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Body */}
                        <div className="flex-1 p-6 flex flex-col gap-5 relative overflow-hidden">
                            
                            {/* Scanning Beam (Only on top card) */}
                            {isTop && (
                                <motion.div 
                                    initial={{ left: '-10%' }}
                                    animate={{ left: '120%' }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-0 bottom-0 w-[60px] bg-gradient-to-r from-transparent via-blue-500/5 to-transparent skew-x-12 pointer-events-none z-0"
                                />
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 z-10">
                                {card.stats.map((s, i) => (
                                    <MetricBlock key={i} label={s.label} value={s.value} icon={s.icon} />
                                ))}
                            </div>

                            {/* Main Visual */}
                            <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm relative overflow-hidden flex flex-col z-10">
                                 <div className="flex justify-between items-center px-4 pt-3 mb-1">
                                     <span className="text-[10px] font-bold text-neutral-500 flex items-center gap-2 uppercase tracking-wide">
                                         <Activity className="w-3 h-3 text-neutral-400" /> System Activity
                                     </span>
                                     <MoreHorizontal className="w-4 h-4 text-neutral-300" />
                                 </div>
                                 <div className="flex-1 w-full px-4 pb-2">
                                    {card.mainVisual}
                                 </div>
                            </div>

                        </div>

                        {/* Footer: Terminal Log */}
                        <div className="h-28 bg-[#0F0F0F] border-t border-black p-4 font-mono text-[10px] text-neutral-300 overflow-hidden relative z-20">
                             <div className="absolute top-2 right-2 flex gap-1">
                                 <div className="w-2 h-2 rounded-full bg-neutral-700" />
                                 <div className="w-2 h-2 rounded-full bg-neutral-700" />
                             </div>
                             <div className="space-y-1.5 opacity-80">
                                {card.logs.map((log, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: i * 0.3 }}
                                        className="flex gap-2"
                                    >
                                        <span className="text-neutral-600 select-none">00:0{1 + i}:2{i}</span>
                                        <span className={log.includes("error") ? "text-red-400" : "text-green-400"}>
                                            {log}
                                        </span>
                                    </motion.div>
                                ))}
                                {isTop && (
                                    <motion.span 
                                        animate={{ opacity: [0, 1] }} 
                                        transition={{ repeat: Infinity, duration: 0.8 }}
                                        className="inline-block w-1.5 h-3 bg-green-500 align-middle ml-1"
                                    />
                                )}
                             </div>
                        </div>

                   </div>

                </motion.div>
              )
            })}
          </AnimatePresence>
        </LayoutGroup>
      </motion.div>
    </div>
  )
}