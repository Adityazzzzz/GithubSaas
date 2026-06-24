import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Zap, GitCommit, GitPullRequest } from 'lucide-react'
import { STATUS_CONFIG } from './types'

interface AutomationsViewProps {
  automations: any[]
  onSaveRule: (trigger: string, action: string) => void
  onToggleRule: (ruleId: string, isActive: boolean) => void
}

export function AutomationsView({
  automations,
  onSaveRule,
  onToggleRule,
}: AutomationsViewProps) {
  // Find current action values for automations if configured
  const commitRule = automations.find(r => r.trigger === 'COMMIT_PUSHED')
  const prRule = automations.find(r => r.trigger === 'PR_MERGED')

  return (
    <div className="h-full overflow-y-auto bg-slate-50/20 select-none">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Setup Rules */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-3 bg-slate-50/20">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Zap className="size-4.5 text-amber-500 fill-amber-500/10" /> Git Workflow Automations
            </CardTitle>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Configure automated task movements triggered by commit messages and branch events</p>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {/* Commit Automation */}
            <div className="flex items-center justify-between p-4.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-4.5">
                <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                  <GitCommit className="size-4.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Commit references task key</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">Transition a task when a commit message references its key (e.g. GB-12)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">Move to status:</span>
                <Select
                  value={commitRule?.action ?? 'IN_PROGRESS'}
                  onValueChange={(val) => onSaveRule('COMMIT_PUSHED', val)}>
                  <SelectTrigger className="h-9 w-[140px] text-xs bg-slate-50 border-slate-100 rounded-lg hover:bg-slate-100/50 font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) =>
                      <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* PR Merged Automation */}
            <div className="flex items-center justify-between p-4.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-4.5">
                <div className="size-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm">
                  <GitPullRequest className="size-4.5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">PR merged successfully</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">Transition a task when its linked pull request is successfully merged</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">Move to status:</span>
                <Select
                  value={prRule?.action ?? 'DONE'}
                  onValueChange={(val) => onSaveRule('PR_MERGED', val)}>
                  <SelectTrigger className="h-9 w-[140px] text-xs bg-slate-50 border-slate-100 rounded-lg hover:bg-slate-100/50 font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) =>
                      <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Rules */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-3 bg-slate-50/20">
            <CardTitle className="text-sm font-semibold text-slate-800">Active Rules ({automations.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-4.5">
            {automations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10 font-semibold">No automation rules configured yet. Change dropdown statuses above to save.</p>
            ) : (
              <div className="space-y-3">
                {automations.map(rule => {
                  const statusLabel = STATUS_CONFIG[rule.action]?.label ?? rule.action
                  const triggerLabel = rule.trigger === 'COMMIT_PUSHED' 
                    ? 'Commit references task key' 
                    : rule.trigger === 'PR_MERGED' 
                      ? 'Pull Request merged' 
                      : rule.trigger.replace(/_/g, ' ')

                  return (
                    <div key={rule.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800">{triggerLabel}</p>
                        <p className="text-[11px] font-semibold text-slate-400">Action: Move task status → <span className="text-blue-600 font-bold">{statusLabel}</span></p>
                      </div>
                      <div className="flex items-center gap-4.5">
                        <Badge variant={rule.isActive ? 'default' : 'secondary'} className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${
                          rule.isActive 
                            ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}>
                          {rule.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
