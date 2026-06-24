'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React, { useState } from 'react'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Shield, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle,
    FileCode, ChevronDown, ChevronUp, Info, Bug, Lock
} from 'lucide-react'

const SEVERITY_CONFIG = {
    CRITICAL: {
        color: 'bg-red-500/10 text-red-500 border-red-500/20',
        iconColor: 'text-red-500',
        bgAccent: 'bg-red-500/5 border-red-500/10',
        label: 'Critical',
    },
    HIGH: {
        color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        iconColor: 'text-orange-500',
        bgAccent: 'bg-orange-500/5 border-orange-500/10',
        label: 'High',
    },
    MEDIUM: {
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        iconColor: 'text-amber-500',
        bgAccent: 'bg-amber-500/5 border-amber-500/10',
        label: 'Medium',
    },
    LOW: {
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        iconColor: 'text-blue-500',
        bgAccent: 'bg-blue-500/5 border-blue-500/10',
        label: 'Low',
    },
} as const

type SeverityKey = keyof typeof SEVERITY_CONFIG

const SecurityPage = () => {
    const { project, projectId } = useProject()
    const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({})
    const [filterSeverity, setFilterSeverity] = useState<SeverityKey | 'ALL'>('ALL')

    const { data: scanResult, isLoading } = api.project.scanSecurity.useQuery(
        { projectId },
        { enabled: !!projectId }
    )

    if (!project) return <NoProjectPlaceholder />

    const toggleFinding = (id: string) => {
        setExpandedFindings(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const filteredFindings = scanResult?.findings.filter(
        f => filterSeverity === 'ALL' || f.severity === filterSeverity
    ) ?? []

    const getSecurityGrade = (total: number, critical: number, high: number) => {
        if (critical > 0) return { grade: 'F', color: 'text-red-500', label: 'Critical Issues Found' }
        if (high > 3) return { grade: 'D', color: 'text-orange-500', label: 'Needs Attention' }
        if (high > 0) return { grade: 'C', color: 'text-amber-500', label: 'Some Concerns' }
        if (total > 5) return { grade: 'B', color: 'text-blue-500', label: 'Minor Issues' }
        if (total > 0) return { grade: 'A-', color: 'text-emerald-500', label: 'Good Shape' }
        return { grade: 'A+', color: 'text-emerald-500', label: 'Excellent' }
    }

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                        <Shield className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Security Scanner</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Automated vulnerability detection for {project.name}
                        </p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <p className="text-sm text-muted-foreground">Scanning codebase for vulnerabilities...</p>
                </div>
            ) : scanResult ? (
                <>
                    {/* Summary Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {/* Security Grade */}
                        <Card className="col-span-2 md:col-span-1">
                            <CardContent className="pt-5 pb-4 flex flex-col items-center justify-center">
                                {(() => {
                                    const grade = getSecurityGrade(
                                        scanResult.summary.total,
                                        scanResult.summary.critical,
                                        scanResult.summary.high
                                    )
                                    return (
                                        <>
                                            <span className={`text-4xl font-black ${grade.color}`}>{grade.grade}</span>
                                            <span className="text-[11px] text-muted-foreground mt-1">{grade.label}</span>
                                        </>
                                    )
                                })()}
                            </CardContent>
                        </Card>

                        <SummaryStatCard
                            icon={ShieldX}
                            label="Critical"
                            value={scanResult.summary.critical}
                            active={filterSeverity === 'CRITICAL'}
                            onClick={() => setFilterSeverity(filterSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
                            iconColor="text-red-500"
                        />
                        <SummaryStatCard
                            icon={ShieldAlert}
                            label="High"
                            value={scanResult.summary.high}
                            active={filterSeverity === 'HIGH'}
                            onClick={() => setFilterSeverity(filterSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
                            iconColor="text-orange-500"
                        />
                        <SummaryStatCard
                            icon={AlertTriangle}
                            label="Medium"
                            value={scanResult.summary.medium}
                            active={filterSeverity === 'MEDIUM'}
                            onClick={() => setFilterSeverity(filterSeverity === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
                            iconColor="text-amber-500"
                        />
                        <SummaryStatCard
                            icon={Info}
                            label="Low"
                            value={scanResult.summary.low}
                            active={filterSeverity === 'LOW'}
                            onClick={() => setFilterSeverity(filterSeverity === 'LOW' ? 'ALL' : 'LOW')}
                            iconColor="text-blue-500"
                        />
                        <SummaryStatCard
                            icon={FileCode}
                            label="Files Scanned"
                            value={scanResult.summary.filesScanned}
                            active={false}
                            onClick={() => {}}
                            iconColor="text-muted-foreground"
                        />
                    </div>

                    {/* Findings List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-foreground">
                                {filterSeverity === 'ALL' ? 'All Findings' : `${SEVERITY_CONFIG[filterSeverity].label} Findings`}
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    ({filteredFindings.length})
                                </span>
                            </h2>
                            {filterSeverity !== 'ALL' && (
                                <button
                                    onClick={() => setFilterSeverity('ALL')}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>

                        {filteredFindings.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <div className="bg-emerald-500/10 p-4 rounded-full mb-4">
                                        <ShieldCheck className="size-8 text-emerald-500" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-foreground">
                                        {scanResult.summary.total === 0 ? 'No Vulnerabilities Found' : 'No Matching Findings'}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-1 max-w-sm text-center">
                                        {scanResult.summary.total === 0
                                            ? 'Your codebase passed the security scan with no issues detected.'
                                            : 'No findings match the selected severity filter.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <ScrollArea className="max-h-[600px]">
                                <div className="space-y-2">
                                    {filteredFindings.map((finding) => {
                                        const config = SEVERITY_CONFIG[finding.severity as SeverityKey]
                                        const isExpanded = expandedFindings[finding.id]
                                        return (
                                            <Card
                                                key={finding.id}
                                                className={`overflow-hidden border transition-colors hover:border-primary/20 ${isExpanded ? 'shadow-sm' : ''}`}
                                            >
                                                <button
                                                    className="w-full text-left p-4"
                                                    onClick={() => toggleFinding(finding.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-1.5 rounded-lg mt-0.5 ${config.bgAccent} border`}>
                                                            <Bug className={`size-3.5 ${config.iconColor}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-medium text-sm text-foreground">{finding.title}</span>
                                                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.color}`}>
                                                                    {config.label}
                                                                </Badge>
                                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                    {finding.category}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                                                                <FileCode className="size-3 shrink-0" />
                                                                <span className="font-mono truncate">{finding.fileName}</span>
                                                                <span className="shrink-0">Line {finding.lineNumber}</span>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 text-muted-foreground mt-1">
                                                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                                        </div>
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
                                                        <div className="flex items-start gap-2">
                                                            <Lock className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                                            <p className="text-sm text-muted-foreground">{finding.description}</p>
                                                        </div>
                                                        <div className="rounded-lg bg-card border p-3">
                                                            <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">
                                                                Affected Code
                                                            </p>
                                                            <code className="text-xs font-mono text-foreground block whitespace-pre-wrap break-all">
                                                                {finding.lineContent}
                                                            </code>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    )
}

function SummaryStatCard({
    icon: Icon,
    label,
    value,
    active,
    onClick,
    iconColor,
}: {
    icon: React.ElementType
    label: string
    value: number
    active: boolean
    onClick: () => void
    iconColor: string
}) {
    return (
        <Card
            className={`cursor-pointer transition-all hover:shadow-sm ${active ? 'ring-2 ring-primary/50 border-primary/30' : ''}`}
            onClick={onClick}
        >
            <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                    <Icon className={`size-4 ${iconColor}`} />
                    <div>
                        <p className="text-xl font-bold text-foreground leading-none">{value}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SecurityPage
