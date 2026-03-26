import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import TimelineView from '@/components/views/TimelineView'

export default async function TimelinePage({
  params,
}: {
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
    include: {
      sections: {
        orderBy: { position: 'asc' },
        include: {
          jobs: {
            orderBy: { position: 'asc' },
            where: { parentJobId: null },
            include: {
              assignees: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      initials: true,
                      avatarColor: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  return <TimelineView project={project} />
}
