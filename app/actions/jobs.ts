'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function toggleJobCompletion(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { isCompleted: true, projectId: true },
  })

  if (!job) {
    throw new Error('Job not found')
  }

  await prisma.job.update({
    where: { id: jobId },
    data: {
      isCompleted: !job.isCompleted,
      completedAt: !job.isCompleted ? new Date() : null,
    },
  })

  revalidatePath(`/projects/${job.projectId}`)
}

export async function createJob(data: {
  name: string
  sectionId: string
  projectId: string
}) {
  const lastJob = await prisma.job.findFirst({
    where: {
      projectId: data.projectId,
      sectionId: data.sectionId,
    },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const position = (lastJob?.position ?? -1) + 1

  await prisma.job.create({
    data: {
      name: data.name,
      projectId: data.projectId,
      sectionId: data.sectionId,
      position,
    },
  })

  revalidatePath(`/projects/${data.projectId}`)
}

export async function moveJobToSection(jobId: string, sectionId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { projectId: true },
  })

  if (!job) {
    throw new Error('Job not found')
  }

  const lastJob = await prisma.job.findFirst({
    where: {
      projectId: job.projectId,
      sectionId,
    },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  await prisma.job.update({
    where: { id: jobId },
    data: {
      sectionId,
      position: (lastJob?.position ?? -1) + 1,
    },
  })

  revalidatePath(`/projects/${job.projectId}`)
}

export async function updateJobCustomField(
  jobId: string,
  fieldDefinitionId: string,
  value: string | number | boolean | null,
  fieldType: string
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { projectId: true },
  })

  if (!job) {
    throw new Error('Job not found')
  }

  const data: {
    textValue?: string | null
    numberValue?: number | null
    booleanValue?: boolean | null
    enumOptionId?: string | null
  } = {}

  switch (fieldType) {
    case 'TEXT':
    case 'URL':
      data.textValue = value as string | null
      break
    case 'NUMBER':
      data.numberValue = value as number | null
      break
    case 'CHECKBOX':
      data.booleanValue = value as boolean | null
      break
    case 'ENUM':
      data.enumOptionId = value as string | null
      break
  }

  await prisma.jobCustomFieldValue.upsert({
    where: {
      jobId_fieldDefinitionId: { jobId, fieldDefinitionId },
    },
    create: {
      jobId,
      fieldDefinitionId,
      ...data,
    },
    update: data,
  })

  revalidatePath(`/projects/${job.projectId}`)
}

export async function addComment(
  jobId: string,
  content: string,
  authorId: string
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { projectId: true },
  })

  if (!job) {
    throw new Error('Job not found')
  }

  await prisma.comment.create({
    data: {
      jobId,
      authorId,
      content,
    },
  })

  revalidatePath(`/projects/${job.projectId}`)
}
