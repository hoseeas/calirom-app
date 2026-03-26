'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = {
  label: string
  href: string
}

type ProjectHeaderProps = {
  projectId: string
  projectName: string
  projectColor?: string
}

export default function ProjectHeader({
  projectId,
  projectName,
  projectColor = '#6B7280',
}: ProjectHeaderProps) {
  const pathname = usePathname()

  const tabs: Tab[] = [
    { label: 'Overview', href: `/projects/${projectId}/overview` },
    { label: 'List', href: `/projects/${projectId}/list` },
    { label: 'Board', href: `/projects/${projectId}/board` },
    { label: 'Timeline', href: `/projects/${projectId}/timeline` },
    { label: 'Calendar', href: `/projects/${projectId}/calendar` },
    { label: 'Dashboard', href: `/projects/${projectId}/dashboard` },
    { label: 'Messages', href: `/projects/${projectId}/messages` },
    { label: 'Workflow', href: `/projects/${projectId}/workflow` },
    { label: 'Files', href: `/projects/${projectId}/files` },
  ]

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white">
      {/* Project title */}
      <div className="flex items-center gap-3 px-6 pt-4 pb-3">
        <span
          className="h-3 w-3 rounded-sm shrink-0"
          style={{ backgroundColor: projectColor }}
        />
        <h1 className="text-lg font-semibold text-gray-900">{projectName}</h1>
      </div>

      {/* Tabs */}
      <nav className="flex items-end gap-0 px-6" aria-label="Project tabs">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
