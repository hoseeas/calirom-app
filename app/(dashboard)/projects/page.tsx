import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'

export default async function ProjectsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId: session.workspaceId },
    include: {
      _count: {
        select: { jobs: true, members: true },
      },
    },
    orderBy: { position: 'asc' },
  })

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Plus className="h-4 w-4" />
            New project
          </button>
        </div>
      </div>

      {/* Projects grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 mb-4">
              <Plus className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first print job project.
            </p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
              <Plus className="h-4 w-4" />
              New project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                {/* Color bar */}
                <div
                  className="mb-4 h-1.5 w-10 rounded-full"
                  style={{ backgroundColor: project.color }}
                />

                {/* Project name */}
                <h2 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                  {project.name}
                </h2>

                {/* Meta */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  <span>
                    {project._count.jobs} job{project._count.jobs !== 1 ? 's' : ''}
                  </span>
                  <span>
                    {project._count.members} member{project._count.members !== 1 ? 's' : ''}
                  </span>
                  {project.isStarred && (
                    <span className="text-yellow-500">★ Starred</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
