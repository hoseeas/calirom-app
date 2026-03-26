'use client'

import { useState } from 'react'
import { ClipboardList, Plus, UserCircle, Users, Zap } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = {
  id: string
  name: string
  incompleteCount: number
}

type WorkflowViewProps = {
  sections: Section[]
}

// ─── Workflow View ────────────────────────────────────────────────────────────

export default function WorkflowView({ sections }: WorkflowViewProps) {
  const [addMethod, setAddMethod] = useState<'manually' | 'template'>('manually')
  const [selectedSection, setSelectedSection] = useState<Section | null>(
    sections[0] ?? null
  )

  const focusSection = selectedSection ?? sections[0] ?? null

  return (
    <div
      className="relative flex h-full overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundColor: '#f9fafb',
      }}
    >
      <div className="flex items-center justify-center w-full h-full gap-6 px-6 py-8">

        {/* ── Left text ───────────────────────────────────────────────────── */}
        <div className="w-60 shrink-0 hidden lg:block">
          <h2 className="text-xl font-bold text-gray-800 leading-snug">
            Start building your workflow in two minutes
          </h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Automate your team&apos;s process and keep work flowing.
          </p>
        </div>

        {/* ── Center card ─────────────────────────────────────────────────── */}
        <div className="w-80 shrink-0 rounded-xl bg-white shadow-lg border border-gray-100 p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-800">
            How are tasks being added to this project?
          </h3>

          {/* Manually option */}
          <button
            onClick={() => setAddMethod('manually')}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              addMethod === 'manually'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ClipboardList
              className={`h-4 w-4 shrink-0 ${
                addMethod === 'manually' ? 'text-indigo-500' : 'text-gray-400'
              }`}
            />
            Manually
          </button>

          {/* Task templates — show sections */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Task templates
            </p>
            <div className="flex flex-col gap-1">
              {sections.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">
                  No sections yet. Add sections from the List view.
                </p>
              ) : (
                sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setAddMethod('template')
                      setSelectedSection(s)
                    }}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left ${
                      addMethod === 'template' && selectedSection?.id === s.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    {s.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Intake source */}
          <button className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
            <Plus className="h-4 w-4 shrink-0" />
            Intake source
          </button>

          {/* Next */}
          <div className="flex justify-end">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Next
            </button>
          </div>
        </div>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        {focusSection && (
          <div className="w-64 shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hidden xl:flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Section
            </p>
            <p className="text-sm font-bold text-gray-800">
              {focusSection.name}
            </p>
            <p className="text-xs text-gray-400">
              ({focusSection.incompleteCount} incomplete task
              {focusSection.incompleteCount !== 1 ? 's' : ''})
            </p>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                When tasks move to this section, what should happen automatically?
              </p>
              <div className="flex flex-col gap-1.5">
                <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left">
                  <UserCircle className="h-4 w-4 text-gray-300 shrink-0" />
                  Set assignee to
                </button>
                <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left">
                  <Users className="h-4 w-4 text-gray-300 shrink-0" />
                  Add collaborators
                </button>
                <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 transition-colors text-left">
                  <Plus className="h-4 w-4 shrink-0" />
                  More actions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
