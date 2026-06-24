import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts'

interface AnalyticsViewProps {
  tasks: any[]
  activeSprintName: string | null
  analytics: any
}

const COLORS = ['#3b82f6', '#eab308', '#f97316', '#ef4444'] // Blue, Yellow, Orange, Red

export function AnalyticsView({
  tasks,
  activeSprintName,
  analytics,
}: AnalyticsViewProps) {
  const totalCount = tasks.length
  const doneCount = tasks.filter(t => t.status === 'DONE').length
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length

  const priorityData = analytics?.priorityDistribution ? [
    { name: 'Low', value: analytics.priorityDistribution.LOW || 0 },
    { name: 'Medium', value: analytics.priorityDistribution.MEDIUM || 0 },
    { name: 'High', value: analytics.priorityDistribution.HIGH || 0 },
    { name: 'Urgent', value: analytics.priorityDistribution.URGENT || 0 },
  ] : []

  const hasPriorityData = priorityData.some(p => p.value > 0)

  return (
    <ScrollArea className="h-full bg-slate-50/20 select-none">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-100 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Issues</p>
              <p className="text-3xl font-extrabold mt-2 text-slate-800 tabular-nums">{totalCount}</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Completed Issues</p>
              <p className="text-3xl font-extrabold mt-2 text-emerald-600 tabular-nums">{doneCount}</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">In Progress</p>
              <p className="text-3xl font-extrabold mt-2 text-amber-600 tabular-nums">{inProgressCount}</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Sprint</p>
              <p className="text-lg font-bold mt-3 text-slate-700 truncate">{activeSprintName ?? 'No active sprint'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Burndown */}
          <Card className="border border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="pb-3 bg-slate-50/20"><CardTitle className="text-sm font-semibold text-slate-800">Sprint Burndown</CardTitle></CardHeader>
            <CardContent className="pt-4.5">
              <div className="h-[240px]">
                {analytics?.burndown && analytics.burndown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.burndown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(241, 245, 249, 0.8)" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgb(148, 163, 184)' }} stroke="rgba(226, 232, 240, 0.8)" />
                      <YAxis tick={{ fontSize: 10, fill: 'rgb(148, 163, 184)' }} stroke="rgba(226, 232, 240, 0.8)" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid rgb(241, 245, 249)', borderRadius: '12px', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                      <Area type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="4 4" fill="transparent" name="Ideal Remaining" />
                      <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="rgba(59,130,246,0.05)" name="Actual Remaining" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                    No active sprint data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Distribution */}
          <Card className="border border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="pb-3 bg-slate-50/20"><CardTitle className="text-sm font-semibold text-slate-800">Sub-Team Distribution</CardTitle></CardHeader>
            <CardContent className="pt-4.5">
              <div className="h-[240px]">
                {analytics?.teamDistribution && analytics.teamDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={analytics.teamDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(241, 245, 249, 0.8)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgb(148, 163, 184)' }} stroke="rgba(226, 232, 240, 0.8)" />
                      <YAxis tick={{ fontSize: 10, fill: 'rgb(148, 163, 184)' }} stroke="rgba(226, 232, 240, 0.8)" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid rgb(241, 245, 249)', borderRadius: '12px', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                      <Bar dataKey="total" fill="#3b82f6" name="Total Tasks" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                    Create teams and tasks to see distribution
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Velocity */}
          <Card className="border border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="pb-3 bg-slate-50/20"><CardTitle className="text-sm font-semibold text-slate-800">Sprint Velocity</CardTitle></CardHeader>
            <CardContent className="pt-4.5">
              <div className="h-[240px]">
                {analytics?.velocity && analytics.velocity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={analytics.velocity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(241, 245, 249, 0.8)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgb(148, 163, 184)' }} stroke="rgba(226, 232, 240, 0.8)" />
                      <YAxis tick={{ fontSize: 10, fill: 'rgb(148, 163, 184)' }} stroke="rgba(226, 232, 240, 0.8)" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid rgb(241, 245, 249)', borderRadius: '12px', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="completed" fill="#10b981" name="Completed Tasks" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                    Complete sprints to see velocity history
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Priority Breakdown */}
          <Card className="border border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="pb-3 bg-slate-50/20"><CardTitle className="text-sm font-semibold text-slate-800">Priority Breakdown</CardTitle></CardHeader>
            <CardContent className="pt-4.5">
              <div className="h-[240px] flex items-center">
                {hasPriorityData ? (
                  <>
                    <div className="w-[60%] h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                            {priorityData.map((_, idx) => (
                              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid rgb(241, 245, 249)', borderRadius: '12px', fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3 pr-2 select-none">
                      {priorityData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="size-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="font-semibold text-slate-500">{item.name}</span>
                          <span className="font-bold text-slate-800 ml-auto tabular-nums">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                    No tasks with priority data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )
}
