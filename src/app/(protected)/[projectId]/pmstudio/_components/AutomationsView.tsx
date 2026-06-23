import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Zap,
  GitCommit,
  GitPullRequest,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Users,
  Briefcase,
  Bell,
  ListTodo,
  AlertCircle,
  Play,
  PlayCircle
} from 'lucide-react'
import { STATUS_CONFIG, PRIORITY_CONFIG, getUserName } from './types'
import { toast } from 'sonner'

interface AutomationsViewProps {
  automations: any[]
  members: any[]
  teams: any[]
  onSaveRule: (trigger: string, action: string) => void
  onToggleRule: (ruleId: string, isActive: boolean) => void
  onDeleteRule: (ruleId: string) => void
}

export function AutomationsView({
  automations,
  members,
  teams,
  onSaveRule,
  onToggleRule,
  onDeleteRule,
}: AutomationsViewProps) {
  // Preset Rules
  const commitRule = automations.find(r => r.trigger === 'COMMIT_PUSHED')
  const prRule = automations.find(r => r.trigger === 'PR_MERGED')

  // Custom Rules Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Custom Rule Builder Form State
  const [whenType, setWhenType] = useState<string>('CREATED')
  const [whenValue, setWhenValue] = useState<string>('TODO')
  
  const [ifType, setIfType] = useState<string>('ALWAYS')
  const [ifValue, setIfValue] = useState<string>('')

  const [thenType, setThenType] = useState<string>('MOVE_STATUS')
  const [thenValue, setThenValue] = useState<string>('DONE')

  // Parse rule for human-readable display
  const parseRuleDetails = (rule: any) => {
    if (rule.trigger === 'COMMIT_PUSHED' || rule.trigger === 'PR_MERGED') {
      return {
        isCustom: false,
        triggerLabel: rule.trigger === 'COMMIT_PUSHED' ? 'Commit message references task key' : 'Pull Request is successfully merged',
        actionLabel: `Transition task status to "${STATUS_CONFIG[rule.action]?.label ?? rule.action}"`
      }
    }

    try {
      const triggerData = JSON.parse(rule.trigger)
      const actionData = JSON.parse(rule.action)

      if (triggerData.type === 'CUSTOM') {
        let whenText = ''
        if (triggerData.whenType === 'CREATED') whenText = 'an issue is created'
        else if (triggerData.whenType === 'STATUS_TO') whenText = `issue status changes to "${STATUS_CONFIG[triggerData.whenValue]?.label ?? triggerData.whenValue}"`
        else if (triggerData.whenType === 'PRIORITY_TO') whenText = `issue priority is updated to "${PRIORITY_CONFIG[triggerData.whenValue as keyof typeof PRIORITY_CONFIG]?.label ?? triggerData.whenValue}"`

        let ifText = ''
        if (triggerData.ifType === 'ALWAYS') ifText = 'always execute'
        else if (triggerData.ifType === 'UNASSIGNED') ifText = 'the issue is unassigned'
        else if (triggerData.ifType === 'SQUAD_IS') {
          const squadName = teams.find(t => t.id === triggerData.ifValue)?.name ?? 'Unknown Squad'
          ifText = `issue belongs to squad "${squadName}"`
        }
        else if (triggerData.ifType === 'PRIORITY_IS') ifText = `issue priority level is "${PRIORITY_CONFIG[triggerData.ifValue as keyof typeof PRIORITY_CONFIG]?.label ?? triggerData.ifValue}"`

        let thenText = ''
        if (actionData.thenType === 'MOVE_STATUS') thenText = `transition task status to "${STATUS_CONFIG[actionData.thenValue]?.label ?? actionData.thenValue}"`
        else if (actionData.thenType === 'ASSIGN_MEMBER') {
          const member = members.find(m => m.id === actionData.thenValue)
          const name = member ? `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || member.emailAddress : 'Unknown Member'
          thenText = `assign task to "${name}"`
        }
        else if (actionData.thenType === 'SET_PRIORITY') thenText = `update task priority to "${PRIORITY_CONFIG[actionData.thenValue as keyof typeof PRIORITY_CONFIG]?.label ?? actionData.thenValue}"`
        else if (actionData.thenType === 'CHECKLIST_TEMPLATE') thenText = 'auto-populate description with onboarding checklist template'
        else if (actionData.thenType === 'ALERT_LOG') thenText = 'generate an automation system log and notifications alert'

        return {
          isCustom: true,
          whenText,
          ifText,
          thenText
        }
      }
    } catch (e) {
      // Legacy or misconfigured rule fallback
    }

    return {
      isCustom: false,
      triggerLabel: rule.trigger,
      actionLabel: rule.action
    }
  }

  // Handle Save Custom Rule
  const handleSaveCustomRule = () => {
    // Construct serialized rule strings
    const triggerData = {
      type: 'CUSTOM',
      id: `rule-${Date.now()}`,
      whenType,
      whenValue,
      ifType,
      ifValue: (ifType === 'SQUAD_IS' || ifType === 'PRIORITY_IS') ? ifValue : '',
    }

    const actionData = {
      thenType,
      thenValue,
    }

    onSaveRule(JSON.stringify(triggerData), JSON.stringify(actionData))
    setIsCreateOpen(false)
    toast.success('Custom automation rule saved successfully')
  }

  // Reset helper when trigger/condition/action types change
  const handleWhenTypeChange = (val: string) => {
    setWhenType(val)
    if (val === 'STATUS_TO') setWhenValue('TODO')
    if (val === 'PRIORITY_TO') setWhenValue('MEDIUM')
  }

  const handleIfTypeChange = (val: string) => {
    setIfType(val)
    if (val === 'ALWAYS' || val === 'UNASSIGNED') setIfValue('')
    else if (val === 'SQUAD_IS') setIfValue(teams[0]?.id ?? '')
    else if (val === 'PRIORITY_IS') setIfValue('MEDIUM')
  }

  const handleThenTypeChange = (val: string) => {
    setThenType(val)
    if (val === 'MOVE_STATUS') setThenValue('TODO')
    else if (val === 'ASSIGN_MEMBER') setThenValue(members[0]?.id ?? '')
    else if (val === 'SET_PRIORITY') setThenValue('MEDIUM')
    else setThenValue('')
  }

  const customRules = automations.filter(r => r.trigger.startsWith('{'))
  const presetRules = automations.filter(r => !r.trigger.startsWith('{'))

  return (
    <div className="h-full overflow-y-auto bg-muted/40 select-none">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Zap className="size-5 text-amber-500 fill-amber-500/10" /> Workflow Automations
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Build trigger-action recipes to automate squad status movements, assignments, and checklists.</p>
          </div>
          <Button
            onClick={() => {
              // Set initial values safely
              setWhenType('CREATED')
              setIfType('ALWAYS')
              setIfValue('')
              setThenType('MOVE_STATUS')
              setThenValue('TODO')
              setIsCreateOpen(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9 rounded-lg"
          >
            <Plus className="size-4 mr-1.5" /> Create Custom Rule
          </Button>
        </div>

        {/* Preset Git Workflow Rules */}
        <Card className="border border-border bg-card shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-border/80">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <GitCommit className="size-4.5 text-muted-foreground" /> Git Integration Presets
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">Automate card movements when developers push commits or merge pull requests referencing task keys.</p>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            
            {/* Commit Automation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-muted/10 transition-colors gap-3">
              <div className="flex items-center gap-4">
                <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <GitCommit className="size-4.5 text-emerald-600 dark:text-emerald-450" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Commit references task key</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Transitions task status when a commit message references issue IDs (e.g. ISS-12).</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs text-muted-foreground font-semibold">Move status to:</span>
                <Select
                  value={commitRule?.action ?? 'IN_PROGRESS'}
                  onValueChange={(val) => onSaveRule('COMMIT_PUSHED', val)}>
                  <SelectTrigger className="h-8.5 w-[140px] text-xs bg-card border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) =>
                      <SelectItem key={k} value={k} className="text-xs cursor-pointer">{v.label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* PR Merged Automation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-muted/10 transition-colors gap-3">
              <div className="flex items-center gap-4">
                <div className="size-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <GitPullRequest className="size-4.5 text-violet-600 dark:text-violet-450" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">PR merged successfully</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Transitions task status when its linked Git pull request is merged.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs text-muted-foreground font-semibold">Move status to:</span>
                <Select
                  value={prRule?.action ?? 'DONE'}
                  onValueChange={(val) => onSaveRule('PR_MERGED', val)}>
                  <SelectTrigger className="h-8.5 w-[140px] text-xs bg-card border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) =>
                      <SelectItem key={k} value={k} className="text-xs cursor-pointer">{v.label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Custom Company Rules List */}
        <Card className="border border-border bg-card shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-border/80">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" /> Company Custom Rules ({customRules.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {customRules.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 border border-dashed border-border rounded-xl">
                <Zap className="size-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-xs font-bold text-muted-foreground">No custom rules built yet.</p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">Click the "Create Custom Rule" button to configure trigger actions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customRules.map(rule => {
                  const details = parseRuleDetails(rule)
                  return (
                    <div key={rule.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border bg-background rounded-xl hover:shadow-sm transition-all gap-4">
                      
                      {/* Flow Diagram */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground/90 max-w-2xl leading-relaxed">
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-bold py-0.5 rounded px-2">WHEN</Badge>
                        <span className="text-foreground font-bold">{details.whenText}</span>
                        
                        {details.ifText && (
                          <>
                            <ArrowRight className="size-3.5 text-muted-foreground/60" />
                            <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-bold py-0.5 rounded px-2">IF</Badge>
                            <span className="text-amber-600 dark:text-amber-400 font-bold">{details.ifText}</span>
                          </>
                        )}

                        <ArrowRight className="size-3.5 text-muted-foreground/60" />
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold py-0.5 rounded px-2">THEN</Badge>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{details.thenText}</span>
                      </div>

                      {/* Rule Actions */}
                      <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                        <Badge variant={rule.isActive ? 'outline' : 'secondary'} className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${
                          rule.isActive 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {rule.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeleteRule(rule.id)}
                          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ─── CREATE CUSTOM RULE DIALOG ─── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl bg-card border-border text-foreground rounded-xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Sparkles className="size-5 text-amber-500 fill-amber-500/10 animate-pulse" /> Custom Automation Rule Builder
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            
            {/* WHEN Trigger */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <PlayCircle className="size-3.5 text-muted-foreground" /> Trigger: When...
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select value={whenType} onValueChange={handleWhenTypeChange}>
                  <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="CREATED" className="text-xs cursor-pointer">An issue is created</SelectItem>
                    <SelectItem value="STATUS_TO" className="text-xs cursor-pointer">Status changes to...</SelectItem>
                    <SelectItem value="PRIORITY_TO" className="text-xs cursor-pointer">Priority is updated to...</SelectItem>
                  </SelectContent>
                </Select>

                {whenType === 'STATUS_TO' && (
                  <Select value={whenValue} onValueChange={setWhenValue}>
                    <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs cursor-pointer">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {whenType === 'PRIORITY_TO' && (
                  <Select value={whenValue} onValueChange={setWhenValue}>
                    <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs cursor-pointer">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* IF Condition */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="size-3.5 text-muted-foreground" /> Condition: If... (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select value={ifType} onValueChange={handleIfTypeChange}>
                  <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="ALWAYS" className="text-xs cursor-pointer">No condition (always execute)</SelectItem>
                    <SelectItem value="UNASSIGNED" className="text-xs cursor-pointer">The issue is unassigned</SelectItem>
                    <SelectItem value="SQUAD_IS" className="text-xs cursor-pointer">Issue belongs to squad...</SelectItem>
                    <SelectItem value="PRIORITY_IS" className="text-xs cursor-pointer">Issue priority level is...</SelectItem>
                  </SelectContent>
                </Select>

                {ifType === 'SQUAD_IS' && (
                  <Select value={ifValue} onValueChange={setIfValue}>
                    <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue placeholder="Select Squad..." /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      {teams.length === 0 ? (
                        <SelectItem value="none" disabled className="text-xs">No squads found</SelectItem>
                      ) : (
                        teams.map(t => (
                          <SelectItem key={t.id} value={t.id} className="text-xs cursor-pointer">{t.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}

                {ifType === 'PRIORITY_IS' && (
                  <Select value={ifValue} onValueChange={setIfValue}>
                    <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs cursor-pointer">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* THEN Action */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Play className="size-3.5 text-muted-foreground" /> Action: Then...
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select value={thenType} onValueChange={handleThenTypeChange}>
                  <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="MOVE_STATUS" className="text-xs cursor-pointer">Transition task status to...</SelectItem>
                    <SelectItem value="ASSIGN_MEMBER" className="text-xs cursor-pointer">Assign task to member...</SelectItem>
                    <SelectItem value="SET_PRIORITY" className="text-xs cursor-pointer">Update task priority to...</SelectItem>
                    <SelectItem value="CHECKLIST_TEMPLATE" className="text-xs cursor-pointer">Populate onboarding checklist</SelectItem>
                    <SelectItem value="ALERT_LOG" className="text-xs cursor-pointer">Log system notifications alert</SelectItem>
                  </SelectContent>
                </Select>

                {thenType === 'MOVE_STATUS' && (
                  <Select value={thenValue} onValueChange={setThenValue}>
                    <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs cursor-pointer">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {thenType === 'ASSIGN_MEMBER' && (
                  <Select value={thenValue} onValueChange={setThenValue}>
                    <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue placeholder="Select Member..." /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      {members.length === 0 ? (
                        <SelectItem value="none" disabled className="text-xs">No members found</SelectItem>
                      ) : (
                        members.map(m => (
                          <SelectItem key={m.id} value={m.id} className="text-xs cursor-pointer">{getUserName(m)}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}

                {thenType === 'SET_PRIORITY' && (
                  <Select value={thenValue} onValueChange={setThenValue}>
                    <SelectTrigger className="h-9.5 text-xs bg-background border-border rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs cursor-pointer">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

          </div>

          <DialogFooter className="gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
              className="border-border hover:bg-muted text-muted-foreground text-xs rounded-lg font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveCustomRule}
              disabled={
                (ifType === 'SQUAD_IS' && !ifValue) || 
                (thenType === 'ASSIGN_MEMBER' && !thenValue)
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs rounded-lg font-semibold"
            >
              Save Rule Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
