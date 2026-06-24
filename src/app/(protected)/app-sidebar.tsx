'use client'
import { GitBrainLogo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import useProject from "@/hooks/use-project"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus,ChevronsUpDown, Presentation, Archive, Search, FolderTree, BarChart3, GitCommit, GitPullRequest, Shield, BookOpen, Kanban, ChevronDown, Sparkles, CalendarDays, Users, CloudLightning } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

const pmItems = [
  {
    title: "Kanban Board",
    tab: "board",
    icon: Kanban,
  },
  {
    title: "Calendar",
    tab: "calendar",
    icon: CalendarDays,
  },
  {
    title: "Sub-Teams",
    tab: "teams",
    icon: Users,
  },
  {
    title: "Automations",
    tab: "automations",
    icon: CloudLightning,
  },
  {
    title: "Analytics",
    tab: "analytics",
    icon: BarChart3,
  },
]

export function AppSidebar(){
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const {open} = useSidebar()
    const {projects,project,projectId,setProjectId} = useProject()
    const [searchTerm, setSearchTerm] = useState('')
    const projectSlug = project?.name ? encodeURIComponent(project.name) : projectId

    const isPmStudio = pathname.includes('/pmstudio')

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

               {/* Advanced Studio Switcher Dropdown (ElevenLabs Style) */}
<div className="px-2 mt-4 mb-2 select-none">
  {open ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between items-center px-2.5 h-10 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-[10px] shadow-sm transition-all duration-200 group bg-transparent"
        >
          <div className="flex items-center gap-2.5 text-left">
            {/* Dynamic Orb Icon Box for Trigger (Slimmer) */}
            <div className="size-6 rounded-md border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
              <div className={cn(
                "size-3 rounded-full shadow-[inset_0_-1.5px_3px_rgba(0,0,0,0.2)]",
                isPmStudio 
                  ? "bg-gradient-to-br from-emerald-300 via-teal-500 to-emerald-700" 
                  : "bg-gradient-to-br from-blue-300 via-indigo-500 to-purple-600"
              )} />
            </div>
            
            {/* Single line text for a slim button */}
            <span className="text-[13px] font-medium text-foreground tracking-tight">
              {isPmStudio ? "GitBrain PM Studio" : "GitBrain AI Studio"}
            </span>
          </div>
          <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[280px] rounded-xl p-1.5 shadow-xl border-zinc-200 dark:border-zinc-800 bg-background" align="start">
        <DropdownMenuItem 
          onClick={() => { if (isPmStudio) router.push(`/${projectSlug}/dashboard`) }}
          className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors focus:bg-zinc-50 dark:focus:bg-zinc-800/80"
        >
          {/* AI Studio Orb */}
          <div className="size-8 rounded-[8px] border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <div className="size-3.5 rounded-full bg-gradient-to-br from-blue-300 via-indigo-500 to-purple-600 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" />
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <span className="text-[13px] font-medium text-foreground">GitBrain AI Studio</span>
            <span className="text-[12px] text-muted-foreground leading-tight">Codebase Chat, Q&A, meetings</span>
          </div>
        </DropdownMenuItem>
        
        {/* Subtle Divider */}
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 -mx-1.5" />
        
        <DropdownMenuItem 
          onClick={() => { if (!isPmStudio) router.push(`/${projectSlug}/pmstudio?tab=board`) }}
          className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors focus:bg-zinc-50 dark:focus:bg-zinc-800/80"
        >
          {/* PM Studio Orb */}
          <div className="size-8 rounded-[8px] border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <div className="size-3.5 rounded-full bg-gradient-to-br from-emerald-300 via-teal-500 to-emerald-700 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" />
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <span className="text-[13px] font-medium text-foreground">GitBrain PM Studio</span>
            <span className="text-[12px] text-muted-foreground leading-tight">Kanban board, calendar, teams</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="size-10 rounded-xl p-0 flex items-center justify-center mx-auto my-2 shrink-0 border-zinc-200 dark:border-zinc-800 shadow-sm bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all duration-200 group"
        >
          <div className="size-6 rounded-[8px] border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-sm">
             <div className={cn(
                "size-2.5 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]",
                isPmStudio 
                  ? "bg-gradient-to-br from-emerald-300 via-teal-500 to-emerald-700" 
                  : "bg-gradient-to-br from-blue-300 via-indigo-500 to-purple-600"
              )} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[280px] rounded-xl p-1.5 shadow-xl border-zinc-200 dark:border-zinc-800 bg-background" align="start" side="right">
        {/* Same inner dropdown content for the closed state */}
        <DropdownMenuItem 
          onClick={() => { if (isPmStudio) router.push(`/${projectSlug}/dashboard`) }}
          className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors focus:bg-zinc-50 dark:focus:bg-zinc-800/80"
        >
          <div className="size-8 rounded-[8px] border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <div className="size-3.5 rounded-full bg-gradient-to-br from-blue-300 via-indigo-500 to-purple-600 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" />
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <span className="text-[13px] font-medium text-foreground">GitBrain AI Studio</span>
            <span className="text-[12px] text-muted-foreground leading-tight">Codebase Chat, Q&A, meetings</span>
          </div>
        </DropdownMenuItem>
        
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 -mx-1.5" />
        
        <DropdownMenuItem 
          onClick={() => { if (!isPmStudio) router.push(`/${projectSlug}/pmstudio?tab=board`) }}
          className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors focus:bg-zinc-50 dark:focus:bg-zinc-800/80"
        >
          <div className="size-8 rounded-[8px] border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <div className="size-3.5 rounded-full bg-gradient-to-br from-emerald-300 via-teal-500 to-emerald-700 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" />
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <span className="text-[13px] font-medium text-foreground">GitBrain PM Studio</span>
            <span className="text-[12px] text-muted-foreground leading-tight">Kanban board, calendar, teams</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )}
