'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, GitCommit, Calendar } from 'lucide-react'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'
import { toast } from 'sonner'

const ChangelogPage = () => {
    const { project, projectId } = useProject()
    const { data: changelog, isLoading } = api.project.getChangelog.useQuery(
        { projectId },
        { enabled: !!projectId }
    )

    if (!project) return <NoProjectPlaceholder />

    const exportMarkdown = () => {
        if (!changelog) return
        let md = `# Changelog — ${project.name}\n\n`
        for (const [date, commits] of Object.entries(changelog)) {
            md += `## ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`
            for (const commit of commits) {
                md += `### ${commit.commitMessage}\n`
                md += `*by ${commit.commitAuthorName}* — \`${commit.commitHash.slice(0, 7)}\`\n\n`
                md += `${commit.summary}\n\n`
            }
        }

        const blob = new Blob([md], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `changelog-${project.name.toLowerCase().replace(/\s+/g, '-')}.md`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Changelog exported!')
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Changelog</h1>
                    <p className="text-sm text-muted-foreground">
                        Auto-generated changelog from commit history
                    </p>
                </div>
                <Button onClick={exportMarkdown} variant="outline" disabled={!changelog}>
                    <Download className="size-4 mr-2" />
                    Export Markdown
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : changelog && Object.keys(changelog).length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(changelog).map(([date, commits]) => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="size-4 text-muted-foreground" />
                                <h2 className="text-lg font-semibold dark:text-white">
                                    {new Date(date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </h2>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                    {commits.length} commit{commits.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="space-y-3 ml-6 border-l-2 border-muted pl-6">
                                {commits.map((commit) => (
                                    <Card key={commit.id}>
                                        <CardContent className="pt-4">
                                            <div className="flex items-start gap-3">
                                                <GitCommit className="size-5 text-primary mt-0.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-sm dark:text-white truncate">
                                                            {commit.commitMessage}
                                                        </p>
                                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground shrink-0">
                                                            {commit.commitHash.slice(0, 7)}
                                                        </code>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        by {commit.commitAuthorName}
                                                    </p>
                                                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                        {commit.summary}
                                                    </pre>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex items-center justify-center py-16">
                        <div className="text-center text-muted-foreground">
                            <GitCommit className="size-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No commits yet</p>
                            <p className="text-sm">Commits will appear here once your project is indexed</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default ChangelogPage
