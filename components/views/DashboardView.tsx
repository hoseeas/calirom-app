'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Plus } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionStat = {
  name: string
  count: number
}

type DashboardStats = {
  totalCompleted: number
  totalIncomplete: number
  totalOverdue: number
  totalTasks: number
  bySection: SectionStat[]
  byStatus: {
    completed: number
    incomplete: number
  }
}

type DashboardViewProps = {
  stats: DashboardStats
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  filterLabel,
}: {
  label: string
  value: number
  filterLabel: string
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
      </div>
      <p className="mt-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
        {filterLabel}
      </p>
    </div>
  )
}

// ─── Donut legend ─────────────────────────────────────────────────────────────

function DonutLegend({
  data,
  colors,
}: {
  data: { name: string; value: number }[]
  colors: string[]
}) {
  return (
    <ul className="flex flex-col gap-2 justify-center pl-4">
      {data.map((entry, index) => (
        <li key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <span className="text-xs text-gray-600">
            {entry.name}{' '}
            <span className="font-semibold text-gray-800">{entry.value}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

// ─── Donut center label ───────────────────────────────────────────────────────

function DonutCenterLabel({ total }: { total: number }) {
  return (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-gray-900"
    >
      <tspan
        x="50%"
        dy="-6"
        fontSize="28"
        fontWeight="700"
        fill="#111827"
      >
        {total}
      </tspan>
      <tspan
        x="50%"
        dy="22"
        fontSize="11"
        fill="#9CA3AF"
      >
        total tasks
      </tspan>
    </text>
  )
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

export default function DashboardView({ stats }: DashboardViewProps) {
  const {
    totalCompleted,
    totalIncomplete,
    totalOverdue,
    totalTasks,
    bySection,
    byStatus,
  } = stats

  const donutData = [
    { name: 'Completed', value: byStatus.completed },
    { name: 'Incomplete', value: byStatus.incomplete },
  ]
  const DONUT_COLORS = ['#C4B5FD', '#BEF264']

  const barData = bySection.length > 0 ? bySection : [{ name: 'No sections', count: 0 }]

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            Add widget
          </button>
          <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Send feedback
          </button>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total completed tasks"
            value={totalCompleted}
            filterLabel="All time · All sections"
          />
          <StatCard
            label="Total incomplete tasks"
            value={totalIncomplete}
            filterLabel="All time · All sections"
          />
          <StatCard
            label="Total overdue tasks"
            value={totalOverdue}
            filterLabel="Due date passed · Incomplete"
          />
          <StatCard
            label="Total tasks"
            value={totalTasks}
            filterLabel="All time · All sections"
          />
        </div>

        {/* ── Charts row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Bar chart — incomplete by section */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Total incomplete tasks by section
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalIncomplete} incomplete · All sections
                </p>
              </div>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                See all
              </button>
            </div>

            {bySection.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                No incomplete tasks
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={barData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tickFormatter={(v: string) =>
                      v.length > 10 ? v.slice(0, 10) + '…' : v
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: '1px solid #E5E7EB',
                    }}
                    cursor={{ fill: '#F3F4F6' }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donut chart — by completion status */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Total tasks by completion status
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalTasks} total · All time
                </p>
              </div>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                See all
              </button>
            </div>

            {totalTasks === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                No tasks yet
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="40%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={<DonutCenterLabel total={totalTasks} />}
                    >
                      {donutData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      content={<DonutLegend data={donutData} colors={DONUT_COLORS} />}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
