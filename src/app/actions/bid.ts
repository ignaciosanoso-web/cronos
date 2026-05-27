'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { pusher } from '@/lib/pusher'
import { revalidatePath } from 'next/cache'
import { sendOutbidEmail } from '@/lib/email'
import type { Tier } from '@prisma/client'

const TIER_MECHANICS: Record<Tier, { triggerMin: number; extensionMin: number }> = {
  MITICO: { triggerMin: 30, extensionMin: 30 },
  EXCEPCIONAL: { triggerMin: 15, extensionMin: 15 },
  RARO: { triggerMin: 10, extensionMin: 10 },
  COMUN: { triggerMin: 5, extensionMin: 5 },
}

type BidResult = { success: true; extended: boolean; extensionMin: number } | { error: string }

export async function placeBid(
  auctionId: string,
  amountCents: number,
  stripePaymentIntentId: string
): Promise<BidResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Debes iniciar sesión para pujar.' }

    // Verificar que el PaymentIntent fue autorizado correctamente
    const pi = await stripe.paymentIntents.retrieve(stripePaymentIntentId)
    if (pi.status !== 'requires_capture') {
      return { error: 'El pago no fue autorizado correctamente.' }
    }
    if (pi.amount !== amountCents) {
      return { error: 'El importe del pago no coincide con la puja.' }
    }

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        moment: { select: { tier: true, slug: true, title: true } },
        currentBid: {
          select: { id: true, amount: true, userId: true, stripePaymentIntentId: true },
        },
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

    // Lógica anti-sniping
    const mechanics = TIER_MECHANICS[auction.moment.tier]
    const triggerMs = mechanics.triggerMin * 60 * 1000
    const extensionMs = mechanics.extensionMin * 60 * 1000
    const timeLeft = auction.closesAt.getTime() - Date.now()

    const triggeredExtension = timeLeft <= triggerMs
    const newClosesAt = triggeredExtension
      ? new Date(Math.max(auction.closesAt.getTime(), Date.now() + extensionMs))
      : auction.closesAt
    const newStatus = triggeredExtension ? ('EXTENDING' as const) : auction.status

    const oldPaymentIntentId = auction.currentBid?.stripePaymentIntentId ?? null

    // Transacción atómica: marcar OUTBID, crear puja, actualizar subasta
    await prisma.$transaction(async (tx) => {
      if (auction.currentBidId) {
        await tx.bid.update({
          where: { id: auction.currentBidId },
          data: { status: 'OUTBID' },
        })
      }

      const bid = await tx.bid.create({
        data: {
          auctionId,
          userId: session.user.id,
          amount: amountCents,
          stripePaymentIntentId,
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

    // Cancelar el PaymentIntent anterior (liberar el hold) — no es fatal si falla
    if (oldPaymentIntentId) {
      try {
        await stripe.paymentIntents.cancel(oldPaymentIntentId)
      } catch (e) {
        console.error('[placeBid] No se pudo cancelar el PI anterior:', e)
      }
    }

    // Email al pujador superado — fire and forget
    if (auction.currentBid?.userId) {
      const outbidUser = await prisma.user.findUnique({
        where: { id: auction.currentBid.userId },
        select: { email: true },
      })
      if (outbidUser?.email) {
        sendOutbidEmail({
          to: outbidUser.email,
          momentTitle: auction.moment.title,
          momentSlug: auction.moment.slug,
          newAmountCents: amountCents,
        }).catch(console.error)
      }
    }

    // Notificar en tiempo real a todos los que están viendo la subasta
    try {
      await pusher.trigger(`auction-${auctionId}`, 'bid-placed', {
        amountCents,
        closesAt: newClosesAt.toISOString(),
        extended: triggeredExtension,
      })
    } catch (e) {
      console.error('[placeBid] Pusher trigger failed:', e)
    }

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
