'use client'
import { Button } from "@/components/ui/button"
import { GithubGlobe } from "@/components/ui/github-globe"
import { Plus } from "lucide-react"

export const NoProjectPlaceholder = () => {
    return (
        <div className="flex flex-col h-full w-full items-center justify-center bg-neutral-950 p-4 md:p-10 relative overflow-hidden rounded-xl border border-neutral-800">
            
            {/* TEXT SECTION */}
            <div className="text-center z-10 space-y-4 max-w-2xl mt-10">
                <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-neutral-200 to-neutral-600">
                    GitBrain
                </h2>
                <p className="text-neutral-400 text-lg md:text-xl max-w-lg mx-auto">
                    Visualize your repository. Select a project to ignite the neural network.
                </p>
                
                <div className="flex justify-center pt-4">
                    <Button 
                        size="lg"
                        className="bg-white text-black hover:bg-neutral-200 font-semibold px-8 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                        onClick={() => document.getElementById('create-project-trigger')?.click()}
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Create Project
                    </Button>
                </div>
            </div>

            {/* THE GLOBE - Positioned slightly lower to look majestic */}
            <div className="relative w-full max-w-[800px] aspect-square mt-[-100px] md:mt-[-150px] opacity-90 z-0">
                <GithubGlobe />
            </div>

            {/* Grid Overlay for Texture */}
            <div className="absolute inset-0 z-[-1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        </div>
    )
}