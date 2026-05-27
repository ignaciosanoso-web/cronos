'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendMiticoAlertEmail } from '@/lib/email'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  if (session.user.role !== 'ADMIN') throw new Error('Sin permisos')
  return session.user.id
}

export type AuctionFormData = {
  momentId: string
  serialNumber: number
  startPrice: number // euros → céntimos
  opensAt: string // ISO string
  closesAt: string // ISO string
}

export async function createAuction(
  data: AuctionFormData
): Promise<{ success: true; id: string } | { error: string }> {
  try {
    await requireAdmin()

    const moment = await prisma.moment.findUnique({ where: { id: data.momentId } })
    if (!moment) return { error: 'Momento no encontrado.' }

    // Verificar que no haya ya una subasta OPEN/EXTENDING/SCHEDULED para este serial
    const existing = await prisma.auction.findFirst({
      where: {
        momentId: data.momentId,
        serialNumber: data.serialNumber,
        status: { in: ['SCHEDULED', 'OPEN', 'EXTENDING'] },
      },
    })
    if (existing) {
      return { error: `Ya existe una subasta activa para el ejemplar #${data.serialNumber}.` }
    }

    const opensAt = new Date(data.opensAt)
    const closesAt = new Date(data.closesAt)

    if (closesAt <= opensAt) {
      return { error: 'El cierre debe ser posterior a la apertura.' }
    }

    const auction = await prisma.auction.create({
      data: {
        momentId: data.momentId,
        serialNumber: data.serialNumber,
        startPrice: Math.round(data.startPrice * 100),
        opensAt,
        baseClosesAt: closesAt,
        closesAt,
        status: opensAt <= new Date() ? 'OPEN' : 'SCHEDULED',
      },
    })

    // Si el momento estaba DRAFT o SCHEDULED, pasarlo a IN_AUCTION
    if (['DRAFT', 'SCHEDULED'].includes(moment.status)) {
      await prisma.moment.update({
        where: { id: data.momentId },
        data: { status: 'IN_AUCTION' },
      })
    }

    // Si el momento es MÍTICO, enviar email de alerta a todos los usuarios — fire and forget
    if (moment.tier === 'MITICO') {
      prisma.user.findMany({ select: { email: true } }).then((users) => {
        Promise.all(
          users
            .filter((u) => u.email)
            .map((u) =>
              sendMiticoAlertEmail({
                to: u.email!,
                momentTitle: moment.title,
                momentSlug: moment.slug,
                startPriceCents: Math.round(data.startPrice * 100),
                closesAt: closesAt.toISOString(),
              })
            )
        ).catch(console.error)
      }).catch(console.error)
    }

    revalidatePath('/admin/subastas')
    revalidatePath(`/momento/${moment.slug}`)
    return { success: true, id: auction.id }
  } catch (err) {
    console.error('[createAuction]', err)
    return { error: err instanceof Error ? err.message : 'Error al crear la subasta.' }
  }
}

export async function cancelAuction(
  auctionId: string
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin()

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { moment: true },
    })
    if (!auction) return { error: 'Subasta no encontrada.' }
    if (!['SCHEDULED', 'OPEN', 'EXTENDING'].includes(auction.status)) {
      return { error: 'Solo se pueden cancelar subastas activas.' }
    }

    await prisma.$transaction([
      prisma.auction.update({
        where: { id: auctionId },
        data: { status: 'CANCELLED' },
      }),
      prisma.moment.update({
        where: { id: auction.momentId },
        data: { status: 'SCHEDULED' },
      }),
    ])

    revalidatePath('/admin/subastas')
    return { success: true }
  } catch (err) {
    console.error('[cancelAuction]', err)
    return { error: err instanceof Error ? err.message : 'Error al cancelar la subasta.' }
  }
}
