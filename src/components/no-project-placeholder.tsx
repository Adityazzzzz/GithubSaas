'use client'
import { Button } from "@/components/ui/button"
import { BackgroundBeams } from "@/components/background-beams"
import { Plus, Bot } from "lucide-react"

export const NoProjectPlaceholder = () => {
    return (
        <div className="h-[calc(100vh-6rem)] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased overflow-hidden border border-neutral-800">
            <div className="max-w-2xl mx-auto p-4 relative z-10 text-center">
                
                {/* 1. Icon / Logo Animation */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 ring-1 ring-white/10">
                    <Bot className="h-10 w-10 text-neutral-400 animate-pulse" />
                </div>

                {/* 2. Text Content */}
                <h1 className="relative z-10 text-lg md:text-5xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
                    GitBrain is Idle
                </h1>
                <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
                    The neural network is waiting for input. Select a repository to activate the AI, analyze commits, and start asking questions.
                </p>

                {/* 3. Action Buttons */}
                <div className="mt-8 flex justify-center gap-4 relative z-10">
                    {/* Assuming you have a way to trigger the create project modal here, 
                        or just link to it */}
                    <Button 
                        size="lg" 
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                        // Add your onClick handler to open the modal
                        onClick={() => document.getElementById('create-project-trigger')?.click()}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Project
                    </Button>
                </div>
            </div>

            {/* 4. The Background Effect */}
            <BackgroundBeams />
        </div>
    )
}