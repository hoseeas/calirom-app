'use client'

import { useState, useTransition, useRef } from 'react'
import { format } from 'date-fns'
import {
  CheckCircle2,
  Circle,
  X,
  Send,
  ChevronDown,
  MessageSquare,
  ListTodo,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  toggleJobCompletion,
  addComment,
} from '@/app/actions/jobs'
import CustomFieldCell from './CustomFieldCell'
import EnumTag from './EnumTag'

type User = {
  id: string
  name: string
  initials?: string | null
  avatarColor: string
}

type Subtask = {
  id: string
  name: string
  isCompleted: boolean
}

type Comment = {
  id: string
  content: string
  createdAt: Date
  author: User
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

type Job = {
  id: string
  name: string
  description?: string | null
  isCompleted: boolean
  dueDate?: Date | null
  sectionId?: string | null
  assignees: { user: User }[]
  customFieldValues: CustomFieldValue[]
  subtasks: Subtask[]
  comments: Comment[]
}

type Section = {
  id: string
  name: string
}

type Project = {
  id: string
  name: string
  sections: Section[]
}

type JobDetailPanelProps = {
  job: Job
  project: Project
  customFields: CustomFieldDefinition[]
  open: boolean
  onClose: () => void
  currentUserId?: string
}

export default function JobDetailPanel({
  job,
  project,
  customFields,
  open,
  onClose,
  currentUserId,
}: JobDetailPanelProps) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(
    job.isCompleted
  )
  const [commentText, setCommentText] = useState('')
  const [isPending, startTransition] = useTransition()
  const commentRef = useRef<HTMLTextAreaElement>(null)

  const section = project.sections.find((s) => s.id === job.sectionId)

  function handleToggleComplete() {
    setOptimisticCompleted((prev) => !prev)
    startTransition(async () => {
      await toggleJobCompletion(job.id)
    })
  }

  function handleAddComment() {
    const content = commentText.trim()
    if (!content || !currentUserId) return
    setCommentText('')
    startTransition(async () => {
      await addComment(job.id, content, currentUserId)
    })
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-xl flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 shrink-0">
          <button
            onClick={handleToggleComplete}
            disabled={isPending}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
          >
            {optimisticCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
            <span
              className={optimisticCompleted ? 'text-green-600' : 'text-gray-600'}
            >
              {optimisticCompleted ? 'Completed' : 'Mark complete'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            {job.assignees.slice(0, 3).map(({ user }) => (
              <Avatar key={user.id} size="sm">
                <AvatarFallback
                  className="text-white text-xs"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.initials ?? user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            <button
              onClick={onClose}
              className="ml-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Title */}
          <SheetHeader className="px-5 pt-5 pb-4">
            <SheetTitle className="text-lg font-semibold text-gray-900 leading-tight">
              {job.name}
            </SheetTitle>
          </SheetHeader>

          {/* Meta fields */}
          <div className="px-5 space-y-3 pb-5">
            {/* Assignees */}
            <div className="flex items-center gap-4">
              <span className="w-28 text-xs font-medium text-gray-500 shrink-0">
                Assignee
              </span>
              <div className="flex items-center gap-1">
                {job.assignees.length === 0 ? (
                  <span className="text-sm text-gray-400">None</span>
                ) : (
                  job.assignees.map(({ user }) => (
                    <span
                      key={user.id}
                      className="text-sm text-gray-700"
                    >
                      {user.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Due date */}
            <div className="flex items-center gap-4">
              <span className="w-28 text-xs font-medium text-gray-500 shrink-0">
                Due Date
              </span>
              <span className="text-sm text-gray-700">
                {job.dueDate
                  ? format(new Date(job.dueDate), 'MMM d, yyyy')
                  : <span className="text-gray-400">None</span>}
              </span>
            </div>

            {/* Section */}
            <div className="flex items-center gap-4">
              <span className="w-28 text-xs font-medium text-gray-500 shrink-0">
                Section
              </span>
              <span className="text-sm text-gray-700">
                {section?.name ?? <span className="text-gray-400">None</span>}
              </span>
            </div>

            {/* Custom fields */}
            {customFields.length > 0 && (
              <div className="border-t border-gray-100 pt-3 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Custom Fields
                </p>
                {customFields.map((field) => {
                  const value = job.customFieldValues.find(
                    (v) => v.fieldDefinitionId === field.id
                  )
                  return (
                    <div key={field.id} className="flex items-center gap-4">
                      <span className="w-28 text-xs font-medium text-gray-500 shrink-0">
                        {field.name}
                      </span>
                      <CustomFieldCell
                        fieldType={field.fieldType}
                        value={value}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="border-t border-gray-100 px-5 py-4">
            <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Description
            </p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {job.description || (
                <span className="text-gray-400 italic">
                  No description yet.
                </span>
              )}
            </p>
          </div>

          {/* Subtasks */}
          {job.subtasks.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <ListTodo className="h-3.5 w-3.5" />
                Subtasks ({job.subtasks.filter((s) => s.isCompleted).length}/
                {job.subtasks.length})
              </p>
              <ul className="space-y-2">
                {job.subtasks.map((subtask) => (
                  <li
                    key={subtask.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    {subtask.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                    )}
                    <span
                      className={
                        subtask.isCompleted
                          ? 'line-through text-gray-400'
                          : 'text-gray-700'
                      }
                    >
                      {subtask.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comments */}
          <div className="border-t border-gray-100 px-5 py-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5" />
              Comments ({job.comments.length})
            </p>

            {job.comments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No comments yet.</p>
            ) : (
              <ul className="space-y-4 mb-4">
                {job.comments.map((comment) => (
                  <li key={comment.id} className="flex gap-3">
                    <Avatar size="sm" className="shrink-0 mt-0.5">
                      <AvatarFallback
                        className="text-white text-xs"
                        style={{ backgroundColor: comment.author.avatarColor }}
                      >
                        {comment.author.initials ??
                          comment.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Add comment */}
            {currentUserId && (
              <div className="flex gap-3">
                <Avatar size="sm" className="shrink-0 mt-1">
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                    Me
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    ref={commentRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddComment()
                      }
                    }}
                  />
                  <div className="mt-1.5 flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || isPending}
                      className="gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
