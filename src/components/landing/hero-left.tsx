'use client'

import { motion,AnimatePresence } from 'framer-motion'
import { ArrowRight, Github, CheckCircle2, Terminal, ShieldCheck, Zap, Loader2, Star } from 'lucide-react'
import { useState } from 'react'
import { Caveat } from 'next/font/google'
import { useRouter } from 'next/navigation'

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'] })

export const HeroLeftColumn = () => {
    const router = useRouter()
    const [repoUrl, setRepoUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [repoData, setRepoData] = useState<any>(null) // To store GitHub data
    const [error, setError] = useState("")
    const handleIndex = async () => {
    const cleanPath = repoUrl.replace("https://github.com/", "").replace("github.com/", "")
    if (!cleanPath) return
    setLoading(true)
    setError("")
    setRepoData(null)

    try {
        const res = await fetch(`https://api.github.com/repos/${cleanPath}`)
        if (!res.ok) throw new Error("Repo not found")
        const data = await res.json()
        setRepoData(data)
    } 
    catch (err) {
        setError("Repository not found or private.")
    } 
    finally {
        setLoading(false)
    }
  }
    const handleContinue = () => {
        router.push(`/dashboard?repo=${encodeURIComponent(repoUrl)}`)
    }

    return (
        <div className="max-w-xl mx-auto lg:mx-0 relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-0">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200 shadow-sm mb-8 hover:border-neutral-300 transition-colors cursor-default mt-10"
            >
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">System Operational</span>
                    </div>
                    <div className="w-px h-3 bg-neutral-200" />
                    <span className="text-[10px] font-medium text-neutral-400">v2.4.0-stable</span>
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold tracking-tighter leading-[1] text-neutral-900 mb-6"
            >
                The Neural <br />
                Architecture for <br />
                <span className="text-neutral-400">Your Codebase.</span>
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-neutral-600 font-medium leading-relaxed max-w-lg mb-10"
            >
                Transform your repository into a queryable knowledge graph. 
                <span className="text-neutral-900 font-semibold"> Zero-config RAG </span> 
                that understands your project's logic, dependencies, and history.
                <div className="h-4"></div>
                
                
            </motion.p>

            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-md flex flex-col gap-4"
        >
            <div className="relative group z-20">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Github className="h-5 w-5 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                </div>
                <input 
                    type="text" 
                    className={`block w-full pl-12 pr-32 py-4 bg-white border ${error ? 'border-red-300 focus:ring-red-200' : 'border-neutral-200 focus:ring-neutral-900'} rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.05)] focus:ring-2 focus:border-transparent outline-none transition-all`}
                    placeholder="github.com/Adityazzzz/project"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleIndex()}
                />
                <button 
                    onClick={handleIndex}
                    disabled={loading}
                    className="absolute right-2 top-2 bottom-2 bg-neutral-900 hover:bg-black text-white px-5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Index"}
                    {!loading && <ArrowRight className="w-3 h-3" />}
                </button>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-red-500 font-medium pl-2">
                    {error}
                </motion.div>
            )}

            {/* --- THE REPO PREVIEW CARD (MAGICAL PART) --- */}
            <AnimatePresence>
                {repoData && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full bg-white border border-neutral-200 rounded-xl p-4 shadow-lg flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <img src={repoData.owner.avatar_url} alt="Avatar" className="w-10 h-10 rounded-lg border border-neutral-100" />
                            <div className="text-left">
                                <div className="text-sm font-bold text-neutral-900 leading-tight">{repoData.name}</div>
                                <div className="flex items-center gap-3 text-[10px] text-neutral-500 mt-1">
                                    <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {repoData.stargazers_count}</span>
                                    {repoData.language && <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> {repoData.language}</span>}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleContinue}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-sm animate-pulse"
                        >
                            Analyze Now
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {!repoData && (
                <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-medium px-2 uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> Free Tier
                    </span>
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> No CC Required
                    </span>
                </div>
            )}
        </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="mt-12 pt-8 border-t border-neutral-200 w-full flex items-center justify-between lg:justify-start gap-8 lg:gap-12"
            >
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="p-2 rounded-md bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                        <Terminal className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Deploy</div>
                        <div className="text-xs font-bold text-neutral-900">On-Prem / Cloud</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 group cursor-default">
                    <div className="p-2 rounded-md bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                        <ShieldCheck className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Security</div>
                        <div className="text-xs font-bold text-neutral-900">SOC2 Type II</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 group cursor-default">
                    <div className="p-2 rounded-md bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                        <Zap className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Speed</div>
                        <div className="text-xs font-bold text-neutral-900">~120ms Query</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}