'use client'
import { DistortionHero } from "@/components/landing/distortion-hero"
import { ArchitectureGrid } from "@/components/landing/architecture-grid"
import { CTAFooter } from "@/components/landing/cta-footer"
import { GitBrainLogo } from "@/components/logo"
import Link from "next/link"
export default function LandingPage() {
  return (
    <div className="bg-neutral-950 min-h-screen selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* 1. Global Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center p-6 mix-blend-difference text-white pointer-events-none">
         <div className="pointer-events-auto">
            <GitBrainLogo />
         </div>
         <div className="pointer-events-auto flex gap-6 text-xs font-mono">
            <Link href="#features" className="hover:underline">MODULES</Link>
            <Link href="#workflow" className="hover:underline">WORKFLOW</Link> {/* Added Link */}
            <Link href="/dashboard" className="hover:underline">[ LOGIN ]</Link>
         </div>
      </nav>

      {/* 2. Hero Section */}
      <DistortionHero />

      {/* 3. Features Blueprint */}
      <div id="features">
        <ArchitectureGrid />
      </div>
      {/* 6. Giant CTA Footer */}
      <CTAFooter />
      
    </div>
  )
}