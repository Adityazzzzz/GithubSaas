'use client'
import React from 'react'

export const GitBrainLogo = () => {
    return (
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            
            {/* THE ICON: The 'Void G' (Solid Geometric Form) */}
            <svg 
                className="w-8 h-8 text-neutral-900 dark:text-white shrink-0" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* The main heavy bracket */}
                <path 
                    d="M21 4H3V20H13V14H21V4Z" 
                    fill="currentColor"
                />
                
                {/* The 'Key/Spark' in blue */}
                <path 
                    d="M21 20V16H15V20H21Z" 
                    className="fill-blue-600 dark:fill-blue-500"
                />
            </svg>
            
            {/* TEXT: Hidden when Sidebar is collapsed */}
            <div className="flex items-center gap-1 text-xl tracking-tighter transition-all group-data-[collapsible=icon]:hidden">
                <span className="font-bold text-neutral-900 dark:text-white">
                    Git
                </span>
                <span className="font-medium text-neutral-500 dark:text-neutral-400">
                    Brain
                </span>
            </div>
        </div>
    )
}