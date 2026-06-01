'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendMomentReceivedEmail } from '@/lib/email'

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

// ── Transferir / regalar un momento a otro curador ───────────────────────────
export async function transferOwnership(
  ownershipId: string,
  recipientEmail: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado' }

  const email = recipientEmail.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Introduce un email válido.' }
  }

  const ownership = await prisma.ownership.findUnique({
    where: { id: ownershipId },
    include: {
      moment: { select: { slug: true, title: true } },
      listings: { where: { status: 'ACTIVE' }, select: { id: true } },
    },
  })

  if (!ownership || ownership.userId !== session.user.id) {
    return { error: 'No autorizado' }
  }

  const [recipient, sender] = await Promise.all([
    prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { displayName: true, name: true, email: true },
    }),
  ])

  if (!recipient) {
    return { error: 'No existe ningún curador registrado con ese email.' }
  }
  if (recipient.id === session.user.id) {
    return { error: 'No puedes transferirte un momento a ti mismo.' }
  }

  const senderName = sender?.displayName ?? sender?.name ?? sender?.email ?? 'Otro curador'

  try {
    await prisma.$transaction(async (tx) => {
      // Cancelar cualquier listing activo antes de transferir
      if (ownership.listings.length > 0) {
        await tx.listing.updateMany({
          where: { ownershipId: ownership.id, status: 'ACTIVE' },
          data: { status: 'CANCELLED' },
        })
        await tx.offer.updateMany({
          where: {
            listingId: { in: ownership.listings.map((l) => l.id) },
            status: 'PENDING',
          },
          data: { status: 'REJECTED' },
        })
      }

      // Transferir la propiedad — el primer adquirente (royalties) no cambia
      await tx.ownership.update({
        where: { id: ownership.id },
        data: {
          userId: recipient.id,
          acquiredAt: new Date(),
          isPublic: false, // por privacidad, el receptor decide hacerlo público
        },
      })

      // Notificar al receptor
      await tx.notification.create({
        data: {
          userId: recipient.id,
          kind: 'AUCTION_WON',
          payload: {
            type: 'TRANSFER',
            momentId: ownership.momentId,
            momentSlug: ownership.moment.slug,
            momentTitle: ownership.moment.title,
            serialNumber: ownership.serialNumber,
            fromName: senderName,
          },
        },
      })
    })
  } catch (err) {
    console.error('[transferOwnership]', err)
    return { error: 'No se pudo completar la transferencia.' }
  }

  // Email al receptor — fire and forget fuera de la transacción
  if (recipient.email) {
    sendMomentReceivedEmail({
      to: recipient.email,
      momentTitle: ownership.moment.title,
      momentSlug: ownership.moment.slug,
      fromName: senderName,
    }).catch(console.error)
  }

  revalidatePath('/vault')
  revalidatePath(`/curator/${session.user.id}`)
  return { success: true }
}
