'use client'

import Link from 'next/link'
import { Terminal, Mail, MapPin } from 'lucide-react'
import { GitBrainLogo } from '../logo'

export function SiteFooter() {
  return (
    <footer className="w-full bg-[#FAFAFA] border-t border-neutral-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* COLUMN 1: Brand & Mission */}
            <div className="col-span-1 md:col-span-2">
                <GitBrainLogo/>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                    The neural architecture for your codebase. Index, query, and understand your software architecture with zero configuration.
                </p>
            </div>

            {/* COLUMN 2: Legal (Required for Approval) */}
            <div>
                <h4 className="font-bold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Legal</h4>
                <ul className="space-y-3 text-sm text-neutral-500 font-medium">
                    <li>
                        <Link href="/privacy" className="hover:text-neutral-900 transition-colors">
                            Privacy Policy
                        </Link>
                    </li>
                    <li>
                        <Link href="/terms" className="hover:text-neutral-900 transition-colors">
                            Terms & Conditions
                        </Link>
                    </li>
                    <li>
                        <Link href="/refund" className="hover:text-neutral-900 transition-colors">
                            Refund & Cancellation
                        </Link>
                    </li>
                </ul>
            </div>

            {/* COLUMN 3: Contact (Required for Approval) */}
            <div>
                <h4 className="font-bold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
                <ul className="space-y-3 text-sm text-neutral-500 font-medium">
                    <li>
                        <a href="mailto:adityasinghrajawat2004@gmail.com" className="hover:text-neutral-900 transition-colors flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            adityasinghrajawat2004@gmail.com
                        </a>
                    </li>
                    <li>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="leading-relaxed">
                                Aditya Puram, Gwalior, MP, 474020
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-neutral-400">
                © {new Date().getFullYear()} GitBrain Intelligence. All rights reserved.
            </p>
            <div className="flex gap-6">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    All Systems Operational
                </div>
            </div>
        </div>
      </div>
    </footer>
  )
}