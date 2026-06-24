'use client'
import React, { useMemo, useCallback } from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import {
    FileCode2, GitCommit, MessageSquare, Presentation,
    Sparkles, Activity, TrendingUp, Shield, Clock,
    GitBranch, Hash,
} from 'lucide-react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import ReactFlow, {
    Controls, Background, MiniMap, Handle, Position,
    ConnectionLineType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'
import { motion } from 'framer-motion'

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-teal-500', 'bg-orange-500',
]

const COLOR_HEX = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
    '#f43f5e', '#06b6d4', '#ec4899', '#6366f1',
    '#14b8a6', '#f97316',
]

const LANGUAGE_LABELS: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TSX', js: 'JavaScript', jsx: 'JSX',
    py: 'Python', rb: 'Ruby', go: 'Go', rs: 'Rust',
    java: 'Java', kt: 'Kotlin', swift: 'Swift',
    css: 'CSS', scss: 'SCSS', html: 'HTML',
    json: 'JSON', yaml: 'YAML', yml: 'YAML',
    md: 'Markdown', sql: 'SQL', sh: 'Shell',
    prisma: 'Prisma', graphql: 'GraphQL', xml: 'XML',
}

const EXT_COLORS: Record<string, string> = {
    ts: '#3b82f6', tsx: '#06b6d4', js: '#f59e0b', jsx: '#f97316',
    py: '#10b981', css: '#ec4899', scss: '#ec4899', html: '#f43f5e',
    json: '#f59e0b', yaml: '#8b5cf6', yml: '#8b5cf6',
    md: '#6b7280', sql: '#6366f1', prisma: '#2dd4bf',
    graphql: '#e535ab', go: '#00add8', rs: '#f97316',
    java: '#f43f5e', kt: '#a855f7', swift: '#f97316',
    rb: '#ef4444', sh: '#22c55e', xml: '#64748b',
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function relativeTime(date: Date | string): string {
    const now = Date.now()
    const then = new Date(date).getTime()
    const seconds = Math.floor((now - then) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
}

function getFileExt(filename: string): string {
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1]! : ''
}

function truncateFilename(label: string, maxLen = 24): string {
    const name = label.split('/').pop() ?? label
    if (name.length <= maxLen) return name
    return name.slice(0, maxLen - 1) + '…'
}

// ─── Animation variants ─────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const },
    }),
}

// ─── Custom ReactFlow Node ──────────────────────────────────────────────────

interface CustomNodeData { label: string; connectionCount?: number }

function DependencyNode({ data }: { data: CustomNodeData }) {
    const ext = getFileExt(data.label)
    const badgeColor = EXT_COLORS[ext] ?? '#6b7280'
    const displayName = truncateFilename(data.label)

    return (
        <div
            className="group relative flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-foreground shadow-sm transition-all hover:shadow-md"
            style={{ minWidth: 160 }}
        >
            <Handle type="target" position={Position.Left} className="!bg-primary !w-2 !h-2 !border-none" />
            {ext && (
                <span
                    className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-white"
                    style={{ backgroundColor: badgeColor }}
                >
                    .{ext}
                </span>
            )}
            <span className="truncate text-[11px] font-semibold font-mono">{displayName}</span>
            <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2 !border-none" />
        </div>
    )
}

