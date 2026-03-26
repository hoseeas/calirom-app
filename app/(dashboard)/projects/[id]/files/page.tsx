import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import FilesView from '@/components/views/FilesView'

export default async function FilesPage({
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

  const attachments = await prisma.attachment.findMany({
    where: {
      job: { projectId: id },
    },
    include: {
      job: { select: { id: true, name: true } },
      uploadedBy: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const files = attachments.map((a) => ({
    id: a.id,
    fileName: a.fileName,
    fileUrl: a.fileUrl,
    mimeType: a.mimeType ?? null,
    jobName: a.job?.name ?? null,
    uploaderEmail: a.uploadedBy?.email ?? null,
  }))

  return <FilesView files={files} />
}
