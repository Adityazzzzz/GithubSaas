'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Terminal, Activity, Zap, ShieldCheck, Search, Database } from 'lucide-react'
import { Button } from '@/components/ui/button' 
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { TechStackStrip } from '@/components/landing/tech-stack'
import { CardStackWidget } from '@/components/landing/card-stack-hero'
import { HeroLeftColumn } from '@/components/landing/hero-left'
import { GitBrainLogo } from '@/components/logo'
import { Caveat } from 'next/font/google'

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'] })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const AnimatedCounter = ({ end, duration = 2 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const increment = end / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [end, duration])

  return <span>{new Intl.NumberFormat('en-US').format(count)}</span>
}

// --- COMPONENT: THE ULTRA-LARGE WIDGET ---
const UltraScannerWidget = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative w-full max-w-3xl mx-auto perspective-1000 group"
      style={{ transformStyle: 'preserve-3d' }}
    >
        {/* Soft Shadow Blob */}
        <div className="absolute top-20 left-10 w-[90%] h-[80%] bg-blue-500/5 rounded-[3rem] blur-3xl -z-10 transition-all duration-1000 group-hover:bg-blue-500/10" />
        
        {/* Main Interface Window */}
        <div className="relative bg-white rounded-2xl border border-neutral-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
            
            {/* SCANNING BEAM EFFECT */}
            <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-20 pointer-events-none"
            />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 backdrop-blur-md z-10 relative">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-neutral-300 bg-neutral-100" />
                    <div className="w-3 h-3 rounded-full border border-neutral-300 bg-neutral-100" />
                    <div className="w-3 h-3 rounded-full border border-green-500/30 bg-green-500" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-neutral-200 shadow-sm">
                   <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest font-jakarta">Live Indexing</span>
                </div>
            </div>

            {/* Main Grid Content */}
            <div className="flex h-[400px]">
                
                {/* Left Sidebar (Navigation) */}
                <div className="w-64 border-r border-neutral-100 p-6 hidden md:flex flex-col gap-6 bg-neutral-50/30">
                    <div className="space-y-4">
                        <div className="h-2 w-20 bg-neutral-200 rounded-full" />
                        <div className="space-y-3 pt-2">
                            {[1,2,3].map((i) => (
                                <div key={i} className="flex items-center gap-3 opacity-60">
                                    <div className="w-4 h-4 rounded bg-neutral-200" />
                                    <div className="h-2 w-24 bg-neutral-200 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-auto p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs font-semibold text-neutral-600">Storage</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-neutral-800 w-[70%]" />
                        </div>
                    </div>
                </div>

                {/* Right Content (The Dashboard) */}
                <div className="flex-1 p-8 overflow-hidden relative">
                    
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Vectors Embeddings</p>
                            <h3 className="text-4xl font-bold text-neutral-900 tracking-tight font-jakarta">
                                <AnimatedCounter end={84920} />
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Query Latency</p>
                            <h3 className="text-4xl font-bold text-neutral-900 tracking-tight font-jakarta">
                                <AnimatedCounter end={124} /> <span className="text-xl text-neutral-400 font-normal">ms</span>
                            </h3>
                        </div>
                    </div>

                    {/* Active Scanning Visual */}
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-xs font-bold text-neutral-700 uppercase tracking-wide">
                            <span className="flex items-center gap-2">
                                <Search className="w-3 h-3" />
                                Semantic Analysis
                            </span>
                            <span>Processing...</span>
                        </div>
                        <div className="relative h-12 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                             {/* Moving Code Snippets */}
                             <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex gap-2 overflow-hidden opacity-40">
                                <motion.div 
                                    animate={{ x: [-200, 0] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="flex gap-4 font-mono text-[10px] text-neutral-600 whitespace-nowrap"
                                >
                                    <span>import &#123; Vector &#125; from &apos;@gitbrain/core&apos;;</span>
                                    <span>const embed = await model.embed(ctx);</span>
                                    <span>return db.insert(vectors).values(embed);</span>
                                </motion.div>
                             </div>
                             {/* Progress Bar Overlay */}
                             <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-0 left-0 h-1 bg-blue-500"
                             />
                        </div>
                    </div>

                    {/* Floating Cards (Staggered) */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-default"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-neutral-700">Auto-Fix</span>
                            </div>
                            <div className="text-[10px] text-neutral-500 leading-relaxed">
                                Detected memory leak in <code>auth.ts</code>. Patch generated.
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-default"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 rounded-md bg-green-50 text-green-600">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-neutral-700">Security</span>
                            </div>
                            <div className="text-[10px] text-neutral-500 leading-relaxed">
                                No PII detected in indexed files. SOC2 compliant.
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white ${jakarta.variable} ${inter.variable} font-sans overflow-x-hidden`}>
      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{ 
               backgroundImage: `linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)`, 
               backgroundSize: '50px 50px',
               opacity: 0.5
           }} 
      />
     
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <GitBrainLogo/>
            <Link href="/dashboard">
                <Button variant="ghost" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50">
                    Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
                </Button>
            </Link>
        </div>
      </nav>

      <main className="relative z-10 flex items-center justify-center min-h-[92vh] pt-32 pb-20 lg:pt-0 lg:pb-0 px-6">
        <div className="max-w-[1400px] w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className='mt-14'>
                    <HeroLeftColumn />
                </div>
                <div className='flex flex-col'>
                    <CardStackWidget />
                    <div className='ml-30'>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 1 }}
                            className="mt-12 flex items-center gap-6 group"
                        >
                            {/* Line: Made longer (w-12 -> w-24) and slightly thicker (h-[2px]) */}
                            <div className="h-[2px] w-12 bg-neutral-300 group-hover:w-24 group-hover:bg-neutral-800 transition-all duration-500" />
                            
                            {/* Text: Increased from text-xl to text-4xl */}
                            <div className={`${caveat.className} text-3xl sm:text-4xl text-neutral-500 -rotate-2 group-hover:text-neutral-900 group-hover:rotate-0 transition-all duration-300 origin-left`}>
                                Crafted by <span className="font-bold text-neutral-900">Adityazzzz.</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
                
            </div>
        </div>
      </main>
      <TechStackStrip/>
    </div>
  )
}