'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { format } from 'date-fns'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toggleJobCompletion, createJob } from '@/app/actions/jobs'
import CustomFieldCell from '@/components/job/CustomFieldCell'
import JobDetailPanel from '@/components/job/JobDetailPanel'

type User = {
  id: string
  name: string
  initials?: string | null
  avatarColor: string
}

type EnumOption = {
  id: string
  name: string
  color: string
  position: number
}

type CustomFieldDefinition = {
  id: string
  name: string
  fieldType: string
  position: number
  options: EnumOption[]
}

type CustomFieldValue = {
  id: string
  fieldDefinitionId: string
  textValue?: string | null
  numberValue?: number | null
  booleanValue?: boolean | null
  enumOptionId?: string | null
  enumOption?: EnumOption | null
  fieldDefinition?: { fieldType: string } | null
}

type Subtask = {
  id: string
  name: string
  isCompleted: boolean
}

type Job = {
  id: string
  name: string
  description?: string | null
  isCompleted: boolean
  dueDate?: Date | null
  sectionId?: string | null
  position: number
  assignees: { user: User }[]
  customFieldValues: CustomFieldValue[]
  subtasks: Subtask[]
}

type JobWithComments = Job & {
  comments: { id: string; content: string; createdAt: Date; author: User }[]
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
  customFields: CustomFieldDefinition[]
}

type ListViewProps = {
  project: Project
}

export default function ListView({ project }: ListViewProps) {
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({})
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [addingToSection, setAddingToSection] = useState<string | null>(null)
  const [newJobName, setNewJobName] = useState('')
  const [isPending, startTransition] = useTransition()

  // Find selected job across all sections
  const selectedJob = selectedJobId
    ? project.sections
        .flatMap((s) => s.jobs)
        .find((j) => j.id === selectedJobId)
    : null

  function toggleSection(sectionId: string) {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  function handleToggleJob(jobId: string) {
    startTransition(async () => {
      await toggleJobCompletion(jobId)
    })
  }

  function handleAddJob(sectionId: string) {
    if (!newJobName.trim()) {
      setAddingToSection(null)
      return
    }
    startTransition(async () => {
      await createJob({
        name: newJobName.trim(),
        sectionId,
        projectId: project.id,
      })
    })
    setNewJobName('')
    setAddingToSection(null)
  }

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* Main list area */}
      <div className="flex-1 overflow-y-auto">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-2.5">
          <Button size="sm" className="gap-1.5 h-7">
            <Plus className="h-3.5 w-3.5" />
            Add task
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-gray-500">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-gray-500">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </Button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-sm">
          {/* Table header */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-8 px-3 py-2" />
              <th className="min-w-[240px] px-3 py-2 text-left text-xs font-semibold text-gray-500">
                Name
              </th>
              {project.customFields.map((field) => (
                <th
                  key={field.id}
                  className="min-w-[120px] px-3 py-2 text-left text-xs font-semibold text-gray-500"
                >
                  {field.name}
                </th>
              ))}
              <th className="min-w-[100px] px-3 py-2 text-left text-xs font-semibold text-gray-500">
                Due Date
              </th>
              <th className="min-w-[120px] px-3 py-2 text-left text-xs font-semibold text-gray-500">
                Assignee
              </th>
            </tr>
          </thead>

          <tbody>
            {project.sections.map((section) => {
              const isCollapsed = collapsedSections[section.id] ?? false
              const completedCount = section.jobs.filter(
                (j) => j.isCompleted
              ).length

              return (
                <>
                  {/* Section header row */}
                  <tr
                    key={`section-${section.id}`}
                    className="border-b border-gray-200 bg-gray-50/80"
                  >
                    <td className="px-3 py-2" colSpan={3 + project.customFields.length}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                        <span>{section.name}</span>
                        <span className="text-xs font-normal text-gray-400">
                          {completedCount}/{section.jobs.length}
                        </span>
                      </button>
                    </td>
                  </tr>

                  {/* Job rows */}
                  {!isCollapsed &&
                    section.jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="group border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedJobId(job.id)}
                      >
                        {/* Checkbox */}
                        <td className="w-8 px-3 py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleJob(job.id)
                            }}
                            disabled={isPending}
                            className="flex items-center justify-center"
                          >
                            {job.isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </button>
                        </td>

                        {/* Name */}
                        <td className="min-w-[240px] px-3 py-2">
                          <span
                            className={`font-medium ${
                              job.isCompleted
                                ? 'line-through text-gray-400'
                                : 'text-gray-800'
                            }`}
                          >
                            {job.name}
                          </span>
                          {job.subtasks.length > 0 && (
                            <span className="ml-2 text-xs text-gray-400">
                              {job.subtasks.filter((s) => s.isCompleted).length}
                              /{job.subtasks.length}
                            </span>
                          )}
                        </td>

                        {/* Custom field cells */}
                        {project.customFields.map((field) => {
                          const value = job.customFieldValues.find(
                            (v) => v.fieldDefinitionId === field.id
                          )
                          return (
                            <td key={field.id} className="min-w-[120px] px-3 py-2">
                              <CustomFieldCell
                                fieldType={field.fieldType}
                                value={value}
                              />
                            </td>
                          )
                        })}

                        {/* Due date */}
                        <td className="min-w-[100px] px-3 py-2">
                          {job.dueDate ? (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {format(new Date(job.dueDate), 'MMM d')}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Assignees */}
                        <td className="min-w-[120px] px-3 py-2">
                          {job.assignees.length === 0 ? (
                            <span className="text-gray-300">—</span>
                          ) : (
                            <div className="flex items-center -space-x-1.5">
                              {job.assignees.slice(0, 3).map(({ user }) => (
                                <Avatar key={user.id} size="sm">
                                  <AvatarFallback
                                    className="text-white text-xs ring-2 ring-white"
                                    style={{ backgroundColor: user.avatarColor }}
                                  >
                                    {user.initials ??
                                      user.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}

                  {/* Add task row */}
                  {!isCollapsed && (
                    <tr
                      key={`add-${section.id}`}
                      className="border-b border-gray-100"
                    >
                      <td />
                      <td
                        className="px-3 py-1.5"
                        colSpan={2 + project.customFields.length}
                      >
                        {addingToSection === section.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={newJobName}
                            onChange={(e) => setNewJobName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddJob(section.id)
                              if (e.key === 'Escape') {
                                setAddingToSection(null)
                                setNewJobName('')
                              }
                            }}
                            onBlur={() => handleAddJob(section.id)}
                            placeholder="Task name…"
                            className="w-full max-w-sm rounded border border-indigo-300 px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        ) : (
                          <button
                            onClick={() => setAddingToSection(section.id)}
                            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add task
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Job Detail Panel */}
      {selectedJob && (
        <JobDetailPanel
          job={
            {
              ...selectedJob,
              comments: [],
            } as JobWithComments
          }
          project={{
            id: project.id,
            name: project.name,
            sections: project.sections.map((s) => ({
              id: s.id,
              name: s.name,
            })),
          }}
          customFields={project.customFields}
          open={!!selectedJob}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  )
}
