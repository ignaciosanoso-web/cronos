'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleOwnershipPublic(ownershipId: string, isPublic: boolean) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado' }

  const ownership = await prisma.ownership.findUnique({
    where: { id: ownershipId },
    select: { userId: true },
  })

  if (!ownership || ownership.userId !== session.user.id) {
    return { error: 'No autorizado' }
  }

  await prisma.ownership.update({
    where: { id: ownershipId },
    data: { isPublic },
  })

  revalidatePath('/vault')
  revalidatePath(`/curator/${session.user.id}`)
  return { success: true }
}
