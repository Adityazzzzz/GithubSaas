'use client'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useProject from "@/hooks/use-project" // Assuming you have this hook
import { api } from "@/trpc/react" // Your tRPC instance

export const GlobalSearch = () => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const { projectId, setProjectId } = useProject() // From your sidebar logic
    
    // 1. Fetch data to search (Projects, maybe recent files?)
    // This assumes you have a trpc router to get all projects
    const { data: projects } = api.project.getProjects.useQuery() 

    // 2. Toggle with Keyboard Shortcut (Ctrl + K or Cmd + K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div className="w-full max-w-sm ml-4">
            {/* The "Fake" Input Bar in the Header */}
            <button
                onClick={() => setOpen(true)}
                className="relative w-full flex items-center border rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 transition-colors"
            >
                <Search className="h-4 w-4 mr-2" />
                <span className="flex-1 text-left">Search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {/* The Actual Search Dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search projects, files, or commands..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    
                    {/* GROUP 1: PROJECTS */}
                    <CommandGroup heading="Projects">
                        {projects?.map((project) => (
                            <CommandItem
                                key={project.id}
                                value={project.name} // This is what is searched
                                onSelect={() => {
                                    setProjectId(project.id)
                                    router.push(`/dashboard`) // Navigate to dashboard
                                    setOpen(false)
                                }}
                            >
                                <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border bg-primary/10">
                                    <span className="text-xs">{project.name[0]}</span>
                                </div>
                                {project.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    {/* GROUP 2: ACTIONS (Optional) */}
                    <CommandGroup heading="Actions">
                         <CommandItem onSelect={() => { router.push('/create'); setOpen(false) }}>
                            <span>+ Create New Project</span>
                        </CommandItem>
                    </CommandGroup>

                </CommandList>
            </CommandDialog>
        </div>
    )
}