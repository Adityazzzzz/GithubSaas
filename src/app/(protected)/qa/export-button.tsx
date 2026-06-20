'use client'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

type Question = {
    question: string
    answer: string
    createdAt: Date
    user: { firstName: string | null; lastName: string | null }
}

export default function ExportQAButton({ questions, projectName }: { questions: Question[]; projectName: string }) {
    const exportMarkdown = () => {
        if (!questions?.length) {
            toast.error('No questions to export')
            return
        }

        let md = `# Q&A Export — ${projectName}\n\n`
        md += `*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`

        for (const q of questions) {
            md += `## Q: ${q.question}\n\n`
            md += `*Asked by ${q.user.firstName ?? 'Unknown'} ${q.user.lastName ?? ''} on ${q.createdAt.toLocaleDateString()}*\n\n`
            md += `${q.answer}\n\n---\n\n`
        }

        const blob = new Blob([md], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qa-${projectName.toLowerCase().replace(/\s+/g, '-')}.md`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Q&A exported as markdown!')
    }

    return (
        <Button onClick={exportMarkdown} variant="outline" size="sm">
            <Download className="size-4 mr-2" />
            Export to Markdown
        </Button>
    )
}
