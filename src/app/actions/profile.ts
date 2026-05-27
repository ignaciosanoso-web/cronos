'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
  displayName: string
  bio: string
  avatarUrl: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado' }

  const displayName = data.displayName.trim() || null
  const bio = data.bio.trim() || null
  const avatarUrl = data.avatarUrl.trim() || null

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName, bio, avatarUrl },
  })

  revalidatePath('/vault')
  revalidatePath('/perfil')
  revalidatePath(`/curator/${session.user.id}`)
  return { success: true }
}
