'use client'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar' 
import { UserButton } from '@clerk/nextjs'
import { AppSidebar } from './app-sidebar'
import { useEffect, useState } from "react"

type Props = {
    children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    },[])
    if (!mounted) return null

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='w-full m-2'>
                <div className='flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4'>      
                    <SidebarTrigger /> 
                    <div className='ml-auto'></div>
                    <UserButton />
                </div>
                
                <div className='h-4'></div>

                <div className='border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4'>
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}

export default SidebarLayout