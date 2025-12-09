'use client'
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react'

type Props={
    filesReferences:{fileName:string; sourceCode:string; summary:string}[]
}


const CodeReferences = ({filesReferences}:Props) => {
    const [tab,setTab] = React.useState(filesReferences[0]?.fileName)
    if(filesReferences.length===0) return null

    return (
        <div className='max-w-[70vw]'>
            <Tabs value={tab} onValueChange={setTab}>
                <div className='overflow-scroll flex gap-2 bg-gray-200 p-1 rounded-md'>
                    {filesReferences.map(file=>(
                        <button key={file.fileName} className={cn(
                                
                        )}>

                        </button>
                    ))}
                </div>
            </Tabs>
        </div>
    )
}

export default CodeReferences