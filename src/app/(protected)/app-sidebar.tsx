'use client'
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import useProject from "@/hooks/use-project"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"
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
                            {projects?.map(i=>{
                                return (
                                    <SidebarMenuItem key={i.name}>
                                        <SidebarMenuButton asChild>
                                            <div onClick={()=>{
                                                setProjectId(i.id)
                                            }}>
                                                <div className={cn('rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',{'bg-primary text-white': i.id===projectId})}>
                                                    {i.name[0]}
                                                </div>
                                                <span>{i.name}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            
                            <div className="h-2"></div>
                            {open && (
                                <SidebarMenuItem>
                                    <Link href='/create'>
                                        <Button size='sm' variant={'outline'} className="w-fit"><Plus/>Create Project</Button>
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