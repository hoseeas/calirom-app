'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Calendar,
  MessageCircle,
  FileText,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type User = {
  id: string
  name: string
  initials?: string | null
  avatarColor: string
  email: string
}

type ProjectMember = {
  projectId: string
  userId: string
  role: string
  user: User
}

type ProjectMessage = {
  id: string
  projectId: string
  title?: string | null
  content: string
  createdAt: Date
}

type Project = {
  id: string
  name: string
  color: string
  status?: string | null
  createdAt: Date
  members: ProjectMember[]
  messages: ProjectMessage[]
}

type JobStats = {
  total: number
  completed: number
}

type ActivityItem = {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string
    initials?: string | null
    avatarColor: string
  }
  job: {
    id: string
    name: string
  }
}

type OverviewViewProps = {
  project: Project
  members: ProjectMember[]
  jobStats: JobStats
  recentActivity: ActivityItem[]
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  {
    key: 'on_track',
    label: 'On track',
    dotColor: 'bg-emerald-500',
    activeClass: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    inactiveClass: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
  },
  {
    key: 'at_risk',
    label: 'At risk',
    dotColor: 'bg-amber-500',
    activeClass: 'bg-amber-50 border-amber-300 text-amber-700',
    inactiveClass: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
  },
  {
    key: 'off_track',
    label: 'Off track',
    dotColor: 'bg-red-500',
    activeClass: 'bg-red-50 border-red-300 text-red-700',
    inactiveClass: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
  },
] as const

// ─── Avatar helper ────────────────────────────────────────────────────────────

function UserAvatar({
  user,
  size = 'md',
}: {
  user: { name: string; initials?: string | null; avatarColor: string }
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = size === 'sm' ? 'h-6 w-6 text-xs' : size === 'lg' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs'
  const initial = user.initials ?? user.name.charAt(0).toUpperCase()
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: user.avatarColor }}
    >
      {initial}
    </div>
  )
}

// ─── Overview View ────────────────────────────────────────────────────────────

export default function OverviewView({
  project,
  members,
  jobStats,
  recentActivity,
}: OverviewViewProps) {
  const [status, setStatus] = useState<string>(project.status ?? '')
  const completionPct =
    jobStats.total === 0
      ? 0
      : Math.round((jobStats.completed / jobStats.total) * 100)

  return (
    <div className="flex h-full overflow-y-auto bg-gray-50">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto px-6 py-6">
        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* Progress bar */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {completionPct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {jobStats.completed} of {jobStats.total} tasks completed
            </p>
          </div>

          {/* Project description */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Project description
            </h2>
            <textarea
              placeholder="What's this project about?"
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300 transition"
            />
          </div>

          {/* Project roles / members */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              Project roles
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {members.map((m) => (
                <div
                  key={m.userId}
                  className="flex flex-col items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-center"
                >
                  <UserAvatar user={m.user} size="lg" />
                  <div>
                    <p className="text-xs font-medium text-gray-800 leading-tight">
                      {m.user.name}
                    </p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">
                      {m.role}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add member ghost card */}
              <button className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white p-3 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors group">
                <div className="h-10 w-10 rounded-full border-2 border-dashed border-gray-300 group-hover:border-indigo-400 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
                </div>
                <p className="text-xs text-gray-400 group-hover:text-indigo-500 font-medium">
                  Add member
                </p>
              </button>
            </div>
          </div>

          {/* Key resources */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              Key resources
            </h2>
            <div className="flex flex-col gap-2">
              {/* Create project brief */}
              <button className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group">
                <div className="h-8 w-8 rounded-md border border-dashed border-gray-300 group-hover:border-indigo-300 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
                </div>
                <span className="font-medium">Create project brief</span>
              </button>

              {/* Messages as resource links */}
              {project.messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {msg.title ?? 'Project message'}
                    </p>
                    <p className="text-xs text-gray-400">Message</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel ─────────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

          {/* Status card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              What's the status?
            </h3>
            <div className="flex flex-col gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatus(opt.key === status ? '' : opt.key)}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    status === opt.key ? opt.activeClass : opt.inactiveClass
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${opt.dotColor}`}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meta info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-sm text-gray-500">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <span>No due date</span>
            </div>
            <button className="flex items-center gap-2.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>Send message to members</span>
            </button>
          </div>

          {/* Activity feed */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Activity
            </h3>

            {recentActivity.length === 0 && members.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No activity yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Member join events */}
                {members.slice(0, 2).map((m) => (
                  <div key={`join-${m.userId}`} className="flex items-start gap-2.5">
                    <UserAvatar user={m.user} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-700 leading-snug">
                        <span className="font-medium">{m.user.name}</span>
                        {' '}joined the project
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(project.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recent comments */}
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <UserAvatar user={item.author} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-700 leading-snug">
                        <span className="font-medium">{item.author.name}</span>
                        {' '}commented on{' '}
                        <span className="font-medium text-indigo-600">
                          {item.job.name}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Project created event */}
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-700 leading-snug">
                      Project <span className="font-medium">{project.name}</span> was created
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(project.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
