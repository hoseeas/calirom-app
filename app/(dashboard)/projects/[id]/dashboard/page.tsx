import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import DashboardView from '@/components/views/DashboardView'

export default async function DashboardPage({
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
    select: { id: true },
  })

  if (!project) {
    notFound()
  }

  const now = new Date()

  const [totalCompleted, totalIncomplete, totalOverdue, totalTasks] =
    await Promise.all([
      prisma.job.count({
        where: { projectId: id, parentJobId: null, isCompleted: true },
      }),
      prisma.job.count({
        where: { projectId: id, parentJobId: null, isCompleted: false },
      }),
      prisma.job.count({
        where: {
          projectId: id,
          parentJobId: null,
          isCompleted: false,
          dueDate: { lt: now },
        },
      }),
      prisma.job.count({
        where: { projectId: id, parentJobId: null },
      }),
    ])

  // Incomplete jobs grouped by section
  const incompleteSectionGroups = await prisma.job.groupBy({
    by: ['sectionId'],
    where: { projectId: id, parentJobId: null, isCompleted: false },
    _count: { id: true },
  })

  // Fetch section names for the grouped IDs
  const sectionIds = incompleteSectionGroups
    .map((g) => g.sectionId)
    .filter((sid): sid is string => sid !== null)

  const sections = await prisma.section.findMany({
    where: { id: { in: sectionIds } },
    select: { id: true, name: true },
  })

  const sectionMap = new Map(sections.map((s) => [s.id, s.name]))

  const bySection = incompleteSectionGroups.map((g) => ({
    name: g.sectionId ? (sectionMap.get(g.sectionId) ?? 'No section') : 'No section',
    count: g._count.id,
  }))

  const stats = {
    totalCompleted,
    totalIncomplete,
    totalOverdue,
    totalTasks,
    bySection,
    byStatus: {
      completed: totalCompleted,
      incomplete: totalIncomplete,
    },
  }

  return <DashboardView stats={stats} />
}
