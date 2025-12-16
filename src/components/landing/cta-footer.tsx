'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Oswald } from 'next/font/google'

const oswald = Oswald({ subsets: ['latin'], weight: ['700'] })

export const CTAFooter = () => {
    return (
        <section className="w-full bg-white text-black py-32 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center relative z-10">
                <p className="font-mono text-sm mb-6 tracking-widest text-neutral-500">
                    // READY_FOR_DEPLOYMENT
                </p>
                
                <h2 className={`${oswald.className} text-[12vw] leading-[0.8] tracking-tighter uppercase mb-10`}>
                    Ignite Repo
                </h2>

                <Link href="/dashboard">
                    <button className="group relative px-12 py-6 bg-black text-white text-xl font-mono uppercase tracking-widest overflow-hidden hover:scale-105 transition-transform duration-300">
                        <span className="relative z-10 flex items-center gap-4">
                            Initialize Sequence <ArrowUpRight />
                        </span>
                        {/* Hover Fill Effect */}
                        <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
                    </button>
                </Link>
            </div>

            {/* Warning Stripes at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,black,black_10px,transparent_10px,transparent_20px)] opacity-20" />
        </section>
    )
}