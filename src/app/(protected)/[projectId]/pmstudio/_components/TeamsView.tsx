import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, LayoutGrid, Activity, MoreHorizontal, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface TeamsViewProps {
  teams: any[]
  tasks: any[]
  newTeamName: string
  setNewTeamName: (name: string) => void
  onCreateTeam: () => void
  isCreatingTeam: boolean
}

export function TeamsView({
  teams,
  tasks,
  newTeamName,
  setNewTeamName,
  onCreateTeam,
  isCreatingTeam,
}: TeamsViewProps) {
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Directory Header Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative h-full max-w-6xl mx-auto px-8 flex flex-col justify-end pb-8">
          <div className="flex items-end justify-between">
            <div className="text-white space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">Teams Directory</h1>
              <p className="text-blue-100 font-medium">Manage cross-functional teams and track their sprint velocity.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
              <Input
                placeholder="New team name..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-48 h-10 border-0 bg-transparent text-white placeholder-blue-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTeamName.trim() && !isCreatingTeam) {
                    onCreateTeam()
                  }
                }}
              />
              <Button
                onClick={onCreateTeam}
                disabled={!newTeamName.trim() || isCreatingTeam}
                className="h-10 bg-white text-blue-700 hover:bg-blue-50 rounded-lg shadow-sm font-bold px-4"
              >
                <Plus className="size-4 mr-1.5" /> Create
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid className="size-4" /> Active Sub-Teams ({teams.length})
            </h3>
          </div>

          {teams.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border bg-card/50 rounded-3xl">
              <div className="size-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
                <Users className="size-8" />
              </div>
              <p className="text-lg font-bold text-foreground">No teams found</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Create your first sub-team using the input field in the header to start organizing tasks by departments or squads.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => {
                const teamTasks = tasks.filter(t => t.subTeamId === team.id)
                const doneTasks = teamTasks.filter(t => t.status === 'DONE')
                const inProgressTasks = teamTasks.filter(t => t.status === 'IN_PROGRESS')
                const percentage = teamTasks.length > 0 ? Math.round((doneTasks.length / teamTasks.length) * 100) : 0
                
                // Get initials for team avatar
                const initials = team.name.substring(0, 2).toUpperCase()

                return (
                  <Card key={team.id} className="group overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl bg-card">
                    <CardHeader className="p-0">
                      <div className="h-12 bg-muted/40 border-b border-border flex items-center justify-between px-5">
                        <Badge variant="outline" className="bg-background border-border shadow-sm text-[10px] uppercase font-bold tracking-wider">
                          Squad
                        </Badge>
                        <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <Avatar className="size-12 rounded-xl border border-border shadow-sm">
                          <AvatarFallback className="bg-blue-600 text-white font-bold text-lg rounded-xl">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-foreground truncate">{team.name}</h4>
                          <p className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-1.5">
                            <Activity className="size-3.5" /> {teamTasks.length} total tasks
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Velocity Progress</p>
                            <p className="text-2xl font-extrabold text-foreground tracking-tight">{percentage}%</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1 justify-end">
                              <CheckCircle2 className="size-3" /> Done
                            </p>
                            <p className="text-sm font-bold text-emerald-500">{doneTasks.length} <span className="text-muted-foreground text-xs font-semibold">/ {teamTasks.length}</span></p>
                          </div>
                        </div>

                        <Progress value={percentage} className="h-2.5 bg-muted" />
                        
                        <div className="pt-4 flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {/* Mocking team members for visual completion matching Atlassian */}
                            {[1,2,3].map(i => (
                              <div key={i} className="size-7 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                                <Users className="size-3.5 text-muted-foreground/50" />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground ml-2">Team capacity</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
