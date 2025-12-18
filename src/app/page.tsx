'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Terminal, Activity, Zap, ShieldCheck, Search, Database } from 'lucide-react'
import { Button } from '@/components/ui/button' 
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
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
                                Crafted by <span className="font-bold text-neutral-900">Aditya.</span>
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