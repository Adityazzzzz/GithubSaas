'use client'
import { motion } from 'framer-motion'
import { Oswald } from 'next/font/google'
import { FileCode, Cpu, Database, MessageSquare, ArrowRight } from 'lucide-react'

const oswald = Oswald({ subsets: ['latin'], weight: ['700'] })

// Reusable Circuit Node
const CircuitNode = ({ title, icon: Icon, delay }: { title: string, icon: any, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="relative z-10 w-40 h-40 md:w-48 md:h-48"
    >
        {/* The 3D Block */}
        <div className="relative w-full h-full border border-white/20 bg-neutral-900/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 group hover:border-white transition-colors duration-300 shadow-2xl">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <Icon className="w-8 h-8 text-white" />
            <span className={`${oswald.className} text-lg uppercase tracking-widest text-white`}>{title}</span>
            
            {/* Decorative Tech Marks */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/30" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/30" />
        </div>
        
        {/* 3D Depth Shadow (CSS Hack) */}
        <div className="absolute top-2 left-2 w-full h-full border border-white/10 bg-transparent -z-10" />
    </motion.div>
)

export const IsoCircuit = () => {
    return (
        <section className="w-full bg-neutral-950 border-t border-white/20 py-32 overflow-hidden relative">
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="mb-20">
                    <h2 className={`${oswald.className} text-5xl md:text-7xl text-white uppercase tracking-tighter`}>
                        Processing <span className="text-neutral-600">Pipeline</span>
                    </h2>
                </div>

                {/* THE CIRCUIT CONTAINER */}
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                    
                    {/* Animated Connection Line (The Background Trace) */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 hidden md:block -translate-y-1/2 z-0">
                         <motion.div 
                            className="w-20 h-[1px] bg-white shadow-[0_0_10px_white]"
                            animate={{ x: ["0%", "1000%"] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                         />
                    </div>

                    {/* Node 1 */}
                    <CircuitNode title="INGEST" icon={FileCode} delay={0.1} />
                    
                    {/* Arrow */}
                    <ArrowRight className="text-neutral-700 w-8 h-8 rotate-90 md:rotate-0" />

                    {/* Node 2 */}
                    <CircuitNode title="VECTORIZE" icon={Cpu} delay={0.2} />

                    <ArrowRight className="text-neutral-700 w-8 h-8 rotate-90 md:rotate-0" />

                    {/* Node 3 */}
                    <CircuitNode title="INDEX" icon={Database} delay={0.3} />

                    <ArrowRight className="text-neutral-700 w-8 h-8 rotate-90 md:rotate-0" />

                    {/* Node 4 */}
                    <CircuitNode title="REASON" icon={MessageSquare} delay={0.4} />

                </div>
            </div>
        </section>
    )
}