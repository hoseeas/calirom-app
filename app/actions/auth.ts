'use server'

import { redirect } from 'next/navigation'
import { login } from '@/lib/auth'
import { createSession, deleteSession } from '@/lib/session'

export type LoginState = {
  error?: string
} | undefined

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const result = await login(email, password)

  if (!result.success) {
    return { error: result.error }
  }

  await createSession({
    userId: result.user.id,
    email: result.user.email,
    name: result.user.name,
    workspaceId: result.user.workspaceId,
    role: result.user.role,
  })

  redirect('/projects')
}

export async function logoutAction(): Promise<void> {
  await deleteSession()
  redirect('/login')
}
