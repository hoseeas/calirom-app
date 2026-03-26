'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Send } from 'lucide-react'
import { sendMessage } from '@/app/actions/messages'

// ─── Types ────────────────────────────────────────────────────────────────────

type Author = {
  id: string
  name: string
  initials?: string | null
  avatarColor: string
  email: string
}

type Message = {
  id: string
  projectId: string
  title?: string | null
  content: string
  createdAt: Date
  author?: Author | null
}

type CurrentUser = {
  id: string
  name: string
  email: string
  initials: string
  avatarColor: string
}

type MessagesViewProps = {
  projectId: string
  messages: Message[]
  currentUser: CurrentUser
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  name,
  initials,
  avatarColor,
  size = 'md',
}: {
  name: string
  initials?: string | null
  avatarColor: string
  size?: 'sm' | 'md'
}) {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'
  const display = initials ?? name.charAt(0).toUpperCase()

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: avatarColor }}
    >
      {display}
    </div>
  )
}

// ─── Messages View ────────────────────────────────────────────────────────────

export default function MessagesView({
  projectId,
  messages,
  currentUser,
}: MessagesViewProps) {
  const [draft, setDraft] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return

    const content = draft
    setDraft('')

    startTransition(async () => {
      await sendMessage(projectId, content, currentUser.id)
    })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      <div className="max-w-3xl w-full mx-auto px-6 py-6 flex flex-col gap-4">

        {/* ── Compose card ────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
        >
          <Avatar
            name={currentUser.name}
            initials={currentUser.initials}
            avatarColor={currentUser.avatarColor}
          />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Send message to members..."
            disabled={isPending}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
          {draft.trim() && (
            <button
              type="submit"
              disabled={isPending}
              className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors inline-flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </button>
          )}
        </form>

        {/* ── Empty state or message list ──────────────────────────────────── */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-gray-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                Connect your words to your work
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Send a message to kick off projects.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {msg.author ? (
                    <Avatar
                      name={msg.author.name}
                      initials={msg.author.initials}
                      avatarColor={msg.author.avatarColor}
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gray-200 shrink-0 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">
                        {msg.author?.name ?? 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {msg.title && (
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {msg.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
