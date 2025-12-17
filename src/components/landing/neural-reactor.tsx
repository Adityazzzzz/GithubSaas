'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Database, Cpu, Server, Code, Terminal, Activity, Zap, TrendingUp, Circle, CheckCircle2 } from 'lucide-react'
import { Oswald, JetBrains_Mono } from 'next/font/google'
import { useState, useEffect } from 'react'

const oswald = Oswald({ subsets: ['latin'] })
const mono = JetBrains_Mono({ subsets: ['latin'] })

// --- CONFIGURATION ---
const PROCESS_STEPS = [
    { id: 0, title: "INGEST", icon: GitBranch, color: "text-amber-400", hex: "#f59e0b", detail: "Repository Sync & Data Tokenization." },
    { id: 1, title: "EMBEDDING", icon: Database, color: "text-blue-400", hex: "#3b82f6", detail: "Vector Matrix Construction (1024-Dim)." },
    { id: 2, title: "REASONING", icon: Cpu, color: "text-emerald-400", hex: "#10b981", detail: "LLM Inference & Predictive State Analysis." },
    { id: 3, title: "EXECUTION", icon: Server, color: "text-purple-400", hex: "#9333ea", detail: "Action Layer: Auto-Fix, Deploy, or Advise." }
]

// --- COMPONENT 1: THE FLOATING NODE ---
// Used in the Architecture Visualization
const FluxNode = ({ title, icon: Icon, color, delay, active }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: active ? 1.05 : 1 }}
        transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
        className="relative w-32 h-32 flex flex-col items-center justify-center p-3 cursor-pointer"
        whileHover={{ scale: 1.05 }}
    >
        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 border-2 rounded-full transition-all duration-500`} 
             style={{ borderColor: active ? `${color}40` : 'rgba(255,255,255,0.05)', boxShadow: active ? `0 0 20px ${color}80` : 'none' }}
        />
        
        {/* Icon & Label */}
        <Icon size={32} className={`${color} mb-1 transition-colors duration-300`} />
        <span className={`${mono.className} text-[10px] uppercase font-bold text-white/80`}>{title}</span>
    </motion.div>
)

// --- COMPONENT 2: THE FLOW BEAM (Thin, Glowing Line) ---
const FlowBeam = ({ start, end, delay = 0, color, active }: any) => {
    return (
        <motion.path
            d={`M ${start.x} ${start.y} C ${start.x} ${start.y + 100}, ${end.x} ${end.y - 100}, ${end.x} ${end.y}`}
            fill="none"
            strokeWidth="1"
            stroke="rgba(255,255,255,0.1)"
            className="pointer-events-none"
        >
            <motion.animate
                 attributeName="stroke"
                 values={`rgba(255,255,255,0.1); ${color}FF; rgba(255,255,255,0.1)`}
                 keyTimes="0; 0.5; 1"
                 dur="4s"
                 repeatCount="indefinite"
            />
            {active && (
                <motion.animate
                     attributeName="stroke-dashoffset"
                     values="100; 0"
                     dur="1.5s"
                     repeatCount="indefinite"
                />
            )}
        </motion.path>
    )
}

// --- COMPONENT 3: THE MAIN FLUX DASHBOARD ---
export const FluxDashboard = () => {
    const [activeStep, setActiveStep] = useState(PROCESS_STEPS[0])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => PROCESS_STEPS[(prev.id + 1) % PROCESS_STEPS.length])
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative w-full py-32 bg-black overflow-hidden">
            
            {/* Background Noise/Grid */}
            <div className="absolute inset-0 bg-neutral-950/50 opacity-50 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', 
                     backgroundSize: '30px 30px' 
                 }}
            />

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                
                {/* --- LEFT SIDE: THE DATA LOG & CTA --- */}
                <div className="relative z-20 space-y-12 pr-10">
                    
                    <div className="space-y-6">
                        <div className={`${mono.className} text-emerald-500 text-sm tracking-widest uppercase flex items-center gap-2`}>
                            <Activity size={16} />
                            Real-Time System Log
                        </div>
                        <h2 className={`${oswald.className} text-7xl text-white uppercase leading-none tracking-tighter`}>
                            Neural <span className="text-neutral-600">Flow</span>
                        </h2>
                        <p className={`text-xl text-neutral-400 max-w-lg leading-relaxed`}>
                            The architecture is dynamic. Every commit triggers a cascading, automated analysis across the entire vector space.
                        </p>
                    </div>

                    {/* Interactive Log */}
                    <div className="space-y-4 relative">
                        {PROCESS_STEPS.map((step, index) => (
                            <div 
                                key={index}
                                onClick={() => setActiveStep(step)}
                                className={`group relative pl-10 py-3 cursor-pointer transition-all duration-300 border-l border-white/10 ${activeStep.id === index ? 'opacity-100 border-emerald-500/80' : 'opacity-50 hover:opacity-80'}`}
                            >
                                <h3 className={`${mono.className} text-white text-sm tracking-wide flex items-center gap-2`}>
                                    <Zap size={10} className={step.color} />
                                    {step.title}
                                </h3>
                                <p className={`text-neutral-500 text-xs`}>
                                    // {step.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- RIGHT SIDE: THE ABSTRACTION VISUALIZATION --- */}
                <div className="relative h-[600px] w-full mt-10 lg:mt-0 flex items-center justify-center">
                    
                    {/* The 3D/Space Container (Angled slightly for depth) */}
                    <div className="relative w-full h-full preserve-3d" style={{ transform: 'rotateX(5deg) rotateY(10deg)' }}>
                        
                        {/* SVG Wires (The Flow) */}
                        <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                            {/* Ingest -> Embedding */}
                            <FlowBeam start={{x: 200, y: 100}} end={{x: 100, y: 250}} delay={0} color={PROCESS_STEPS[0].hex} active={activeStep.id === 0} />
                            {/* Embedding -> Reasoning */}
                            <FlowBeam start={{x: 100, y: 250}} end={{x: 300, y: 350}} delay={1} color={PROCESS_STEPS[1].hex} active={activeStep.id === 1} />
                            {/* Reasoning -> Execution */}
                            <FlowBeam start={{x: 300, y: 350}} end={{x: 200, y: 500}} delay={2} color={PROCESS_STEPS[2].hex} active={activeStep.id === 2} />
                        </svg>

                        {/* Nodes (Floating Modules) */}
                        <div className="absolute top-10 left-1/3 -translate-x-1/2">
                            <FluxNode title="INGEST" icon={GitBranch} color={PROCESS_STEPS[0].color} delay={0.1} active={activeStep.id === 0} />
                        </div>
                        <div className="absolute top-40 left-1/4 -translate-x-1/2">
                            <FluxNode title="V-MATRIX" icon={Database} color={PROCESS_STEPS[1].color} delay={0.3} active={activeStep.id === 1} />
                        </div>
                        <div className="absolute top-64 left-2/3 -translate-x-1/2">
                            <FluxNode title="LLM_CORE" icon={Cpu} color={PROCESS_STEPS[2].color} delay={0.5} active={activeStep.id === 2} />
                        </div>
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                            <FluxNode title="ACTION" icon={Server} color={PROCESS_STEPS[3].color} delay={0.7} active={activeStep.id === 3} />
                        </div>


                        {/* --- ACTIVE DATA OVERLAY --- */}
                        {/* A minimal terminal box that follows the active step's position */}
                        <motion.div
                            key={activeStep.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0, x: activeStep.id * 50 - 50 }} // Simple positional translation
                            transition={{ duration: 0.5, type: "spring" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 p-4 bg-black/90 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/20"
                        >
                            <div className={`flex items-center gap-2 ${mono.className} text-xs text-white/90`}>
                                <Circle size={8} fill={activeStep.hex} stroke="none" />
                                <span>{activeStep.title} &gt; {activeStep.detail.split(' ')[0]}</span>
                            </div>
                        </motion.div>
                        
                    </div>
                </div>

            </div>
        </section>
    )
}