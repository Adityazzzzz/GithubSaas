'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { useState } from 'react'
import { ChevronRight, ChevronDown, File, Folder, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import MDEditor from '@uiw/react-md-editor'

type TreeNode = {
    name: string
    path: string
    children: Record<string, TreeNode>
    isFile: boolean
    fileId?: string
    summary?: string
}

function buildTree(files: { id: string; fileName: string; summary: string }[]): TreeNode {
    const root: TreeNode = { name: 'root', path: '', children: {}, isFile: false }

    for (const file of files) {
        const parts = file.fileName.split('/')
        let current = root

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i]!
            const isLast = i === parts.length - 1

            if (!current.children[part]) {
                current.children[part] = {
                    name: part,
                    path: parts.slice(0, i + 1).join('/'),
                    children: {},
                    isFile: isLast,
                    fileId: isLast ? file.id : undefined,
                    summary: isLast ? file.summary : undefined,
                }
            }
            current = current.children[part]!
        }
    }
    return root
}

function TreeItem({
    node,
    depth = 0,
    onSelect,
    selectedPath,
}: {
    node: TreeNode
    depth?: number
    onSelect: (node: TreeNode) => void
    selectedPath: string | null
}) {
    const [isOpen, setIsOpen] = useState(depth < 2)
    const children = Object.values(node.children).sort((a, b) => {
        if (a.isFile !== b.isFile) return a.isFile ? 1 : -1
        return a.name.localeCompare(b.name)
    })

    if (node.isFile) {
        return (
            <button
                onClick={() => onSelect(node)}
                className={`flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors hover:bg-muted ${
                    selectedPath === node.path ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                }`}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
                <File className="size-4 shrink-0" />
                <span className="truncate">{node.name}</span>
            </button>
        )
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors hover:bg-muted text-foreground font-medium"
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
                {isOpen ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                <Folder className="size-4 shrink-0 text-blue-500" />
                <span className="truncate">{node.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{Object.keys(node.children).length}</span>
            </button>
            {isOpen && children.map((child) => (
                <TreeItem key={child.path} node={child} depth={depth + 1} onSelect={onSelect} selectedPath={selectedPath} />
            ))}
        </div>
    )
}

const FilesPage = () => {
    const { project, projectId } = useProject()
    const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const { data: files } = api.project.getSourceCodeFiles.useQuery(
        { projectId },
        { enabled: !!projectId }
    )

    const { data: fileDetails } = api.project.getFileDetails.useQuery(
        { projectId, fileId: selectedFile?.fileId ?? '' },
        { enabled: !!selectedFile?.fileId && !!projectId }
    )

    if (!project) return <NoProjectPlaceholder />

    const filteredFiles = searchTerm
        ? files?.filter(f => f.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
        : files

    const tree = filteredFiles ? buildTree(filteredFiles) : null

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="mb-4">
                <h1 className="text-2xl font-bold dark:text-white">File Explorer</h1>
                <p className="text-sm text-muted-foreground">
                    Browse {files?.length ?? 0} indexed files in {project.name}
                </p>
            </div>

            <div className="flex gap-4 flex-1 min-h-0">
                {/* File Tree Panel */}
                <Card className="w-80 shrink-0 flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files..."
                                className="pl-8 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full px-2">
                            {tree && Object.values(tree.children).map((child) => (
                                <TreeItem
                                    key={child.path}
                                    node={child}
                                    onSelect={setSelectedFile}
                                    selectedPath={selectedFile?.path ?? null}
                                />
                            ))}
                            {(!files || files.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No files indexed yet. Project may still be indexing.
                                </p>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* File Detail Panel */}
                <Card className="flex-1 flex flex-col min-w-0">
                    {selectedFile && fileDetails ? (
                        <>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-mono">{selectedFile.path}</CardTitle>
                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">AI Summary</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">{fileDetails.summary}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-0 overflow-auto">
                                <SyntaxHighlighter
                                    language={getLanguage(selectedFile.name)}
                                    style={lucario}
                                    showLineNumbers
                                    customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.8rem' }}
                                >
                                    {fileDetails.sourceCode}
                                </SyntaxHighlighter>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="flex-1 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <File className="size-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">Select a file to view</p>
                                <p className="text-sm">Choose a file from the tree to see its code and AI summary</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    )
}

function getLanguage(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const map: Record<string, string> = {
        ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
        py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
        java: 'java', kt: 'kotlin', swift: 'swift',
        css: 'css', scss: 'scss', html: 'html',
        json: 'json', yaml: 'yaml', yml: 'yaml',
        md: 'markdown', sql: 'sql', sh: 'bash',
        dockerfile: 'docker', xml: 'xml',
    }
    return map[ext ?? ''] ?? 'text'
}

export default FilesPage
