'use client'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Terminal } from 'lucide-react'
import { Oswald } from 'next/font/google'

// Font setup for that "Industrial" look
const oswald = Oswald({ subsets: ['latin'], weight: ['700'] })

export const DistortionHero = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Mouse Physics
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Smooth the mouse movement for the lens
  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Subtle parallax for the text behind
  const textX = useTransform(springX, (value) => (value - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.05)
  const textY = useTransform(springY, (value) => (value - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * 0.05)

  const handleMouseMove = (e: React.MouseEvent) => {
    // Center the mouse relative to the container
    const { clientX, clientY } = e
    mouseX.set(clientX)
    mouseY.set(clientY)
  }

  return (
    <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative h-screen w-full bg-neutral-950 overflow-hidden flex flex-col items-center justify-center cursor-crosshair selection:bg-white selection:text-black"
    >
      
      {/* 1. THE NOISE GRAIN (Pure CSS) */}
      <div className="absolute inset-0 z-50 opacity-[0.15] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* 2. THE BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-20"
           style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}
      ></div>

      {/* 3. THE "REALITY LENS" (The Magic Part) 
         This follows the mouse and inverts/blurs everything behind it.
      */}
      <motion.div 
        style={{ 
            x: springX, 
            y: springY,
            translateX: '-50%',
            translateY: '-50%'
        }}
        className="fixed z-40 w-64 h-48 pointer-events-none hidden md:block"
      >
         {/* The Glass Block */}
         <div className="relative w-full h-full border border-white/30 bg-white/5 backdrop-blur-[6px] backdrop-invert backdrop-brightness-125 shadow-2xl rounded-sm overflow-hidden">
            {/* Fake "glare" lines on the glass */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40" />
            <div className="absolute bottom-0 right-0 w-[1px] h-full bg-white/40" />
            
            {/* Scanline Effect inside the lens */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.1)_50%)] bg-[length:100%_4px] opacity-50" />
         </div>
         
         {/* Coordinate Labels attached to the lens */}
         <div className="absolute -top-6 left-0 text-[10px] font-mono text-white/50">
            X: <motion.span>{springX}</motion.span>
         </div>
         <div className="absolute -bottom-6 right-0 text-[10px] font-mono text-white/50">
            Scanning...
         </div>
      </motion.div>


      {/* 4. THE MAIN CONTENT (Moves slightly away from mouse for 3D feel) */}
      <motion.div 
        style={{ x: textX, y: textY }}
        className="relative z-10 text-center space-y-6 px-4 mix-blend-screen"
      >
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 border-l-2 border-white bg-white/5 text-xs font-mono text-white tracking-widest uppercase">
           <Terminal className="w-3 h-3" />
           Neural Interface Online
        </div>

        {/* GIANT TEXT */}
        <h1 className={`${oswald.className} text-[18vw] md:text-[220px] leading-[0.8] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-100 to-neutral-700 select-none grayscale`}>
            GITBRAIN
        </h1>

        <p className="max-w-xl mx-auto text-lg md:text-xl text-neutral-400 font-mono tracking-tight">
            The neural layer for your codebase. <br/>
            <span className="text-white bg-white/10 px-1">Predict. Debug. Deploy.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/dashboard">
                <Button className="h-14 px-10 rounded-none bg-white text-black hover:bg-neutral-300 font-bold tracking-widest uppercase text-base transition-all hover:translate-x-1 hover:-translate-y-1 shadow-[4px_4px_0px_white]">
                    Enter System
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </Link>
        </div>

      </motion.div>

      {/* Decorative Technical Markers (Corners) */}
      <div className="absolute top-12 left-12 w-32 h-[1px] bg-white/20 hidden md:block" />
      <div className="absolute top-12 left-12 w-[1px] h-32 bg-white/20 hidden md:block" />
      
      <div className="absolute bottom-12 right-12 w-32 h-[1px] bg-white/20 hidden md:block" />
      <div className="absolute bottom-12 right-12 w-[1px] h-32 bg-white/20 hidden md:block" />
      
      {/* Center Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-white" />
      </div>

    </div>
  )
}