</div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        {isPmStudio ? "PM Studio Menu" : "AI Studio Menu"}
                    </SidebarGroupLabel>
                    
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isPmStudio ? (
                              pmItems.map(i => {
                                const href = `/${projectSlug}/pmstudio?tab=${i.tab}`
                                const currentTab = searchParams.get('tab') || 'board'
                                const isActive = currentTab === i.tab
                                return (
                                  <SidebarMenuItem key={i.title}>
                                    <SidebarMenuButton asChild>
                                      <Link href={href} className={cn({'bg-primary! text-white!': isActive}, 'list-none')}>
                                        <i.icon />
                                        <span>{i.title}</span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                )
                              })
                            ) : (
                              items.map(i => {
                                const href = i.title === "PM Studio" ? `/${projectSlug}/pmstudio?tab=board` : `/${projectSlug}${i.url}`
                                const isActive = pathname === href || (i.title === "PM Studio" && pathname.includes('/pmstudio'))
                                return (
                                  <SidebarMenuItem key={i.title}>
                                    <SidebarMenuButton asChild>
                                      <Link href={href} className={cn({'bg-primary! text-white!': isActive}, 'list-none')}>
                                        <i.icon />
                                        <span>{i.title}</span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                )
                              })
                            )}
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
                                                onClick={() => {
                                                  setProjectId(project.id)
                                                  const cleanOldSlug = pathname.split('/')[1]
                                                  const isProjectRoute = projects?.some(p => encodeURIComponent(p.name) === cleanOldSlug || p.id === cleanOldSlug)
                                                  const newSlug = encodeURIComponent(project.name)
                                                  if (isProjectRoute && cleanOldSlug) {
                                                    const newPath = pathname.replace(`/${cleanOldSlug}`, `/${newSlug}`)
                                                    router.push(newPath)
                                                  } else {
                                                    router.push(`/${newSlug}/dashboard`)
                                                  }
                                                }} 
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