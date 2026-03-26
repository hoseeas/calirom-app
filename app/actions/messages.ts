'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function sendMessage(
  projectId: string,
  content: string,
  authorId: string
): Promise<void> {
  if (!content.trim()) {
    throw new Error('Message content cannot be empty')
  }

  await prisma.projectMessage.create({
    data: {
      projectId,
      authorId,
      content: content.trim(),
    },
  })

  revalidatePath(`/projects/${projectId}/messages`)
}
