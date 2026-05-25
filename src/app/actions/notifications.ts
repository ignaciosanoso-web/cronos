'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function markAllNotificationsRead() {
  const session = await auth()
  if (!session?.user) return { error: 'No autenticado' }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, sentAt: null },
    data: { sentAt: new Date() },
  })

  return { ok: true }
}
