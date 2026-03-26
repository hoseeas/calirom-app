'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { Plus, CheckCircle2, Circle } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { moveJobToSection, createJob, toggleJobCompletion } from '@/app/actions/jobs'
import EnumTag from '@/components/job/EnumTag'
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

type BoardViewProps = {
  project: Project
}

// ─── Sortable Job Card ────────────────────────────────────────────────────────

type JobCardProps = {
  job: Job
  customFields: CustomFieldDefinition[]
  onClick: () => void
  onToggle: () => void
  isDragging?: boolean
}

function JobCard({ job, customFields, onClick, onToggle, isDragging }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  // Collect ENUM field values to show as tags
  const enumValues = customFields
    .filter((f) => f.fieldType === 'ENUM')
    .map((f) => {
      const val = job.customFieldValues.find(
        (v) => v.fieldDefinitionId === f.id
      )
      return val?.enumOption ?? null
    })
    .filter(Boolean) as EnumOption[]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'shadow-lg ring-2 ring-indigo-300' : ''
      }`}
      onClick={(e) => {
        // Only open panel if not drag-ended
        onClick()
      }}
    >
      {/* Enum tags */}
      {enumValues.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {enumValues.map((opt) => (
            <EnumTag key={opt.id} color={opt.color} label={opt.name} />
          ))}
        </div>
      )}

      {/* Job name + checkbox */}
      <div className="flex items-start gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="mt-0.5 shrink-0"
        >
          {job.isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
          )}
        </button>
        <span
          className={`text-sm font-medium leading-snug ${
            job.isCompleted
              ? 'line-through text-gray-400'
              : 'text-gray-800'
          }`}
        >
          {job.name}
        </span>
      </div>

      {/* Footer: due date + assignees */}
      <div className="mt-2.5 flex items-center justify-between">
        <span>
          {job.dueDate ? (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {format(new Date(job.dueDate), 'MMM d')}
            </span>
          ) : null}
        </span>
        {job.assignees.length > 0 && (
          <div className="flex items-center -space-x-1.5">
            {job.assignees.slice(0, 2).map(({ user }) => (
              <Avatar key={user.id} size="sm">
                <AvatarFallback
                  className="text-white text-xs ring-2 ring-white"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.initials ?? user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Board View ───────────────────────────────────────────────────────────────

export default function BoardView({ project }: BoardViewProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [addingToSection, setAddingToSection] = useState<string | null>(null)
  const [newJobName, setNewJobName] = useState('')
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const allJobs = project.sections.flatMap((s) => s.jobs)
  const selectedJob = selectedJobId
    ? allJobs.find((j) => j.id === selectedJobId)
    : null
  const activeJob = activeJobId
    ? allJobs.find((j) => j.id === activeJobId)
    : null

  function handleDragStart(event: DragStartEvent) {
    setActiveJobId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveJobId(null)

    if (!over) return

    const jobId = String(active.id)
    const overId = String(over.id)

    // Find which section the dragged job came from
    const sourceSection = project.sections.find((s) =>
      s.jobs.some((j) => j.id === jobId)
    )

    // over.id can be a job id or a section id (column droppable)
    const targetSection =
      project.sections.find((s) => s.id === overId) ??
      project.sections.find((s) => s.jobs.some((j) => j.id === overId))

    if (!sourceSection || !targetSection) return
    if (sourceSection.id === targetSection.id) return

    startTransition(async () => {
      await moveJobToSection(jobId, targetSection.id)
    })
  }

  function handleAddCard(sectionId: string) {
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

  function handleToggleJob(jobId: string) {
    startTransition(async () => {
      await toggleJobCompletion(jobId)
    })
  }

  return (
    <div className="flex h-full overflow-x-auto bg-[#F4F5F7] px-6 py-5 gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {project.sections.map((section) => (
          <div
            key={section.id}
            className="flex w-72 shrink-0 flex-col rounded-xl bg-white shadow-sm border border-gray-200"
            id={section.id}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {section.name}
                </h3>
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                  {section.jobs.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <SortableContext
              items={section.jobs.map((j) => j.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2 flex-1 overflow-y-auto p-3 min-h-[60px]">
                {section.jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    customFields={project.customFields}
                    onClick={() => setSelectedJobId(job.id)}
                    onToggle={() => handleToggleJob(job.id)}
                  />
                ))}

                {/* Add card input */}
                {addingToSection === section.id && (
                  <input
                    autoFocus
                    type="text"
                    value={newJobName}
                    onChange={(e) => setNewJobName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCard(section.id)
                      if (e.key === 'Escape') {
                        setAddingToSection(null)
                        setNewJobName('')
                      }
                    }}
                    onBlur={() => handleAddCard(section.id)}
                    placeholder="Card title…"
                    className="w-full rounded-lg border border-indigo-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                )}
              </div>
            </SortableContext>

            {/* Add card button */}
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => {
                  setAddingToSection(section.id)
                  setNewJobName('')
                }}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add card
              </button>
            </div>
          </div>
        ))}

        {/* Drag overlay */}
        <DragOverlay>
          {activeJob ? (
            <div className="w-72 rounded-lg border border-indigo-300 bg-white p-3 shadow-xl opacity-95">
              <span className="text-sm font-medium text-gray-800">
                {activeJob.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
