'use client'

import { useState, useRef } from 'react'
import {
  format,
  addWeeks,
  startOfWeek,
  endOfWeek,
  getWeek,
  isWithinInterval,
  isToday,
  startOfDay,
  eachDayOfInterval,
  isSameWeek,
} from 'date-fns'
import { ChevronDown, ChevronRight, ChevronLeft, SlidersHorizontal, ArrowUpDown } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type User = {
  id: string
  name: string
  initials?: string | null
  avatarColor: string
}

type Job = {
  id: string
  name: string
  isCompleted: boolean
  dueDate?: Date | null
  assignees: { user: User }[]
}

type Section = {
  id: string
  name: string
  position: number
  jobs: Job[]
}

type Project = {
  id: string
  name: string
  color: string
  sections: Section[]
}

type WeekColumn = {
  weekNum: number
  start: Date
  end: Date
  monthLabel: string
  monthIndex: number
  year: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWeekColumns(totalWeeks = 14): WeekColumn[] {
  const today = new Date()
  // Start 2 weeks before today
  const startDate = startOfWeek(addWeeks(today, -2), { weekStartsOn: 1 })
  const cols: WeekColumn[] = []
  for (let i = 0; i < totalWeeks; i++) {
    const weekStart = addWeeks(startDate, i)
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    cols.push({
      weekNum: getWeek(weekStart, { weekStartsOn: 1 }),
      start: weekStart,
      end: weekEnd,
      monthLabel: format(weekStart, 'MMMM yyyy'),
      monthIndex: weekStart.getMonth(),
      year: weekStart.getFullYear(),
    })
  }
  return cols
}

function getJobWeekIndex(
  dueDate: Date,
  cols: WeekColumn[]
): number {
  const d = startOfDay(new Date(dueDate))
  for (let i = 0; i < cols.length; i++) {
    if (
      isWithinInterval(d, {
        start: startOfDay(cols[i].start),
        end: startOfDay(cols[i].end),
      })
    ) {
      return i
    }
  }
  return -1
}

function getTodayColumnIndex(cols: WeekColumn[]): number {
  const today = new Date()
  for (let i = 0; i < cols.length; i++) {
    if (isSameWeek(today, cols[i].start, { weekStartsOn: 1 })) {
      return i
    }
  }
  return -1
}

// Group consecutive columns by month for the top header row
function buildMonthSpans(
  cols: WeekColumn[]
): { label: string; span: number; startIdx: number }[] {
  const spans: { label: string; span: number; startIdx: number }[] = []
  let current = { label: cols[0].monthLabel, span: 1, startIdx: 0 }
  for (let i = 1; i < cols.length; i++) {
    if (cols[i].monthLabel === current.label) {
      current.span++
    } else {
      spans.push(current)
      current = { label: cols[i].monthLabel, span: 1, startIdx: i }
    }
  }
  spans.push(current)
  return spans
}

// ─── Timeline View ────────────────────────────────────────────────────────────

export default function TimelineView({ project }: { project: Project }) {
  const weeks = buildWeekColumns(16)
  const todayColIdx = getTodayColumnIndex(weeks)
  const monthSpans = buildMonthSpans(weeks)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const allJobs = project.sections.flatMap((s) => s.jobs)
  const noDateJobs = allJobs.filter((j) => !j.dueDate)
  const noDateCount = noDateJobs.length

  function toggleSection(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function scrollToToday() {
    if (!scrollRef.current || todayColIdx < 0) return
    // Each week column is ~120px wide; left panel is 224px
    scrollRef.current.scrollLeft = Math.max(0, todayColIdx * 120 - 200)
  }

  const COL_W = 120 // px per week column

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2.5 shrink-0">
        <div className="flex items-center rounded-md border border-gray-200 overflow-hidden">
          <button className="px-2 py-1.5 hover:bg-gray-50 transition-colors border-r border-gray-200">
            <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
          </button>
          <button
            onClick={scrollToToday}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button className="px-2 py-1.5 hover:bg-gray-50 transition-colors border-l border-gray-200">
            <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>

        {noDateCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            No date ({noDateCount})
          </span>
        )}

        <span className="ml-1 text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-1">
          Weeks
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
          <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-56 shrink-0 border-r border-gray-200 overflow-y-auto">
          {/* Spacer for header rows */}
          <div className="h-[52px] border-b border-gray-200 bg-gray-50" />

          {project.sections.map((section) => {
            const isCollapsed = collapsed[section.id] ?? false
            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60 hover:bg-gray-100 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-gray-700 truncate">
                    {section.name}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 shrink-0">
                    {section.jobs.length}
                  </span>
                </button>

                {!isCollapsed &&
                  section.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xs text-gray-700 truncate">
                        {job.name}
                      </span>
                    </div>
                  ))}
              </div>
            )
          })}

          {/* No date section */}
          {noDateCount > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                <span className="text-xs font-semibold text-gray-500">
                  No date
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {noDateCount}
                </span>
              </div>
              {noDateJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs text-gray-500 truncate italic">
                    {job.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right scrollable Gantt */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative"
        >
          <div
            style={{ width: `${weeks.length * COL_W}px`, minWidth: '100%' }}
            className="relative"
          >
            {/* ── Header row 1: month names ── */}
            <div
              className="flex sticky top-0 z-20 border-b border-gray-200 bg-gray-50"
              style={{ height: '26px' }}
            >
              {monthSpans.map((span, i) => (
                <div
                  key={i}
                  className="flex items-center px-3 border-r border-gray-200 shrink-0"
                  style={{ width: `${span.span * COL_W}px` }}
                >
                  <span className="text-xs font-semibold text-gray-600 truncate">
                    {span.label}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Header row 2: week labels ── */}
            <div
              className="flex sticky z-20 border-b border-gray-200 bg-gray-50"
              style={{ top: '26px', height: '26px' }}
            >
              {weeks.map((week, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-center border-r border-gray-200 shrink-0 ${
                    i === todayColIdx ? 'bg-indigo-50' : ''
                  }`}
                  style={{ width: `${COL_W}px` }}
                >
                  <span className="text-xs font-medium text-gray-500">
                    W{week.weekNum}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {format(week.start, 'MMM d')}–{format(week.end, 'd')}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Today vertical line ── */}
            {todayColIdx >= 0 && (
              <div
                className="absolute top-[52px] bottom-0 z-10 pointer-events-none"
                style={{
                  left: `${todayColIdx * COL_W + COL_W / 2}px`,
                  width: '2px',
                  backgroundColor: '#6366f1',
                  opacity: 0.6,
                }}
              />
            )}

            {/* ── Section rows ── */}
            {project.sections.map((section) => {
              const isCollapsed = collapsed[section.id] ?? false
              return (
                <div key={section.id}>
                  {/* Section header row in grid */}
                  <div
                    className="flex border-b border-gray-100 bg-gray-50/50"
                    style={{ height: '36px' }}
                  >
                    {weeks.map((_, i) => (
                      <div
                        key={i}
                        className={`border-r border-gray-100 shrink-0 ${
                          i === todayColIdx ? 'bg-indigo-50/40' : ''
                        }`}
                        style={{ width: `${COL_W}px` }}
                      />
                    ))}
                  </div>

                  {/* Job rows */}
                  {!isCollapsed &&
                    section.jobs.map((job) => {
                      const weekIdx = job.dueDate
                        ? getJobWeekIndex(new Date(job.dueDate), weeks)
                        : -1

                      return (
                        <div
                          key={job.id}
                          className="relative flex border-b border-gray-100"
                          style={{ height: '36px' }}
                        >
                          {weeks.map((_, i) => (
                            <div
                              key={i}
                              className={`border-r border-gray-100 shrink-0 ${
                                i === todayColIdx ? 'bg-indigo-50/30' : ''
                              }`}
                              style={{ width: `${COL_W}px` }}
                            />
                          ))}

                          {/* Task bar */}
                          {weekIdx >= 0 && (
                            <div
                              className="absolute top-1/2 -translate-y-1/2 z-10"
                              style={{
                                left: `${weekIdx * COL_W + 6}px`,
                                width: `${COL_W - 12}px`,
                              }}
                            >
                              <div className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-2 py-1 shadow-sm overflow-hidden">
                                {job.assignees[0] && (
                                  <div
                                    className="h-4 w-4 rounded-full flex items-center justify-center text-white shrink-0"
                                    style={{
                                      backgroundColor:
                                        job.assignees[0].user.avatarColor,
                                      fontSize: '9px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {job.assignees[0].user.initials ??
                                      job.assignees[0].user.name.charAt(0)}
                                  </div>
                                )}
                                <span className="text-white text-xs font-medium truncate">
                                  {job.name}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )
            })}

            {/* No date section rows */}
            {noDateCount > 0 && (
              <div>
                <div
                  className="flex border-b border-gray-100 bg-gray-50/50"
                  style={{ height: '36px' }}
                >
                  {weeks.map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-gray-100 shrink-0"
                      style={{ width: `${COL_W}px` }}
                    />
                  ))}
                </div>
                {noDateJobs.map((job) => (
                  <div
                    key={job.id}
                    className="relative flex border-b border-gray-100"
                    style={{ height: '36px' }}
                  >
                    {weeks.map((_, i) => (
                      <div
                        key={i}
                        className="border-r border-gray-100 shrink-0"
                        style={{ width: `${COL_W}px` }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
