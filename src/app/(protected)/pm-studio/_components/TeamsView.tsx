import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Users, Plus } from 'lucide-react'

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
    <div className="h-full overflow-y-auto bg-slate-50/20 select-none">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Create Team */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-3 bg-slate-50/20">
            <CardTitle className="text-sm font-semibold text-slate-800">Create Sub-Team</CardTitle>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Organize your workspace into specialized divisions (e.g. Frontend, Backend, QA)</p>
          </CardHeader>
          <CardContent className="pt-4.5">
            <div className="flex gap-3">
              <Input
                placeholder="Team name (e.g. Frontend, Backend, QA)"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="flex-1 h-10 border-slate-200 rounded-xl text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTeamName.trim() && !isCreatingTeam) {
                    onCreateTeam()
                  }
                }}
              />
              <Button
                onClick={onCreateTeam}
                disabled={!newTeamName.trim() || isCreatingTeam}
                className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10 gap-1.5 px-4 text-xs font-semibold"
              >
                <Plus className="size-4" /> Add Team
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Sub-Teams ({teams.length})</h3>
          </div>
          {teams.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-100 bg-white rounded-2xl">
              <Users className="size-8 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No sub-teams created yet</p>
              <p className="text-xs text-slate-400 mt-1">Create teams to filter board cards and track custom team velocity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map(team => {
                const teamTasks = tasks.filter(t => t.subTeamId === team.id)
                const doneTasks = teamTasks.filter(t => t.status === 'DONE')
                const percentage = teamTasks.length > 0 ? Math.round((doneTasks.length / teamTasks.length) * 100) : 0
                return (
                  <Card key={team.id} className="hover:shadow-md border border-slate-100 rounded-xl transition-all duration-200">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="size-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                          <Users className="size-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{team.name}</p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{teamTasks.length} tasks assigned</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <span>Team Progress</span>
                          <span className="text-slate-700">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-1.5 bg-slate-100" />
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
