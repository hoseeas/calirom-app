import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import MessagesView from '@/components/views/MessagesView'

export default async function MessagesPage({
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

  const messages = await prisma.projectMessage.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch author details for messages that have an authorId
  const authorIds = messages
    .map((m) => m.authorId)
    .filter((aid): aid is string => aid !== null)

  const authors = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: {
      id: true,
      name: true,
      initials: true,
      avatarColor: true,
      email: true,
    },
  })

  const authorMap = new Map(authors.map((a) => [a.id, a]))

  const messagesWithAuthors = messages.map((m) => ({
    id: m.id,
    projectId: m.projectId,
    title: m.title,
    content: m.content,
    createdAt: m.createdAt,
    author: m.authorId ? (authorMap.get(m.authorId) ?? null) : null,
  }))

  const currentUser = {
    id: session.userId,
    name: session.name,
    email: session.email,
    initials: session.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    avatarColor: '#6B7280',
  }

  return (
    <MessagesView
      projectId={id}
      messages={messagesWithAuthors}
      currentUser={currentUser}
    />
  )
}
