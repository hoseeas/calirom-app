import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch all projects for this workspace
  const projects = await prisma.project.findMany({
    where: { workspaceId: session.workspaceId },
    select: {
      id: true,
      name: true,
      color: true,
      isStarred: true,
      position: true,
    },
    orderBy: { position: 'asc' },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        user={{
          name: session.name,
          email: session.email,
          avatarColor: '#6366f1',
        }}
        projects={projects}
      />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  )
}
