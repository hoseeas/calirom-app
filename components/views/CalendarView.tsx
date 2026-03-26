'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, SlidersHorizontal, Plus } from 'lucide-react'

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
  jobs: Job[]
}

type Project = {
  id: string
  name: string
  color: string
  sections: Section[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Returns weekday index where Mon=0, Tue=1 ... Fri=4 (Sat/Sun excluded)
// getDay returns: Sun=0 Mon=1 ... Sat=6
function getWeekdayIndex(date: Date): number {
  const d = getDay(date)
  return d - 1 // Mon=0 … Fri=4; Sat=5, Sun=-1 (filtered out)
}

function isWeekend(date: Date): boolean {
  const d = getDay(date)
  return d === 0 || d === 6
}

// Build a 2D grid: rows of 5 cells (Mon–Fri), with nulls for empty cells
function buildCalendarGrid(
  year: number,
  month: number
): (Date | null)[][] {
  const firstDay = startOfMonth(new Date(year, month, 1))
  const lastDay = endOfMonth(firstDay)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })
  const weekdays = days.filter((d) => !isWeekend(d))

  if (weekdays.length === 0) return []

  const rows: (Date | null)[][] = []
  let row: (Date | null)[] = new Array(5).fill(null)

  for (const day of weekdays) {
    const colIdx = getWeekdayIndex(day)
    if (colIdx < 0 || colIdx > 4) continue
    row[colIdx] = day

    // When Friday is filled OR this is the last weekday, push and reset
    if (colIdx === 4 || day === weekdays[weekdays.length - 1]) {
      rows.push(row)
      row = new Array(5).fill(null)
    }
  }

  return rows
}

// ─── Calendar View ────────────────────────────────────────────────────────────

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI']

export default function CalendarView({ project }: { project: Project }) {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const grid = buildCalendarGrid(year, month)

  const allJobs: Job[] = project.sections.flatMap((s) => s.jobs)
  const noDateCount = allJobs.filter((j) => !j.dueDate).length

  function getJobsForDay(day: Date): Job[] {
    return allJobs.filter(
      (j) => j.dueDate && isSameDay(new Date(j.dueDate), day)
    )
  }

  function goToPrevMonth() {
    setCurrentDate((d) => subMonths(d, 1))
  }

  function goToNextMonth() {
    setCurrentDate((d) => addMonths(d, 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2.5 shrink-0 flex-wrap">
        <div className="flex items-center rounded-md border border-gray-200 overflow-hidden">
          <button
            onClick={goToPrevMonth}
            className="px-2 py-1.5 hover:bg-gray-50 transition-colors border-r border-gray-200"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="px-2 py-1.5 hover:bg-gray-50 transition-colors border-l border-gray-200"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>

        <span className="text-sm font-semibold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </span>

        {noDateCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            No date ({noDateCount})
          </span>
        )}

        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-1">
          Months
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>
      </div>

      {/* ── Calendar grid ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Day headers */}
        <div className="grid grid-cols-5 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-semibold text-gray-500 tracking-wide border-r border-gray-100 last:border-r-0"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar rows */}
        {grid.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-5 border-b border-gray-200"
            style={{ minHeight: '120px' }}
          >
            {row.map((day, colIdx) => {
              if (!day) {
                return (
                  <div
                    key={colIdx}
                    className="border-r border-gray-100 last:border-r-0 bg-gray-50/60"
                  />
                )
              }

              const jobs = getJobsForDay(day)
              const isCurrentDay = isToday(day)

              return (
                <div
                  key={colIdx}
                  className="group relative flex flex-col border-r border-gray-100 last:border-r-0 p-2 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold leading-none ${
                        isCurrentDay
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Task pills */}
                  <div className="flex flex-col gap-1 flex-1">
                    {jobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center gap-1 rounded px-1.5 py-0.5 bg-indigo-100 hover:bg-indigo-200 transition-colors cursor-pointer"
                      >
                        {job.assignees[0] && (
                          <div
                            className="h-3.5 w-3.5 rounded-full shrink-0 flex items-center justify-center text-white"
                            style={{
                              backgroundColor: job.assignees[0].user.avatarColor,
                              fontSize: '8px',
                              fontWeight: 700,
                            }}
                          >
                            {job.assignees[0].user.initials ??
                              job.assignees[0].user.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs text-indigo-700 font-medium truncate leading-none">
                          {job.name}
                        </span>
                      </div>
                    ))}

                    {jobs.length > 3 && (
                      <span className="text-xs text-gray-400 px-1">
                        +{jobs.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Add task on hover */}
                  <button className="absolute bottom-1.5 right-1.5 hidden group-hover:flex items-center gap-0.5 rounded px-1.5 py-0.5 bg-white border border-gray-200 text-xs text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm">
                    <Plus className="h-3 w-3" />
                    Add task
                  </button>
                </div>
              )
            })}
          </div>
        ))}

        {grid.length === 0 && (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">
            No weekdays in this month
          </div>
        )}
      </div>
    </div>
  )
}
