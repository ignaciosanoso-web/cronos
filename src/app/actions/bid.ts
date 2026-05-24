'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Tier } from '@prisma/client'

const TIER_MECHANICS: Record<Tier, { triggerMin: number; extensionMin: number }> = {
  MITICO: { triggerMin: 30, extensionMin: 30 },
  EXCEPCIONAL: { triggerMin: 15, extensionMin: 15 },
  RARO: { triggerMin: 10, extensionMin: 10 },
  COMUN: { triggerMin: 5, extensionMin: 5 },
}

type BidResult = { success: true; extended: boolean; extensionMin: number } | { error: string }

export async function placeBid(auctionId: string, amountCents: number): Promise<BidResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Debes iniciar sesión para pujar.' }

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        moment: { select: { tier: true, slug: true } },
        currentBid: { select: { id: true, amount: true, userId: true } },
      },
    })

    if (!auction) return { error: 'Subasta no encontrada.' }
    if (!['OPEN', 'EXTENDING'].includes(auction.status)) {
      return { error: 'La subasta no está activa.' }
    }
    if (auction.closesAt < new Date()) {
      return { error: 'La subasta ha finalizado.' }
    }
    if (auction.currentBid?.userId === session.user.id) {
      return { error: 'Ya tienes la puja más alta.' }
    }

    const minBid = auction.currentBid
      ? Math.ceil(auction.currentBid.amount * 1.05)
      : auction.startPrice

    if (amountCents < minBid) {
      const minEur = (minBid / 100).toLocaleString('es-ES')
      return { error: `La puja mínima es ${minEur} €.` }
    }

    // TODO (Sprint Stripe): crear PaymentIntent con capture_method: 'manual' aquí.
    // Si falla el hold, retornar { error: 'Tarjeta rechazada.' } antes de registrar la puja.

    const mechanics = TIER_MECHANICS[auction.moment.tier]
    const triggerMs = mechanics.triggerMin * 60 * 1000
    const extensionMs = mechanics.extensionMin * 60 * 1000
    const timeLeft = auction.closesAt.getTime() - Date.now()

    const triggeredExtension = timeLeft <= triggerMs
    const newClosesAt = triggeredExtension
      ? new Date(Math.max(auction.closesAt.getTime(), Date.now() + extensionMs))
      : auction.closesAt
    const newStatus = triggeredExtension ? ('EXTENDING' as const) : auction.status

    await prisma.$transaction(async (tx) => {
      // Marcar puja anterior como OUTBID
      if (auction.currentBidId) {
        await tx.bid.update({
          where: { id: auction.currentBidId },
          data: { status: 'OUTBID' },
        })
        // TODO (Sprint Stripe): liberar el PaymentIntent de la puja anterior aquí.
      }

      const bid = await tx.bid.create({
        data: {
          auctionId,
          userId: session.user.id,
          amount: amountCents,
          status: 'ACTIVE',
          triggeredExtension,
        },
      })

      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentBidId: bid.id,
          closesAt: newClosesAt,
          status: newStatus,
        },
      })
    })

    revalidatePath(`/momento/${auction.moment.slug}`)

    return {
      success: true,
      extended: triggeredExtension,
      extensionMin: mechanics.extensionMin,
    }
  } catch (err) {
    console.error('[placeBid]', err)
    return { error: 'Error al registrar la puja. Inténtalo de nuevo.' }
  }
}
