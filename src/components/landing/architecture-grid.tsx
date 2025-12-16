'use client'
import { Box, Layers, Zap, GitBranch } from 'lucide-react'
import { Oswald } from 'next/font/google'

const oswald = Oswald({ subsets: ['latin'], weight: ['700'] })

const features = [
    {
        id: "01",
        title: "VECTOR EMBEDDINGS",
        desc: "Converts entire repositories into 1536-dimensional vector space for semantic search.",
        icon: Layers
    },
    {
        id: "02",
        title: "AST PARSING",
        desc: "Understand code structure, not just text. Resolves references across files.",
        icon: Box
    },
    {
        id: "03",
        title: "NEURAL COMMIT MAP",
        desc: "Visualizes git history as a connected graph of thought nodes.",
        icon: GitBranch
    },
    {
        id: "04",
        title: "REAL-TIME SYNC",
        desc: "Websockets maintain <50ms latency between local changes and AI context.",
        icon: Zap
    }
]

export const ArchitectureGrid = () => {
    return (
        <section className="relative z-10 w-full bg-neutral-950 text-white py-32 px-4 border-t border-white/10">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-end justify-between mb-20">
                    <h2 className={`${oswald.className} text-6xl md:text-8xl uppercase tracking-tighter`}>
                        System <br/> <span className="text-neutral-500">Modules</span>
                    </h2>
                    <div className="hidden md:block font-mono text-xs text-neutral-500 mb-4">
                        // ARCHITECTURE_V1.0 <br/>
                        // STATUS: OPTIMIZED
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-white/20">
                    {features.map((f) => (
                        <div key={f.id} className="group relative border-b border-r border-white/20 p-12 hover:bg-white/5 transition-colors duration-500">
                            <div className="font-mono text-xs text-neutral-500 mb-6">
                                [MODULE_{f.id}]
                            </div>
                            <f.icon className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className={`${oswald.className} text-3xl uppercase mb-4 tracking-wide`}>
                                {f.title}
                            </h3>
                            <p className="text-neutral-400 font-mono text-sm leading-relaxed max-w-sm">
                                {f.desc}
                            </p>

                            {/* Corner Accent on Hover */}
                            <div className="absolute top-0 right-0 w-0 h-0 border-t-[1px] border-r-[1px] border-transparent group-hover:w-8 group-hover:h-8 group-hover:border-white transition-all duration-300" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}