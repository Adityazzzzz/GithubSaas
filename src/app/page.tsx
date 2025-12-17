'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  Github, 
  Bot, 
  Sparkles, 
  Command, 
  GitBranch, 
  MessageSquare, 
  Check, 
  ChevronDown, 
  Code2, 
  Cpu, 
  Globe 
} from 'lucide-react'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import Image from 'next/image'
import Dashboard from '@/images/image.png'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400/20 opacity-20 blur-[100px]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-900 text-white">
                    <Bot className="size-5" />
                </div>
                <span>GitBrain</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
                <Link href="#features" className="hover:text-zinc-900 transition-colors">Features</Link>
                <Link href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it works</Link>
                <Link href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link>
                <Link href="#faq" className="hover:text-zinc-900 transition-colors">FAQ</Link>
            </div>
            <div className="flex items-center gap-3">
                <Link href="/sign-in">
                    <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-zinc-900 font-medium">Log in</Button>
                </Link>
                <Link href="/sign-up">
                    <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-5 shadow-lg shadow-zinc-900/10 transition-transform active:scale-95">
                        Get Started
                    </Button>
                </Link>
            </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-24 pb-20 text-center px-4 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white pl-2 pr-4 py-1 text-sm font-medium text-zinc-600 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <span className="flex items-center justify-center size-5 rounded-full bg-blue-50 text-blue-600">
              <Sparkles className="size-3" />
           </span>
           <span>v1.0 Public Beta is Live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-zinc-900 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
           Chat with your codebase <br className="hidden md:block"/>
           <span className="text-zinc-400">like a senior engineer.</span>
        </h1>
        
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
           GitBrain indexes your repositories, meeting notes, and documentation to answer complex questions with context-aware accuracy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base rounded-full bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-900/10 hover:scale-[1.02] transition-all">
                    Start Indexing for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
            <Link href="https://github.com">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 shadow-sm">
                    <Github className="mr-2 h-4 w-4" /> Star on GitHub
                </Button>
            </Link>
        </div>

        {/* Browser Mockup */}
        {/* Browser Mockup */}
        <div className="relative mx-auto max-w-[1100px] animate-in fade-in zoom-in duration-1000 delay-500">
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10"></div>
             
             <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden relative">
                <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-zinc-200"></div>
                        <div className="size-3 rounded-full bg-zinc-200"></div>
                        <div className="size-3 rounded-full bg-zinc-200"></div>
                    </div>
                    <div className="mx-auto bg-white border border-zinc-200 rounded-md px-3 py-1 text-xs text-zinc-400 w-64 text-center">
                        gitbrain.ai/dashboard
                    </div>
                </div>

                {/* Video Container */}
                <div className="aspect-video relative bg-zinc-100 w-full overflow-hidden">
                   <video 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                    >
                        <source src="" type="video/mp4" />
                        Your browser does not support the video tag.
                   </video>
                </div>
             </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF --- */}
      <section className="py-10 border-y border-zinc-100 bg-white">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-semibold text-zinc-400 mb-8 uppercase tracking-wider">Trusted by developers at</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                 {/* Icons for logos */}
                 <div className="flex items-center gap-2 font-bold text-xl"><Github className="size-6"/> GitHub</div>
                 <div className="flex items-center gap-2 font-bold text-xl"><Globe className="size-6"/> Vercel</div>
                 <div className="flex items-center gap-2 font-bold text-xl"><Cpu className="size-6"/> Linear</div>
                 <div className="flex items-center gap-2 font-bold text-xl"><Code2 className="size-6"/> Raycast</div>
            </div>
         </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-32 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
                <h2 className="text-3xl font-bold tracking-tight mb-4">From Code to Context</h2>
                <p className="text-zinc-500 text-lg">Three simple steps to supercharge your development workflow.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
                {/* Step 1 */}
                <div className="relative">
                    <div className="absolute -left-4 -top-4 text-9xl font-bold text-zinc-100 -z-10">1</div>
                    <h3 className="text-xl font-bold mb-3">Connect Repo</h3>
                    <p className="text-zinc-600 mb-6">Link your GitHub repository. We automatically fetch the latest commit and index your file structure.</p>
                    <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm h-40 flex items-center justify-center">
                        <Github className="size-10 text-zinc-800" />
                    </div>
                </div>
                {/* Step 2 */}
                <div className="relative">
                    <div className="absolute -left-4 -top-4 text-9xl font-bold text-zinc-100 -z-10">2</div>
                    <h3 className="text-xl font-bold mb-3">Process Context</h3>
                    <p className="text-zinc-600 mb-6">Our AI analyzes your code, commits, and meeting notes to build a semantic vector database.</p>
                    <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm h-40 flex items-center justify-center">
                        <Cpu className="size-10 text-blue-500 animate-pulse" />
                    </div>
                </div>
                {/* Step 3 */}
                <div className="relative">
                    <div className="absolute -left-4 -top-4 text-9xl font-bold text-zinc-100 -z-10">3</div>
                    <h3 className="text-xl font-bold mb-3">Ask & Answer</h3>
                    <p className="text-zinc-600 mb-6">Ask questions in plain English. Get answers with direct links to the relevant lines of code.</p>
                    <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm h-40 flex items-center justify-center">
                        <MessageSquare className="size-10 text-green-500" />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 bg-white">
         <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                    Designed for engineering teams.
                </h2>
                <p className="text-lg text-zinc-500">
                    GitBrain isn't just a chatbot. It's a fully integrated knowledge platform for your technical assets.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors">
                    <div className="size-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
                        <Command className="size-6 text-zinc-900" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Deep Code Analysis</h3>
                    <p className="text-zinc-600 max-w-lg">
                        Our engine understands the dependency graph of your application. When you ask about "Authentication", we check your middleware, your database schema, and your API routes.
                    </p>
                </div>
                {/* Card 2 */}
                <div className="col-span-1 p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors">
                    <div className="size-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
                        <GitBranch className="size-6 text-zinc-900" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Live Sync</h3>
                    <p className="text-zinc-600">
                        Never query stale data. We sync on every `git push`.
                    </p>
                </div>
                {/* Card 3 */}
                <div className="col-span-1 p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors">
                    <div className="size-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
                        <MessageSquare className="size-6 text-zinc-900" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Meeting Notes</h3>
                    <p className="text-zinc-600">
                        Context isn't just code. It's what you said in the standup.
                    </p>
                </div>
                {/* Card 4 */}
                <div className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-zinc-900 text-white">
                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                        <Sparkles className="size-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Pay Per Use</h3>
                    <p className="text-zinc-400 max-w-lg">
                        No monthly subscriptions for stale projects. Buy credits, index your repo, and keep them forever. Only pay when you need more power.
                    </p>
                </div>
            </div>
         </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-32 bg-zinc-50">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Simple, credit-based pricing</h2>
                <p className="text-zinc-500 text-lg">Start for free. Scale when you need to.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Tier */}
                <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm relative">
                    <h3 className="text-xl font-bold text-zinc-900">Hobby</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight">Free</span>
                    </div>
                    <p className="mt-4 text-zinc-500 text-sm">Perfect for trying out GitBrain on a small project.</p>
                    
                    <ul className="mt-8 space-y-4">
                        <li className="flex items-center gap-3 text-sm text-zinc-600">
                            <Check className="size-4 text-zinc-900" /> 1 Repository
                        </li>
                        <li className="flex items-center gap-3 text-sm text-zinc-600">
                            <Check className="size-4 text-zinc-900" /> 50 Indexing Credits
                        </li>
                        <li className="flex items-center gap-3 text-sm text-zinc-600">
                            <Check className="size-4 text-zinc-900" /> Basic Q&A
                        </li>
                    </ul>

                    <Link href="/sign-up">
                        <Button variant="outline" className="w-full mt-8 rounded-full h-12">Get Started</Button>
                    </Link>
                </div>

                {/* Pro Tier */}
                <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl relative text-white">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                    <h3 className="text-xl font-bold">Pro Bundle</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight">₹799</span>
                        <span className="text-zinc-400 text-sm ml-2">/ 100 credits</span>
                    </div>
                    <p className="mt-4 text-zinc-400 text-sm">For serious developers handling multiple repos.</p>
                    
                    <ul className="mt-8 space-y-4">
                        <li className="flex items-center gap-3 text-sm text-zinc-300">
                            <Check className="size-4 text-white" /> Unlimited Repositories
                        </li>
                        <li className="flex items-center gap-3 text-sm text-zinc-300">
                            <Check className="size-4 text-white" /> 100 Credits (Top up anytime)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-zinc-300">
                            <Check className="size-4 text-white" /> Meeting Transcription
                        </li>
                        <li className="flex items-center gap-3 text-sm text-zinc-300">
                            <Check className="size-4 text-white" /> Priority Support
                        </li>
                    </ul>

                    <Link href="/sign-up">
                        <Button className="w-full mt-8 rounded-full h-12 bg-white text-zinc-900 hover:bg-zinc-100">Buy Credits</Button>
                    </Link>
                </div>
            </div>
         </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 bg-white">
         <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">How are credits used?</AccordionTrigger>
                    <AccordionContent className="text-zinc-600">
                        1 Credit = 1 File indexed. If your repository has 100 files, indexing it will cost 100 credits. Re-indexing only charges for changed files.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">Is my code secure?</AccordionTrigger>
                    <AccordionContent className="text-zinc-600">
                        Yes. We don't train our models on your code. Your code is processed in memory to generate vector embeddings and then discarded. The embeddings are stored securely.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">Can I upload meeting recordings?</AccordionTrigger>
                    <AccordionContent className="text-zinc-600">
                        Yes! You can upload .mp4 or .mp3 files. We transcribe them and link the discussion points to your code issues automatically.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
         </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <section className="py-24 bg-zinc-900 text-white text-center px-6">
          <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Ready to ship faster?</h2>
              <p className="text-zinc-400 text-lg mb-10">Join developers who are saving hours every week with GitBrain.</p>
              <Link href="/sign-up">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold">
                      Get Started Now
                  </Button>
              </Link>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-white border-t border-zinc-100 text-center">
         <div className="flex items-center justify-center gap-2 font-bold text-xl mb-4">
            <Bot className="size-6 text-zinc-900" />
            <span>GitBrain</span>
         </div>
         <p className="text-zinc-500 text-sm mb-8">
            © {new Date().getFullYear()} GitBrain Inc. All rights reserved.
         </p>
         <div className="flex justify-center gap-6 text-sm font-medium text-zinc-500">
             <Link href="#" className="hover:text-zinc-900">Privacy Policy</Link>
             <Link href="#" className="hover:text-zinc-900">Terms of Service</Link>
             <Link href="#" className="hover:text-zinc-900">Twitter</Link>
         </div>
      </footer>
    </div>
  )
}