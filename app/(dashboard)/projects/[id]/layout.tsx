import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import ProjectHeader from '@/components/layout/ProjectHeader'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const { id } = await params

  const project = await prisma.project.findFirst({
    where: {
      id,
      workspaceId: session.workspaceId,
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        projectColor={project.color}
      />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