const nodeTypes = { custom: DependencyNode }

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, index }: {
    icon: React.ElementType; label: string; value: number; color: string; index: number
}) {
    return (
        <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="relative overflow-hidden">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted ${color}`}>
                            <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-3xl font-extrabold tracking-tight text-foreground">
                                {value.toLocaleString()}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ─── Health Score ────────────────────────────────────────────────────────────

function HealthScoreWidget({ insights }: {
    insights: {
        fileCount: number; commitCount: number;
        questionCount: number; meetingCount: number
    }
}) {
    const { score, breakdown } = useMemo(() => {
        let s = 70
        // Commit activity bonus
        const commitBonus = Math.min(insights.commitCount * 0.5, 15)
        s += commitBonus
        // Question engagement bonus
        const questionBonus = Math.min(insights.questionCount * 1.5, 10)
        s += questionBonus
        // Meeting documentation bonus
        const meetingBonus = Math.min(insights.meetingCount * 3, 10)
        s += meetingBonus
        // Deductions for large codebases with low exploration
        if (insights.fileCount > 100 && insights.questionCount < 5) {
            s -= 10
        }
        // Penalize zero commits
        if (insights.commitCount === 0) s -= 20

        const clamped = Math.max(0, Math.min(100, Math.round(s)))

        return {
            score: clamped,
            breakdown: [
                { label: 'Commit Activity', value: Math.round(commitBonus), max: 15, color: '#10b981' },
                { label: 'AI Exploration', value: Math.round(questionBonus), max: 10, color: '#8b5cf6' },
                { label: 'Documentation', value: Math.round(meetingBonus), max: 10, color: '#f59e0b' },
                {
                    label: 'Code Coverage',
                    value: insights.fileCount > 0 ? Math.min(Math.round((insights.questionCount / insights.fileCount) * 100), 100) : 0,
                    max: 100,
                    color: '#3b82f6',
                },
            ],
        }
    }, [insights])

    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#f43f5e'
    const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Attention'

    return (
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="size-4 text-emerald-500" />
                        Codebase Health
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative size-32">
                            <CircularProgressbar
                                value={score}
                                text={`${score}`}
                                styles={buildStyles({
                                    textSize: '28px',
                                    textColor: 'var(--foreground)',
                                    pathColor: scoreColor,
                                    trailColor: 'var(--muted)',
                                    pathTransitionDuration: 1.2,
                                })}
                            />
                        </div>
                        <Badge variant="secondary" className="text-xs font-semibold" style={{ color: scoreColor }}>
                            {scoreLabel}
                        </Badge>
                    </div>
                    <div className="mt-5 space-y-3">
                        {breakdown.map((item) => (
                            <div key={item.label}>
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-muted-foreground">{item.label}</span>
                                    <span className="text-[11px] font-bold text-foreground">{item.value}/{item.max}</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${(item.value / item.max) * 100}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ─── Language Breakdown ──────────────────────────────────────────────────────

function LanguageBreakdownCard({ languageBreakdown }: {
    languageBreakdown: Record<string, number>
}) {
    const total = Object.values(languageBreakdown).reduce((a, b) => a + b, 0)
    const sorted = Object.entries(languageBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)

    if (sorted.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileCode2 className="size-4 text-blue-500" />
                        Language Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No files indexed yet</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileCode2 className="size-4 text-blue-500" />
                        Language Breakdown
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground">{total.toLocaleString()} files across {sorted.length} languages</p>
                </CardHeader>
                <CardContent>
                    {/* Segmented bar */}
                    <div className="flex h-3 overflow-hidden rounded-full">
                        {sorted.map(([ext, count], i) => (
                            <div
                                key={ext}
                                className={`${COLORS[i % COLORS.length]} transition-all duration-500`}
                                style={{ width: `${(count / total) * 100}%` }}
                                title={`${LANGUAGE_LABELS[ext] ?? ext}: ${count} files (${Math.round((count / total) * 100)}%)`}
                            />
                        ))}
                    </div>
                    {/* Legend grid */}
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                        {sorted.map(([ext, count], i) => {
                            const pct = Math.round((count / total) * 100)
                            return (
                                <div key={ext} className="flex items-center gap-2 text-sm">
                                    <div className={`size-2.5 shrink-0 rounded-full ${COLORS[i % COLORS.length]}`} />
                                    <span className="truncate text-muted-foreground">{LANGUAGE_LABELS[ext] ?? ext}</span>
                                    <span className="ml-auto whitespace-nowrap text-xs font-semibold text-foreground">
                                        {count} <span className="text-muted-foreground font-normal">({pct}%)</span>
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ─── Top Contributors ────────────────────────────────────────────────────────

function ContributorsCard({ contributors }: {
    contributors: Record<string, { count: number; avatar: string }>
}) {
    const sorted = Object.entries(contributors)
        .sort(([, a], [, b]) => b.count - a.count)
    const topCount = sorted[0]?.[1]?.count ?? 1

    return (
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="size-4 text-violet-500" />
                        Top Contributors
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground">{sorted.length} contributor{sorted.length !== 1 ? 's' : ''}</p>
                </CardHeader>
                <CardContent>
                    {sorted.length > 0 ? (
                        <div className="space-y-3">
                            {sorted.map(([name, data], i) => (
                                <div key={name} className="flex items-center gap-3">
                                    <span className="w-4 text-center text-[11px] font-bold text-muted-foreground">{i + 1}</span>
                                    <img
                                        src={data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=32&background=random`}
                                        alt={name}
                                        className="size-7 shrink-0 rounded-full ring-1 ring-border"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all duration-700"
                                                    style={{ width: `${(data.count / topCount) * 100}%` }}
                                                />
                                            </div>
                                            <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                                                {data.count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No commits yet</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ─── Recent Activity Feed ────────────────────────────────────────────────────

function ActivityFeed({ projectId }: { projectId: string }) {
    const { data: commits } = api.project.getCommits.useQuery(
        { projectId },
        { enabled: !!projectId }
    )

    const recentCommits = commits?.slice(0, 5) ?? []

    return (
        <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="size-4 text-rose-500" />
                        Recent Activity
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground">Latest commits</p>
                </CardHeader>
                <CardContent>
                    {recentCommits.length > 0 ? (
                        <ScrollArea className="h-[280px] pr-3">
                            <div className="space-y-3">
                                {recentCommits.map((commit) => (
                                    <div
                                        key={commit.id}
                                        className="group flex items-start gap-3 rounded-lg border bg-card/50 p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <img
                                            src={commit.commitAuthorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(commit.commitAuthorName)}&size=32`}
                                            alt={commit.commitAuthorName}
                                            className="mt-0.5 size-7 shrink-0 rounded-full ring-1 ring-border"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {commit.commitAuthorName}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {relativeTime(commit.commitDate)}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground leading-relaxed">
                                                {commit.commitMessage}
                                            </p>
                                            <Badge variant="outline" className="mt-1.5 gap-1 text-[10px] font-mono">
                                                <Hash className="size-2.5" />
                                                {commit.commitHash.slice(0, 7)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex h-[280px] items-center justify-center">
                            <p className="text-sm text-muted-foreground">No recent commits</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ─── Dependency Graph ────────────────────────────────────────────────────────

function DependencyGraph({ projectId }: { projectId: string }) {
    const { data: graph, isLoading } = api.project.getDependencyGraph.useQuery(
        { projectId },
        { enabled: !!projectId }
    )

    // Count connections per node for sizing
    const connectionCounts = useMemo(() => {
        if (!graph) return new Map<string, number>()
        const counts = new Map<string, number>()
        graph.edges.forEach((edge) => {
            counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1)
            counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1)
        })
        return counts
    }, [graph])

    const { layoutedNodes, layoutedEdges } = useMemo(() => {
        if (!graph || graph.nodes.length === 0) {
            return { layoutedNodes: [], layoutedEdges: [] }
        }

        const dagreGraph = new dagre.graphlib.Graph()
        dagreGraph.setDefaultEdgeLabel(() => ({}))
        dagreGraph.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80 })

        graph.nodes.forEach((node) => {
            const connections = connectionCounts.get(node.id) ?? 0
            const width = Math.max(180, 180 + connections * 8)
            dagreGraph.setNode(node.id, { width, height: 44 })
        })

        graph.edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target)
        })

        dagre.layout(dagreGraph)

        const nodes = graph.nodes.map((node) => {
            const pos = dagreGraph.node(node.id)
            const connections = connectionCounts.get(node.id) ?? 0
            const w = Math.max(180, 180 + connections * 8)
            return {
                id: node.id,
                type: 'custom',
                data: { label: node.label, connectionCount: connections },
                position: { x: pos.x - w / 2, y: pos.y - 22 },
            }
        })

        const edges = graph.edges.map((edge) => ({
            ...edge,
            type: ConnectionLineType.SmoothStep,
            animated: true,
            style: {
                stroke: 'var(--primary)',
                strokeWidth: 1.5,
                opacity: 0.5,
            },
        }))

        return { layoutedNodes: nodes, layoutedEdges: edges }
    }, [graph, connectionCounts])

    if (isLoading) {
        return (
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="text-base">Codebase Dependency Graph</CardTitle>
                </CardHeader>
                <CardContent className="flex h-[400px] items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </CardContent>
            </Card>
        )
    }

    if (!graph || graph.nodes.length === 0) {
        return (
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="text-base">Codebase Dependency Graph</CardTitle>
                </CardHeader>
                <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
                    No files or dependencies detected. Try indexing the repository.
                </CardContent>
            </Card>
        )
    }

    return (
        <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="mt-8 shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                        <Sparkles className="size-4 text-violet-500" />
                        Codebase Dependency Graph
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground">
                        {graph.nodes.length} modules · {graph.edges.length} connections — interactive visual map of imports
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-[560px] w-full overflow-hidden rounded-xl border bg-muted/30">
                        <ReactFlow
                            nodes={layoutedNodes}
                            edges={layoutedEdges}
                            nodeTypes={nodeTypes}
                            fitView
                            proOptions={{ hideAttribution: true }}
                            minZoom={0.3}
                            maxZoom={2}
                        >
                            <Background color="var(--border)" gap={20} size={1} />
                            <Controls
                                position="bottom-right"
                                className="!bg-card !border-border !shadow-lg !rounded-xl [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground"
                            />
                            <MiniMap
                                nodeStrokeColor="var(--border)"
                                nodeColor="var(--muted)"
                                maskColor="var(--background)"
                                className="!bg-card !border-border !rounded-xl !shadow-sm"
                                pannable
                                zoomable
                            />
                        </ReactFlow>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const InsightsPage = () => {
    const { project, projectId } = useProject()
    const { data: insights, isLoading } = api.project.getProjectInsights.useQuery(
        { projectId },
        { enabled: !!projectId }
    )

    if (!project) return <NoProjectPlaceholder />

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Project Insights
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Analytics, health metrics, and dependency mapping for{' '}
                    <span className="font-semibold text-foreground">{project.name}</span>
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <p className="text-sm text-muted-foreground">Loading insights…</p>
                    </div>
                </div>
            ) : insights ? (
                <>
                    {/* ── Section 1: Stats Grid ── */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
                        <StatCard icon={FileCode2} label="Files Indexed" value={insights.fileCount} color="text-blue-500" index={0} />
                        <StatCard icon={GitCommit} label="Commits" value={insights.commitCount} color="text-emerald-500" index={1} />
                        <StatCard icon={MessageSquare} label="Questions Asked" value={insights.questionCount} color="text-violet-500" index={2} />
                        <StatCard icon={Presentation} label="Meetings" value={insights.meetingCount} color="text-amber-500" index={3} />
                    </div>

                    {/* ── Section 2+3: Health + Language (side by side) ── */}
                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-1">
                            <HealthScoreWidget insights={insights} />
                        </div>
                        <div className="lg:col-span-2">
                            <LanguageBreakdownCard languageBreakdown={insights.languageBreakdown} />
                        </div>
                    </div>

                    {/* ── Section 4+5: Contributors + Activity ── */}
                    <div className="mb-0 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <ContributorsCard contributors={insights.contributors} />
                        <ActivityFeed projectId={projectId} />
                    </div>

                    {/* ── Section 6: Dependency Graph ── */}
                    <DependencyGraph projectId={projectId} />
                </>
            ) : null}
        </div>
    )
}

export default InsightsPage
