'use client'
import { Oswald } from 'next/font/google'
import { GitGraph, Shield, Zap, Terminal, Globe, Cpu } from 'lucide-react'

const oswald = Oswald({ subsets: ['latin'], weight: ['700'] })

const items = [
    {
        title: "NEURAL INDEXING",
        desc: "We parse your entire repository into a 1536-dimensional vector space.",
        icon: Globe,
        stat: "100% COVERAGE"
    },
    {
        title: "SEMANTIC SEARCH",
        desc: "Query your codebase using natural language. Find logic, not just strings.",
        icon: SearchIcon, // Helper component below
        stat: "<50ms LATENCY"
    },
    {
        title: "AST PARSING",
        desc: "We understand code structure, inheritance, and dependency trees.",
        icon: GitGraph,
        stat: "REAL-TIME"
    },
    {
        title: "SECURITY SCAN",
        desc: "Predictive vulnerability detection before deployment.",
        icon: Shield,
        stat: "SOC2 READY"
    }
]

// Helper for the custom search icon visual
function SearchIcon({ className }: { className?: string }) {
    return <Terminal className={className} />
}

export const HoloDeck = () => {
    return (
        <section className="w-full bg-neutral-950 border-t border-white/20 relative z-10">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                 style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 border-l border-r border-white/20">
                {items.map((item, i) => (
                    <div key={i} className="group relative border-b border-white/20 p-12 md:p-16 hover:bg-white/5 transition-colors duration-300">
                        
                        {/* Hover Accent */}
                        <div className="absolute top-0 left-0 w-1 h-0 bg-white group-hover:h-full transition-all duration-300" />

                        {/* Icon */}
                        <div className="mb-8 opacity-50 group-hover:opacity-100 transition-opacity">
                            <item.icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Content */}
                        <h3 className={`${oswald.className} text-3xl md:text-4xl text-white uppercase tracking-tighter mb-4`}>
                            {item.title}
                        </h3>
                        <p className="text-neutral-400 font-mono text-sm leading-relaxed max-w-sm mb-8">
                            {item.desc}
                        </p>

                        {/* Stat Badge */}
                        <div className="flex items-center gap-2 border border-white/20 w-fit px-3 py-1 bg-black/50">
                            <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-neutral-300 tracking-widest">{item.stat}</span>
                        </div>

                        {/* Corner Crosshair */}
                        <div className="absolute top-4 right-4 text-white/20 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            [0{i+1}]
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}