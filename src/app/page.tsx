'use client'
import { DistortionHero } from "@/components/landing/distortion-hero"
import { CombinedFooter } from "@/components/landing/cta-footer"
import { GitBrainLogo } from "@/components/logo"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="bg-neutral-950 min-h-screen selection:bg-white selection:text-black overflow-x-hidden">

      <nav className="fixed top-0 w-full z-50 flex justify-between items-center p-6 mix-blend-difference text-white pointer-events-none">
        <div className="pointer-events-auto">
          <GitBrainLogo />
        </div>
        <div className="pointer-events-auto flex gap-6 text-xs font-mono">

          <Link href="/dashboard" className="hover:underline">[ LOGIN ]</Link>
        </div>
      </nav>
      <DistortionHero />
      <CombinedFooter />

    </div>
  )
}