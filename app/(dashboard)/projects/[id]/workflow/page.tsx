import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import WorkflowView from '@/components/views/WorkflowView'

export default async function WorkflowPage({
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

  const sections = await prisma.section.findMany({
    where: { projectId: id },
    orderBy: { position: 'asc' },
    select: { id: true, name: true },
  })

  // Count incomplete jobs per section
  const jobCounts = await prisma.job.groupBy({
    by: ['sectionId'],
    where: { projectId: id, parentJobId: null, isCompleted: false },
    _count: { id: true },
  })

  const jobCountMap = new Map(
    jobCounts.map((g) => [g.sectionId, g._count.id])
  )

  const sectionsWithCounts = sections.map((s) => ({
    id: s.id,
    name: s.name,
    incompleteCount: jobCountMap.get(s.id) ?? 0,
  }))

  return <WorkflowView sections={sectionsWithCounts} />
}
