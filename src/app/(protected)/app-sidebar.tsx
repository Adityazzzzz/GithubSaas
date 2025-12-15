'use client'
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import useProject from "@/hooks/use-project"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation,Archive } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                Logo
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
                                            <Link href={i.url} className={cn({'!bg-primary !text-white':pathname === i.url},'list-none')}>
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
            {projects?.map(project => {
                return (
                    <SidebarMenuItem key={project.name}>
                        <SidebarMenuButton asChild>
                            <div 
                                onClick={() => setProjectId(project.id)} 
                                className="cursor-pointer flex items-center gap-2"
                            >
                                {/* THE LETTER BOX ICON */}
                                <div className={cn(
                                    'flex size-6 items-center justify-center rounded-sm border text-sm font-bold shrink-0', // added shrink-0
                                    'bg-white text-primary',
                                    { 'bg-primary text-white': project.id === projectId }
                                )}>
                                    {project.name[0]}
                                </div>

                                {/* THE PROJECT NAME (Hidden when closed) */}
                                {open && (
                                    <span className="truncate">{project.name}</span>
                                )}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )
            })}

            <div className="h-2"></div>

            {/* THE CREATE PROJECT BUTTON */}
            {/* Show this item regardless of open state, but change its look */}
            <SidebarMenuItem>
                <Link href='/create'>
                    <Button 
                        size='sm' 
                        variant={'outline'} 
                        className={cn(
                            "w-fit border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground mb-2 flex items-center",
                            !open ? "h-9 w-9 p-0 justify-center ml-1" : "gap-2" // Square shape when closed
                        )}
                    >
                        <Plus className="size-4" />
                        
                        {/* Only show text when fully open */}
                        {open && <span>Create Project</span>}
                    </Button>
                </Link>
            </SidebarMenuItem>
            
        </SidebarMenu>
    </SidebarGroupContent>
</SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}