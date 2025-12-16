'use client'
import { Button } from "@/components/ui/button"
import { GithubGlobe } from "@/components/github-globe"
import { Plus, Cpu, Terminal, GitCommit, Database, HardDrive, Share2 } from "lucide-react"
import { motion } from "framer-motion"

export const NoProjectPlaceholder = () => {
    return (
        // 1. Updated Container Colors for Light/Dark Mode
        <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-center">
            
            {/* 2. Grid Background (Subtle in light, distinct in dark) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 z-0"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

            {/* ================= LEFT SIDE UI ================= */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 z-10 w-72">
                
                {/* Card 1: System Status - Adaptive Colors */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md p-4 shadow-xl dark:shadow-2xl"
                >
                    <div className="flex items-center gap-2 mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">SYSTEM STATUS</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-neutral-500">Neural Engine</span>
                            <span className="text-green-600 dark:text-green-500 font-mono">IDLE</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-neutral-500">Vector Store</span>
                            <span className="text-yellow-600 dark:text-yellow-500 font-mono">WAITING</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-blue-600 w-1/3 animate-pulse"></div>
                        </div>
                    </div>
                </motion.div>

                {/* Card 2: Storage Metrics */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md p-4 shadow-xl dark:shadow-2xl opacity-80"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Database className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">STORAGE HEURISTICS</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                            <HardDrive className="h-3 w-3" />
                            <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full">
                                <div className="bg-purple-500 h-full w-[0%]"></div>
                            </div>
                            <span>0%</span>
                        </div>
                    </div>
                </motion.div>
            </div>


            {/* ================= RIGHT SIDE UI ================= */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 z-10 w-72">
                
                {/* Card 3: Terminal */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gray-50/80 dark:bg-black/60 backdrop-blur-md p-5 shadow-xl dark:shadow-2xl font-mono text-xs"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Terminal className="h-4 w-4 text-green-600 dark:text-green-500" />
                        <span className="text-neutral-600 dark:text-neutral-400">terminal.tsx</span>
                    </div>
                    <div className="space-y-2 text-neutral-500 dark:text-neutral-500">
                        <p>&gt; initializing_git_brain...</p>
                        <p>&gt; loading_modules... <span className="text-green-600 dark:text-green-500">OK</span></p>
                        <p className="animate-pulse">...</p>
                    </div>
                </motion.div>

                {/* Card 4: Activity Stream */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md p-4 shadow-xl dark:shadow-2xl flex flex-col gap-3"
                >
                    <div className="flex items-center gap-2 mb-1 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                        <GitCommit className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">ACTIVITY STREAM</span>
                    </div>
                    <div className="relative pl-3 border-l border-neutral-200 dark:border-neutral-800 space-y-3">
                        <div className="relative">
                            <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                            <div className="text-xs text-neutral-500">Awaiting repository connection...</div>
                        </div>
                    </div>
                </motion.div>
            </div>


            {/* ================= CENTER HERO ================= */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full pointer-events-none pb-20">
                <h2 className="text-5xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-neutral-600 text-center">
                    GitBrain
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-xl max-w-lg mx-auto mt-4 font-medium text-center">
                    Ignite your repository's neural network.
                </p>
                
                <div className="mt-8 pointer-events-auto">
                    <Button 
                        size="lg"
                        className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold px-8 h-12 text-base rounded-full shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95"
                        onClick={() => document.getElementById('create-project-trigger')?.click()}
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Create Project
                    </Button>
                </div>
            </div>

            {/* 3. INCREASED GLOBE SIZE: max-w-[800px] */}
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-full max-w-[800px] aspect-square z-0 opacity-100">
                <GithubGlobe />
            </div>

            {/* Atmosphere Glow (Dark for dark mode, subtle gray/blue for light mode) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full"></div>

        </div>
    )
}