'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React, { useState } from 'react'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MDEditor from '@uiw/react-md-editor'
import { toast } from 'sonner'
import {
    FileText, BookOpen, Map, Rocket,
    Download, Loader2, Copy, Check, RefreshCw
} from 'lucide-react'

const DOC_TYPES = [
    {
        id: 'readme' as const,
        title: 'README.md',
        description: 'Professional README with project overview, tech stack, setup instructions, and contribution guidelines.',
        icon: FileText,
        badge: 'Essential',
    },
    {
        id: 'architecture' as const,
        title: 'Architecture Overview',
        description: 'System architecture, component breakdown, data flow, design patterns, and directory structure.',
        icon: Map,
        badge: 'Technical',
    },
    {
        id: 'getting-started' as const,
        title: 'Getting Started Guide',
        description: 'Step-by-step onboarding for new developers — prerequisites, setup, key files, and workflows.',
        icon: Rocket,
        badge: 'Onboarding',
    },
]

type DocType = 'readme' | 'architecture' | 'getting-started'

const DocsPage = () => {
    const { project, projectId } = useProject()
    const [activeDoc, setActiveDoc] = useState<DocType | null>(null)
    const [generatedDocs, setGeneratedDocs] = useState<Record<string, string>>({})
    const [copied, setCopied] = useState(false)

    const generateMutation = api.project.generateDocumentation.useMutation()

    if (!project) return <NoProjectPlaceholder />

    const handleGenerate = async (type: DocType) => {
        setActiveDoc(type)
        try {
            const result = await generateMutation.mutateAsync({
                projectId,
                type,
            })
            setGeneratedDocs(prev => ({ ...prev, [type]: result.content }))
        } catch (err) {
            console.error(err)
            toast.error('Failed to generate documentation')
        }
    }

    const handleExport = (type: DocType) => {
        const content = generatedDocs[type]
        if (!content) return

        const fileNames: Record<DocType, string> = {
            readme: `README-${project.name.toLowerCase().replace(/\s+/g, '-')}.md`,
            architecture: `architecture-${project.name.toLowerCase().replace(/\s+/g, '-')}.md`,
            'getting-started': `getting-started-${project.name.toLowerCase().replace(/\s+/g, '-')}.md`,
        }

        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileNames[type]
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Document exported!')
    }

    const handleCopy = (type: DocType) => {
        const content = generatedDocs[type]
        if (!content) return
        navigator.clipboard.writeText(content)
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const currentContent = activeDoc ? generatedDocs[activeDoc] : null
    const isGenerating = generateMutation.isPending

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                        <BookOpen className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Auto Documentation</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            AI-generated documentation from your indexed codebase
                        </p>
                    </div>
                </div>
            </div>

            {/* Doc Type Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DOC_TYPES.map((docType) => {
                    const isActive = activeDoc === docType.id
                    const hasContent = !!generatedDocs[docType.id]
                    const isCurrentlyGenerating = isGenerating && activeDoc === docType.id

                    return (
                        <Card
                            key={docType.id}
                            className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/20 ${
                                isActive ? 'ring-2 ring-primary/50 border-primary/30' : ''
                            }`}
                            onClick={() => {
                                if (!isCurrentlyGenerating) {
                                    if (hasContent) {
                                        setActiveDoc(docType.id)
                                    } else {
                                        handleGenerate(docType.id)
                                    }
                                }
                            }}
                        >
                            <CardContent className="pt-5 pb-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <docType.icon className="size-5 text-foreground" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {hasContent && (
                                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                Generated
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="text-[10px]">
                                            {docType.badge}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-sm">{docType.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                                        {docType.description}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant={hasContent ? 'outline' : 'default'}
                                    className="w-full text-xs"
                                    disabled={isCurrentlyGenerating}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleGenerate(docType.id)
                                    }}
                                >
                                    {isCurrentlyGenerating ? (
                                        <>
                                            <Loader2 className="size-3 animate-spin mr-1.5" />
                                            Generating...
                                        </>
                                    ) : hasContent ? (
                                        <>
                                            <RefreshCw className="size-3 mr-1.5" />
                                            Regenerate
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="size-3 mr-1.5" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Generated Content Display */}
            {activeDoc && (
                <Card className="shadow-sm">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                <FileText className="size-4.5 text-primary" />
                                {DOC_TYPES.find(d => d.id === activeDoc)?.title}
                            </CardTitle>
                            {currentContent && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs h-8"
                                        onClick={() => handleCopy(activeDoc)}
                                    >
                                        {copied ? (
                                            <Check className="size-3.5 mr-1.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="size-3.5 mr-1.5" />
                                        )}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-8"
                                        onClick={() => handleExport(activeDoc)}
                                    >
                                        <Download className="size-3.5 mr-1.5" />
                                        Export .md
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-3">
                                <Loader2 className="size-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">
                                    Analyzing codebase and generating documentation...
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    This may take 15-30 seconds
                                </p>
                            </div>
                        ) : currentContent ? (
                            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed" data-color-mode="light">
                                <MDEditor.Markdown source={currentContent} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="bg-muted p-4 rounded-full mb-4">
                                    <BookOpen className="size-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-lg text-foreground">Ready to Generate</h3>
                                <p className="text-muted-foreground text-sm mt-1 max-w-sm text-center">
                                    Click "Generate" on one of the document types above to create AI-powered documentation.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* No Doc Selected */}
            {!activeDoc && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <BookOpen className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg text-foreground">Select a Document Type</h3>
                        <p className="text-muted-foreground text-sm mt-1 max-w-sm text-center">
                            Choose one of the document types above to generate AI-powered documentation from your indexed codebase.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default DocsPage
