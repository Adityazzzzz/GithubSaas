'use client'

// --- ICONS (Adapted for Light Mode - Black/Gray) ---

const NextJsLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 180 180" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_next" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
      <circle cx="90" cy="90" r="90" fill="black"/>
    </mask>
    <g mask="url(#mask0_next)">
      <circle cx="90" cy="90" r="90" fill="black"/> {/* Black Background */}
      <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="white"/>
      <path d="M115 54H127V125.97H115V54Z" fill="white"/>
    </g>
  </svg>
)

const ClerkLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.12136 2.08323C4.54226 0.900995 6.3376 0.201633 8.1691 0.165037C9.99613 0.128532 11.7891 0.771618 13.2662 1.83852C14.7433 2.90543 15.826 4.33924 16.294 5.91898L13.5358 6.73977C13.2201 5.67389 12.4891 4.70617 11.4921 3.98601C10.4951 3.26584 9.28481 2.83176 8.05157 2.8564C6.81525 2.8811 5.60339 3.35342 4.64428 4.15143C3.68518 4.94943 3.03058 6.0232 2.78442 7.2096C2.53826 8.396 2.71353 9.63216 3.28258 10.7291C3.85163 11.8261 4.78363 12.7241 5.93922 13.2882C7.09481 13.8523 8.4116 14.0522 9.69176 13.8576C10.9719 13.6631 12.1465 13.0844 13.0396 12.2073C13.2658 11.9851 13.5726 11.8603 13.8926 11.8603H16V13.8603C14.6766 15.1596 12.9363 16.0171 11.0395 16.3054C9.14275 16.5937 7.19176 16.2974 5.47963 15.9964C3.7675 15.6953 2.22272 14.9397 0.992683 13.7915C-0.237357 12.6433 -1.04169 11.1396 -1.27211 9.47918C-1.50254 7.81878 -1.14446 6.13689 -0.228172 4.75704C0.688114 3.37719 1.95671 2.37035 3.42436 1.83852L3.12136 2.08323ZM13.8926 9.86034C13.8926 10.4126 13.4449 10.8603 12.8926 10.8603H10.8926C10.3403 10.8603 9.89258 10.4126 9.89258 9.86034C9.89258 9.30805 10.3403 8.86034 10.8926 8.86034H12.8926C13.4449 8.86034 13.8926 9.30805 13.8926 9.86034Z" fill="currentColor"/>
  </svg>
)

const AssemblyAILogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6601 2.92592C11.8122 2.65176 12.2081 2.65176 12.3601 2.92592L22.2541 20.7628C22.4023 21.0301 22.2091 21.36 21.9042 21.36H16.8778C16.634 21.36 16.4098 21.2332 16.284 21.0238L12.0101 13.9114L7.73623 21.0238C7.61042 21.2332 7.38618 21.36 7.14238 21.36H2.11604C1.81116 21.36 1.61793 21.0301 1.76615 20.7628L11.6601 2.92592Z" fill="currentColor"/>
  </svg>
)

const PrismaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M2.36622 19.462L11.9995 2L21.6328 19.462L11.9995 24L2.36622 19.462Z" fill="currentColor"/>
    <path d="M5.42 18.59L12 4.14L18.58 18.59L12 21.58L5.42 18.59Z" fill="black" fillOpacity="0.2"/>
  </svg>
)

const ShadcnLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 256 256" className={className} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round">
    <line x1="208" y1="128" x2="128" y2="208" />
    <line x1="192" y1="40" x2="40" y2="192" />
  </svg>
)

// --- COMPONENT ---

export function TechStackStrip() {
  return (
    <section className="w-full bg-white py-10 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
            
            <p className="text-center text-xs font-semibold text-neutral-400 mb-8 uppercase tracking-[0.2em]">
                Powered by the modern stack
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 hover:opacity-100 transition-opacity duration-500">
                
                {/* 1. NEXT.JS */}
                <div className="flex items-center gap-3 cursor-default group">
                    <NextJsLogo className="h-8 w-8 text-black" />
                    <span className="text-lg font-bold text-neutral-600 group-hover:text-black transition-colors">Next.js</span>
                </div>

                {/* 2. CLERK */}
                <div className="flex items-center gap-3 cursor-default group">
                    <ClerkLogo className="h-6 w-6 text-neutral-600 group-hover:text-[#6C47FF] transition-colors" />
                    <span className="text-lg font-bold text-neutral-600 group-hover:text-black transition-colors">Clerk</span>
                </div>

                {/* 3. ASSEMBLY AI */}
                <div className="flex items-center gap-3 cursor-default group">
                    <AssemblyAILogo className="h-6 w-6 text-neutral-600 group-hover:text-[#1849D6] transition-colors" />
                    <span className="text-lg font-bold text-neutral-600 group-hover:text-black transition-colors">AssemblyAI</span>
                </div>

                {/* 4. PRISMA */}
                <div className="flex items-center gap-3 cursor-default group">
                    <PrismaLogo className="h-8 w-8 text-neutral-800" />
                    <span className="text-lg font-bold text-neutral-600 group-hover:text-black transition-colors">Prisma</span>
                </div>

                {/* 5. SHADCN */}
                <div className="flex items-center gap-3 cursor-default group">
                    <ShadcnLogo className="h-6 w-6 text-neutral-800" />
                    <span className="text-lg font-bold text-neutral-600 group-hover:text-black transition-colors">shadcn/ui</span>
                </div>

            </div>
        </div>
    </section>
  )
}