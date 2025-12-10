'use client'

import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism'
import React from 'react'
import { Tabs, TabsContent } from '@/components/ui/tabs';

type Props = {
    filesReferences: { fileName: string; sourceCode: string; summary: string }[]
}

const CodeReferences = ({ filesReferences }: Props) => {
    const [tab, setTab] = React.useState(filesReferences[0]?.fileName)
    
    if (filesReferences.length === 0) return null

    return (
        <div className='max-w-[76vw]'>
            <Tabs value={tab} onValueChange={setTab}>
                <div className='overflow-x-auto flex gap-2 bg-gray-200 p-1 rounded-t-md border-b border-gray-300'>
                    {filesReferences.map(file => (
                        <button 
                            onClick={() => setTab(file.fileName)} 
                            key={file.fileName} 
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted',
                                {
                                    'bg-primary text-primary-foreground': tab === file.fileName,
                                    'text-gray-600 hover:bg-gray-300': tab !== file.fileName
                                }
                            )}
                        >
                            {file.fileName}
                        </button>
                    ))}
                </div>

                {filesReferences.map(file => (
                    <TabsContent 
                        key={file.fileName} 
                        value={file.fileName} 
                        className='max-h-[40vw] overflow-scroll max-w-[76vw] rounded-b-md' 
                    >
                        <SyntaxHighlighter 
                            language='typescript' 
                            style={lucario}
                            showLineNumbers={true} // Makes it look like an editor
                        >
                            {file.sourceCode} 
                        </SyntaxHighlighter>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default CodeReferences