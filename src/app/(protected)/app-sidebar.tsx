'use client'
import { GitBrainLogo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import useProject from "@/hooks/use-project"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation, Archive, Search, FolderTree, BarChart3, GitCommit, GitPullRequest, Shield, BookOpen, Kanban } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Q&A",
        url: "/qa",
        icon: Bot,
    },
    {
        title: "Meetings",
        url: "/meetings",
        icon: Presentation,
    },
    {
        title: "Files",
        url: "/files",
        icon: FolderTree,
    },
    {
        title: "Semantic Search",
        url: "/search",
        icon: Search,
    },
    {
        title: "Insights",
        url: "/insights",
        icon: BarChart3,
    },
    {
        title: "Changelog",
        url: "/changelog",
        icon: GitCommit,
    },
    {
        title: "Pull Requests",
        url: "/pull-requests",
        icon: GitPullRequest,
    },
    {
        title: "Security",
        url: "/security",
        icon: Shield,
    },
    {
        title: "Auto Docs",
        url: "/docs",
        icon: BookOpen,
    },
    {
        title: "PM Studio",
        url: "/pm-studio",
        icon: Kanban,
    },
    {
        title: "Billing",
        url: "/billing",
        icon: CreditCard,
    },
]

const options=[
    {
        title: "Archived Projects",
        url: "/archivedprojects",
        icon:Archive,
    },
]

export function AppSidebar(){
    const pathname = usePathname()
    const {open} = useSidebar()
    const {projects,projectId,setProjectId} = useProject()
    const [searchTerm, setSearchTerm] = useState('')

    const filteredProjects = projects?.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <GitBrainLogo />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(i=>{
                                return (
                                    <SidebarMenuItem key={i.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={i.url} className={cn({'bg-primary! text-white!':pathname === i.url},'list-none')}>
                                                <i.icon/>
                                                <span>{i.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {open && (
                                <div className="px-2 mb-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search projects..." 
                                            className="pl-8 h-9 bg-background/50"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {filteredProjects?.map(project => {
                                return (
                                    <SidebarMenuItem key={project.name}>
                                        <SidebarMenuButton asChild>
                                            <div 
                                                onClick={() => setProjectId(project.id)} 
                                                className="cursor-pointer flex items-center gap-2"
                                            >
                                                <div className={cn(
                                                    'flex size-6 items-center justify-center rounded-sm border text-sm font-bold shrink-0',
                                                    'bg-white text-primary',
                                                    { 'bg-primary text-white': project.id === projectId }
                                                )}>
                                                    {project.name[0]}
                                                </div>
                                                
                                                {open && (
                                                    <span className="truncate">{project.name}</span>
                                                )}
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}

                            {open && filteredProjects?.length === 0 && (
                                <div className="text-xs text-muted-foreground text-center py-4">
                                    No projects found
                                </div>
                            )}
                            
                            <div className="h-2"></div>
                            <SidebarMenuItem>
                                <Link href='/create'>
                                    <Button 
                                        size='sm' 
                                        variant={'outline'} 
                                        className={cn(
                                            "w-fit border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground mb-2 flex items-center",
                                            !open ? "h-9 w-9 p-0 justify-center ml-1" : "gap-2" 
                                        )}
                                    >
                                        <Plus className="size-4" />
                                        {open && <span>Create Project</span>}
                                    </Button>
                                </Link>
                            </SidebarMenuItem>

                            {open && (
                                <SidebarMenuItem>
                                    <Link href='/reflect'> 
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mt-2 pl-2 cursor-pointer transition-colors">
                                            <Archive className="size-3" />
                                            <span>Archived Projects</span>
                                        </div>
                                    </Link>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}