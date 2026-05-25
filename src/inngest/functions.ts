import { inngest } from '@/lib/inngest'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

const CRONOS_FEE_BPS = 1000 // 10 %

// ─── Scheduler: corre cada minuto y despacha eventos de cierre ───────────────

export const closeExpiredAuctions = inngest.createFunction(
  { id: 'close-expired-auctions', triggers: [{ cron: '* * * * *' }] },
  async ({ step }) => {
    const expired = await step.run('find-expired', async () => {
      return prisma.auction.findMany({
        where: {
          status: { in: ['OPEN', 'EXTENDING'] },
          closesAt: { lt: new Date() },
        },
        select: { id: true },
      })
    })

    if (expired.length === 0) return { dispatched: 0 }

    await step.sendEvent(
      'dispatch-close-events',
      expired.map(({ id }) => ({
        name: 'cronos/auction.close' as const,
        data: { auctionId: id },
      }))
    )

    return { dispatched: expired.length }
  }
)

// ─── Handler: cierra una subasta individual ──────────────────────────────────

export const closeAuction = inngest.createFunction(
  {
    id: 'close-auction',
    retries: 3,
    triggers: [{ event: 'cronos/auction.close' }],
  },
  async ({ event, step }) => {
    const { auctionId } = event.data as { auctionId: string }

    const auction = await step.run('fetch-auction', async () => {
      return prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
          currentBid: {
            select: {
              id: true,
              userId: true,
              amount: true,
              stripePaymentIntentId: true,
            },
          },
          moment: { select: { id: true, slug: true } },
          bids: {
            where: { status: 'OUTBID' },
            select: { userId: true },
            distinct: ['userId'],
          },
        },
      })
    })

    if (!auction) return { skipped: 'not-found' }
    if (!['OPEN', 'EXTENDING'].includes(auction.status)) {
      return { skipped: `already-${auction.status}` }
    }

    // ── Sin pujas: cerrar vacío ──────────────────────────────────────────────
    if (!auction.currentBid) {
      await step.run('close-no-bids', async () => {
        await prisma.$transaction([
          prisma.auction.update({
            where: { id: auctionId },
            data: { status: 'CLOSED_NO_BIDS' },
          }),
          prisma.moment.update({
            where: { id: auction.moment.id },
            data: { status: 'SCHEDULED' },
          }),
        ])
      })
      return { result: 'CLOSED_NO_BIDS' }
    }

    // ── Con ganador ──────────────────────────────────────────────────────────
    const winner = auction.currentBid

    // Verificar estado del PaymentIntent antes de capturar
    const piStatus = await step.run('check-pi', async () => {
      if (!winner.stripePaymentIntentId) return 'missing'
      const pi = await stripe.paymentIntents.retrieve(winner.stripePaymentIntentId)
      return pi.status
    })

    if (piStatus !== 'requires_capture') {
      // Hold expiró o fue cancelado — cerrar sin ganador
      await step.run('close-hold-failed', async () => {
        await prisma.$transaction([
          prisma.bid.update({
            where: { id: winner.id },
            data: { status: 'HOLD_FAILED' },
          }),
          prisma.auction.update({
            where: { id: auctionId },
            data: { status: 'CLOSED_NO_BIDS', currentBidId: null },
          }),
          prisma.moment.update({
            where: { id: auction.moment.id },
            data: { status: 'SCHEDULED' },
          }),
        ])
      })
      return { result: 'CLOSED_HOLD_FAILED', pi: piStatus }
    }

    // Capturar el pago — si falla, Inngest reintentará
    await step.run('capture-payment', async () => {
      await stripe.paymentIntents.capture(winner.stripePaymentIntentId!)
    })

    const grossAmount = winner.amount
    const cronosFee = Math.round((grossAmount * CRONOS_FEE_BPS) / 10000)

    await step.run('finalize-db', async () => {
      const outbidUserIds = [
        ...new Set(auction.bids.map((b) => b.userId).filter((id) => id !== winner.userId)),
      ]

      await prisma.$transaction(async (tx) => {
        await tx.auction.update({
          where: { id: auctionId },
          data: { status: 'CLOSED_WON' },
        })

        await tx.bid.update({
          where: { id: winner.id },
          data: { status: 'WON' },
        })

        // Upsert para idempotencia — si ya existe no falla en reintento
        await tx.ownership.upsert({
          where: {
            momentId_serialNumber: {
              momentId: auction.moment.id,
              serialNumber: auction.serialNumber,
            },
          },
          create: {
            momentId: auction.moment.id,
            userId: winner.userId,
            serialNumber: auction.serialNumber,
            acquisitionPrice: grossAmount,
          },
          update: {},
        })

        await tx.moment.update({
          where: { id: auction.moment.id },
          data: { status: 'IN_VAULT' },
        })

        // Solo crear Transaction si no existe ya para este auctionId
        const existingTx = await tx.transaction.findFirst({
          where: { stripeChargeId: winner.stripePaymentIntentId ?? undefined },
        })
        if (!existingTx) {
          await tx.transaction.create({
            data: {
              kind: 'AUCTION_WIN',
              momentId: auction.moment.id,
              buyerId: winner.userId,
              grossAmount,
              cronosFee,
              sellerNet: 0,
              royaltyAmount: 0,
              stripeChargeId: winner.stripePaymentIntentId ?? undefined,
            },
          })
        }

        // Solo crear notificación si no existe ya
        const existingNotif = await tx.notification.findFirst({
          where: {
            userId: winner.userId,
            kind: 'AUCTION_WON',
            payload: { path: ['auctionId'], equals: auctionId },
          },
        })
        if (!existingNotif) {
          await tx.notification.create({
            data: {
              userId: winner.userId,
              kind: 'AUCTION_WON',
              payload: {
                auctionId,
                momentId: auction.moment.id,
                momentSlug: auction.moment.slug,
                amountCents: grossAmount,
              },
            },
          })

          if (outbidUserIds.length > 0) {
            await tx.notification.createMany({
              data: outbidUserIds.map((userId) => ({
                userId,
                kind: 'AUCTION_LOST' as const,
                payload: {
                  auctionId,
                  momentId: auction.moment.id,
                  momentSlug: auction.moment.slug,
                },
              })),
            })
          }
        }
      })
    })

    return { result: 'CLOSED_WON', winner: winner.userId, amountCents: winner.amount }
  }
)
