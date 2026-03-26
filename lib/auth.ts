import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export type AuthUser = {
  id: string
  name: string
  email: string
  workspaceId: string
  role: string
}

export type LoginResult =
  | { success: true; user: AuthUser }
  | { success: false; error: string }

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        workspaceId: true,
        role: true,
        password: true,
      },
    })

    if (!user) {
      return { success: false, error: 'Invalid email or password.' }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password.' }
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId,
        role: user.role,
      },
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
