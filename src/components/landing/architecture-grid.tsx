'use client'
import { motion } from 'framer-motion'
import { Cpu, ShieldCheck, Zap, GitMerge, Database, Code, Activity } from 'lucide-react'
import { JetBrains_Mono, Oswald } from 'next/font/google'

const oswald = Oswald({ subsets: ['latin'] })
const mono = JetBrains_Mono({ subsets: ['latin'] })

// --- COMPONENT: THE CYBER MODULE PANEL ---
const CyberModulePanel = ({ title, subtitle, icon: Icon, delay, className, children, sysId }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay * 0.1, duration: 0.6 }}
      whileHover={{ scale: 1.01 }}
      className={`group relative overflow-hidden bg-neutral-950 border border-white/10 p-8 flex flex-col justify-between transition-transform duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] ${className}`}
    >
      {/* 1. TOP LEFT STATUS CORNER */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
      
      {/* 2. Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-white/5 border border-white/10 rounded-sm text-emerald-400 group-hover:text-white group-hover:bg-emerald-500 transition-colors duration-300">
                <Icon size={24} strokeWidth={1.5} />
            </div>
            <span className={`${mono.className} text-[10px] text-neutral-600 uppercase tracking-widest transition-colors`}>
                {sysId}
            </span>
        </div>

        <h3 className={`${oswald.className} text-3xl text-neutral-100 mb-2 uppercase tracking-wide`}>{title}</h3>
        <p className={`${mono.className} text-sm text-neutral-400 leading-relaxed`}>{subtitle}</p>
      </div>

      {/* 3. VISUALIZATION WINDOW */}
      <div className="mt-8 relative h-32 w-full border border-white/10 bg-black/50 overflow-hidden rounded-sm">
         {children}
      </div>
      
      {/* 4. BOTTOM FOOTER/STATUS */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-neutral-900/50 border-t border-white/10 flex items-center px-4">
         <span className={`${mono.className} text-[10px] text-emerald-500/70`}>STATUS: ACTIVE</span>
      </div>
    </motion.div>
  )
}

// --- MAIN GRID COMPONENT ---
export const ArchitectureGrid = () => {
  return (
    <section className="relative w-full py-24 px-4 md:px-8 bg-neutral-950">
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-16 border-b border-white/10 pb-8 flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
                <div className={`${mono.className} text-emerald-500 text-xs mb-2 tracking-[0.2em] uppercase`}>
                    // System_Architecture_v3
                </div>
                <h2 className={`${oswald.className} text-6xl text-white uppercase tracking-tighter`}>
                    Core Modules
                </h2>
            </div>
            <p className={`${mono.className} text-neutral-400 text-sm max-w-md text-right hidden md:block`}>
                Deploying neural vectorization across your entire repository infrastructure.
            </p>
        </div>

        {/* Bento Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(400px,auto)]">
            
            {/* 1. NEURAL INDEXING (Large) */}
            <CyberModulePanel 
                title="Neural Indexing" 
                subtitle="Transforms your entire codebase into a vector database for semantic search."
                icon={Cpu}
                delay={0}
                sysId="SYS_MOD_01"
                className="md:col-span-2"
            >
                {/* Visual: Code/Vector Visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border border-white/20 rounded-full"
                    />
                    <div className="absolute w-16 h-16 border border-emerald-500/50 rounded-full shadow-[0_0_10px_#10b981] animate-pulse" />
                    <div className={`${mono.className} text-[10px] text-white absolute top-4 left-4`}>V_DIMS: 1024</div>
                    <div className={`${mono.className} text-[10px] text-white absolute bottom-4 right-4`}>CONTEXT_W: 4k</div>
                </div>
            </CyberModulePanel>

            {/* 2. ZERO-TRUST LOGIC (Tall) */}
            <CyberModulePanel 
                title="Zero-Trust Logic" 
                subtitle="Code execution is sandboxed, verifying every request before data exposure."
                icon={ShieldCheck}
                delay={1}
                sysId="SEC_MOD_09"
                className="md:row-span-2"
            >
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                     {/* Encryption Scan Bar */}
                     <motion.div 
                        animate={{ y: [-10, 10] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-8 border border-red-500/50 bg-black/50 flex items-center justify-center"
                     >
                        <span className={`${mono.className} text-red-500 text-[10px] tracking-widest`}>[ACCESS DENIED]</span>
                     </motion.div>
                     <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mt-4">
                         <motion.div 
                            animate={{ x: [-100, 200] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="h-full w-1/3 bg-emerald-500 blur-[2px]" 
                         />
                     </div>
                 </div>
            </CyberModulePanel>

            {/* 3. PREDICTIVE CACHE (Standard) */}
            <CyberModulePanel 
                title="Predictive Cache" 
                subtitle="Anticipates next required files and documentation, minimizing perceived latency."
                icon={Zap}
                delay={2}
                sysId="SPD_MOD_12"
            >
                {/* Visual: Cache Hit/Miss */}
                <div className="absolute inset-0 p-4">
                    <div className={`${mono.className} text-xs text-emerald-400`}>CACHE_HIT_RATE: 92%</div>
                    <div className="flex justify-between items-end h-full">
                        {[...Array(10)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.random() > 0.1 ? 90 : 20}%` }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`w-3 rounded-t-sm ${Math.random() > 0.1 ? 'bg-emerald-500' : 'bg-red-500/50'}`}
                            />
                        ))}
                    </div>
                </div>
            </CyberModulePanel>

            {/* 4. GIT INTEGRATION (Standard) */}
            <CyberModulePanel 
                title="Git Integration" 
                subtitle="Deep code flow analysis linked directly to commit metadata and authorship."
                icon={GitMerge}
                delay={3}
                sysId="VCS_MOD_44"
            >
                {/* Visual: Animated Code Log */}
                <div className="absolute inset-0 p-4 font-mono text-[10px] text-neutral-500 overflow-hidden leading-snug">
                    <motion.div animate={{ y: [-20, -120] }} transition={{ duration: 5, ease: "linear", repeat: Infinity }}>
                        <p className="text-emerald-400">$ gitbrain diff [neural-weights]</p>
                        <p>--- a/core/llm_logic.ts</p>
                        <p>+++ b/core/llm_logic.ts</p>
                        <p>- const C_WINDOW = 2048;</p>
                        <p>+ const C_WINDOW = 4096; <span className="text-emerald-500">// AI_PREDICT: INCREASED</span></p>
                        <p>+ </p>
                        <p className="text-blue-400">commit 9a1b2c3d</p>
                        <p className="pl-2">Author: system_bot</p>
                        <p className="pl-2">Date: 2025-12-16</p>
                    </motion.div>
                </div>
            </CyberModulePanel>
        </div>
    </section>
  )
}