import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import BoardView from '@/components/views/BoardView'

export default async function BoardPage({
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
              customFieldValues: {
                include: {
                  enumOption: true,
                  fieldDefinition: true,
                },
              },
              subtasks: {
                select: { id: true, name: true, isCompleted: true },
              },
            },
          },
        },
      },
      customFields: {
        orderBy: { position: 'asc' },
        include: {
          options: {
            orderBy: { position: 'asc' },
          },
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  return <BoardView project={project} />
}
