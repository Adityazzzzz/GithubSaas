'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowUpRight, Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { Oswald } from 'next/font/google'
import { GitBrainLogo } from '@/components/logo'

const oswald = Oswald({ subsets: ['latin'], weight: ['700'] })

export const CombinedFooter = () => {
    return (
        <footer className="w-full bg-neutral-950 text-white relative overflow-hidden border-t border-white/20">
            
            


            {/* === SECTION 2: THE INFO GRID (From your Reference Image) === */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    
                    {/* Col 1: Brand & Value Prop */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="scale-75 origin-left">
                            <GitBrainLogo />
                        </div>
                        <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                            We help developers harness the power of Vector Embeddings to automate documentation, improve debugging, and drive smarter code decisions.
                        </p>
                    </div>

                    {/* Col 2: Navigation Links */}
                    <div className="md:col-span-1">
                        <h4 className="font-mono text-xs text-neutral-500 uppercase tracking-widest mb-6">Main Links</h4>
                        <ul className="space-y-4 text-sm font-medium text-neutral-300">
                            <li><Link href="/" className="hover:text-white hover:underline decoration-blue-500 underline-offset-4 transition-all">Home ↗</Link></li>
                            <li><Link href="#features" className="hover:text-white hover:underline decoration-blue-500 underline-offset-4 transition-all">Modules</Link></li>
                            <li><Link href="#workflow" className="hover:text-white hover:underline decoration-blue-500 underline-offset-4 transition-all">Workflow</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white hover:underline decoration-blue-500 underline-offset-4 transition-all">Login</Link></li>
                        </ul>
                    </div>

                    {/* Col 3: Legal / Extra */}
                    <div className="md:col-span-1">
                        <h4 className="font-mono text-xs text-neutral-500 uppercase tracking-widest mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm font-medium text-neutral-300">
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Security (SOC2)</Link></li>
                        </ul>
                    </div>

                    {/* Col 4: Newsletter (Stay Connected) */}
                    <div className="md:col-span-1">
                        <h4 className="font-mono text-xs text-white uppercase tracking-widest mb-6">Stay Connected</h4>
                        <p className="text-neutral-500 text-xs mb-4">Join our changelog for updates, tips, and system alerts.</p>
                        
                        <div className="flex flex-col gap-2">
                            <input 
                                type="email" 
                                placeholder="Enter email address" 
                                className="bg-neutral-900 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-600"
                            />
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-mono uppercase tracking-widest py-3 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* === SECTION 3: THE CONTACT BAR (Bottom Row from Ref) === */}
                <div className="grid grid-cols-1 md:grid-cols-4 border-t border-white/10">
                    
                    {/* Block 1: Email */}
                    <div className="p-8 border-r border-white/10 flex flex-col justify-center hover:bg-white/5 transition-colors group">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase mb-2">Get in Touch</span>
                        <a href="mailto:support@gitbrain.ai" className="text-sm md:text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                            SUPPORT@GITBRAIN.AI
                        </a>
                    </div>

                    {/* Block 2: Address */}
                    <div className="p-8 border-r border-white/10 flex flex-col justify-center hover:bg-white/5 transition-colors">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase mb-2">HQ Address</span>
                        <p className="text-sm text-neutral-300 leading-snug">
                            1238 Neural Ridge Blvd<br/>
                            San Francisco, CA 94103
                        </p>
                    </div>

                    {/* Block 3: Socials */}
                    <div className="p-8 border-r border-white/10 flex flex-col justify-center hover:bg-white/5 transition-colors">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase mb-2">Social</span>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-white/5 hover:bg-white/20 rounded transition-colors"><Twitter className="w-4 h-4 text-white" /></Link>
                            <Link href="#" className="p-2 bg-white/5 hover:bg-white/20 rounded transition-colors"><Github className="w-4 h-4 text-white" /></Link>
                            <Link href="#" className="p-2 bg-white/5 hover:bg-white/20 rounded transition-colors"><Linkedin className="w-4 h-4 text-white" /></Link>
                        </div>
                    </div>

                    {/* Block 4: Copyright */}
                    <div className="p-8 flex flex-col justify-center hover:bg-white/5 transition-colors">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase mb-2">Legal</span>
                        <p className="text-xs text-neutral-400">
                            © 2025 GitBrain Inc.<br/>
                            <span className="text-neutral-600">Engineered by Adityazzzz</span>
                        </p>
                    </div>

                </div>
            </div>

        </footer>
    )
}