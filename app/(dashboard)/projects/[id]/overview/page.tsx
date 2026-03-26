import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import OverviewView from '@/components/views/OverviewView'

export default async function OverviewPage({
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
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              initials: true,
              avatarColor: true,
              email: true,
            },
          },
        },
      },
      customFields: {
        orderBy: { position: 'asc' },
        include: {
          options: { orderBy: { position: 'asc' } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!project) {
    notFound()
  }

  // Job stats
  const totalJobs = await prisma.job.count({
    where: { projectId: id, parentJobId: null },
  })
  const completedJobs = await prisma.job.count({
    where: { projectId: id, parentJobId: null, isCompleted: true },
  })

  // Recent activity: last 5 comments across all project jobs
  const recentComments = await prisma.comment.findMany({
    where: {
      job: { projectId: id },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          initials: true,
          avatarColor: true,
        },
      },
      job: {
        select: { id: true, name: true },
      },
    },
  })

  return (
    <OverviewView
      project={project}
      members={project.members}
      jobStats={{ total: totalJobs, completed: completedJobs }}
      recentActivity={recentComments}
    />
  )
}
