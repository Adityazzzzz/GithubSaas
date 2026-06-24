'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React, { useState } from 'react'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import { Search, Loader2, FileText, ChevronDown, ChevronUp, FileCode, FileJson, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism'

const SUGGESTIONS = [
    { label: 'Auth middleware', query: 'verifyProjectMembership helper or auth checks' },
    { label: 'Razorpay payment', query: 'payments router Razorpay' },
    { label: 'Gemini re-indexing', query: 'indexGithubRepo function with retry and batch' },
    { label: 'Prisma models', query: 'schema.prisma models like ChatSession or Project' },
]

const CODE_EXTENSIONS = new Set(['ts', 'tsx', 'js', 'jsx', 'py', 'rb', 'go', 'rs', 'java', 'kt', 'swift', 'c', 'cpp', 'h', 'cs', 'sh', 'bash', 'sql'])
const JSON_EXTENSIONS = new Set(['json', 'yaml', 'yml', 'toml', 'xml'])

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
    if (CODE_EXTENSIONS.has(ext)) return FileCode
    if (JSON_EXTENSIONS.has(ext)) return FileJson
    return FileText
}

const getFileExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return ext ? `.${ext}` : ''
}

const getSimilarityColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (percentage >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    return 'bg-muted text-muted-foreground border-border'
}

const SemanticSearchPage = () => {
    const { projectId, project } = useProject()
    const { data: projects } = api.project.getProjects.useQuery()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Array<{
        id: string
        fileName: string
        summary: string
        sourceCode: string
        similarity: number
    }>>([])
    const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({})

    const isProjectActive = projects?.find(p => p.id === projectId)
    const searchMutation = api.project.semanticSearch.useMutation()

    if (!projectId || (projects && !isProjectActive)) {
        return <NoProjectPlaceholder />
    }

    const runSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return
        
        try {
            const res = await searchMutation.mutateAsync({
                projectId,
                query: searchQuery,
            })
            setResults(res)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        runSearch(query)
    }

    const handleSuggestionClick = (suggestionQuery: string) => {
        setQuery(suggestionQuery)
        runSearch(suggestionQuery)
    }

    const toggleExpand = (id: string) => {
        setExpandedFiles(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const getLanguage = (fileName: string): string => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        const map: Record<string, string> = {
            ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
            py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
            java: 'java', kt: 'kotlin', swift: 'swift',
            color: 'css', css: 'css', scss: 'scss', html: 'html',
            json: 'json', yaml: 'yaml', yml: 'yaml',
            md: 'markdown', sql: 'sql', sh: 'bash',
            dockerfile: 'docker', xml: 'xml',
        }
        return map[ext ?? ''] ?? 'text'
    }

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Sparkles className="size-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Semantic Search</h1>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Search your codebase using natural language — powered by AI embeddings.
                    </p>
                </div>
                {results.length > 0 && (
                    <Badge variant="secondary" className="text-xs font-mono shrink-0">
                        {results.length} result{results.length !== 1 ? 's' : ''} found
                    </Badge>
                )}
            </div>

            {/* Search Input Box */}
            <Card className="shadow-sm border">
                <CardContent className="p-4 sm:p-6 space-y-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search codebase semantically... (e.g., 'how are payments verified')"
                                className="pl-9 h-10 w-full"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={searchMutation.isPending || !query.trim()}>
                            {searchMutation.isPending ? (
                                <Loader2 className="size-4 animate-spin mr-2" />
                            ) : (
                                <Search className="size-4 mr-2" />
                            )}
                            Search
                        </Button>
                    </form>

                    {/* Suggestions */}
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="text-muted-foreground text-xs font-medium">Try:</span>
                        {SUGGESTIONS.map((s) => (
                            <Badge
                                key={s.label}
                                variant="secondary"
                                className="cursor-pointer hover:bg-secondary/80 transition-colors text-xs"
                                onClick={() => handleSuggestionClick(s.query)}
                            >
                                {s.label}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div>
                {searchMutation.isPending ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                            <div className="relative bg-muted p-4 rounded-full">
                                <Loader2 className="size-6 animate-spin text-primary" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Searching codebase embeddings…</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Search Results</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.map((result) => {
                                const isExpanded = expandedFiles[result.id]
                                const percentage = Math.round(result.similarity * 100)
                                const FileIcon = getFileIcon(result.fileName)
                                const ext = getFileExtension(result.fileName)
                                const simColor = getSimilarityColor(percentage)

                                return (
                                    <Card
                                        key={result.id}
                                        className={`shadow-sm overflow-hidden border transition-all duration-200 hover:shadow-md ${
                                            isExpanded ? 'md:col-span-2' : ''
                                        }`}
                                    >
                                        <div
                                            className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
                                            onClick={() => toggleExpand(result.id)}
                                        >
                                            <div className="space-y-2 flex-1 min-w-0">
                                                {/* Top row: icon + filename + badges */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <div className="p-1.5 rounded-md bg-muted shrink-0">
                                                        <FileIcon className="size-3.5 text-muted-foreground" />
                                                    </div>
                                                    <span className="font-mono text-sm font-semibold truncate text-foreground">
                                                        {result.fileName}
                                                    </span>
                                                    {ext && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-muted-foreground border-border">
                                                            {ext}
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] px-1.5 py-0 font-mono ml-auto shrink-0 ${simColor}`}
                                                    >
                                                        {percentage}%
                                                    </Badge>
                                                </div>

                                                {/* Summary — clamped to 2 lines */}
                                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                    {result.summary}
                                                </p>
                                            </div>

                                            <div className="text-muted-foreground shrink-0 mt-0.5">
                                                {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t">
                                                <SyntaxHighlighter
                                                    language={getLanguage(result.fileName)}
                                                    style={lucario}
                                                    showLineNumbers
                                                    customStyle={{
                                                        margin: 0,
                                                        padding: '1rem',
                                                        fontSize: '0.75rem',
                                                        lineHeight: '1.5',
                                                        borderRadius: 0,
                                                        maxHeight: '400px',
                                                    }}
                                                >
                                                    {result.sourceCode}
                                                </SyntaxHighlighter>
                                            </div>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-xl bg-muted/20 text-center">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <Search className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg text-foreground">No search results</h3>
                        <p className="text-muted-foreground max-w-sm mt-2 text-sm">
                            Submit a query above to start searching codebase files semantically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SemanticSearchPage
