'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Home,
  Inbox,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Plus,
  LogOut,
  Printer,
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

type Project = {
  id: string
  name: string
  color: string
  isStarred: boolean
}

type SidebarProps = {
  user: {
    name: string
    email: string
    initials?: string | null
    avatarColor?: string
  }
  projects: Project[]
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        isActive
          ? 'bg-white/10 text-white font-medium'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

function ProjectItem({ project }: { project: Project }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(`/projects/${project.id}`)

  return (
    <Link
      href={`/projects/${project.id}`}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        isActive
          ? 'bg-white/10 text-white font-medium'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-sm"
        style={{ backgroundColor: project.color }}
      />
      <span className="truncate">{project.name}</span>
    </Link>
  )
}

function SectionHeader({
  label,
  isOpen,
  onToggle,
}: {
  label: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-1 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
    >
      {isOpen ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronRight className="h-3 w-3" />
      )}
      {label}
    </button>
  )
}

export default function Sidebar({ user, projects }: SidebarProps) {
  const router = useRouter()
  const [starredOpen, setStarredOpen] = useState(true)
  const [projectsOpen, setProjectsOpen] = useState(true)

  const starredProjects = projects.filter((p) => p.isStarred)
  const allProjects = projects

  const initials =
    user.initials ||
    user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  async function handleLogout() {
    await logoutAction()
    router.push('/login')
  }

  return (
    <aside
      className="flex h-screen w-60 shrink-0 flex-col overflow-hidden"
      style={{ backgroundColor: '#1e1e2e' }}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
          <Printer className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold text-white">Calirom</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 pb-0">
        {/* Main nav */}
        <div className="mb-2 space-y-0.5">
          <NavItem href="/" icon={Home} label="Home" />
          <NavItem href="/inbox" icon={Inbox} label="Inbox" />
          <NavItem href="/my-tasks" icon={CheckSquare} label="My Tasks" />
        </div>

        {/* Starred */}
        {starredProjects.length > 0 && (
          <div className="mb-2">
            <SectionHeader
              label="Starred"
              isOpen={starredOpen}
              onToggle={() => setStarredOpen((v) => !v)}
            />
            {starredOpen && (
              <div className="mt-0.5 space-y-0.5">
                {starredProjects.map((project) => (
                  <ProjectItem key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects */}
        <div className="mb-2">
          <SectionHeader
            label="Projects"
            isOpen={projectsOpen}
            onToggle={() => setProjectsOpen((v) => !v)}
          />
          {projectsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {allProjects.map((project) => (
                <ProjectItem key={project.id} project={project} />
              ))}
              <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                <Plus className="h-4 w-4" />
                <span>New project</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* User / Logout */}
      <div className="shrink-0 border-t border-white/10 p-2">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: user.avatarColor || '#6B7280' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
