import { NextRequest, NextResponse } from 'next/server'

// Tell Next.js not to parse the body — Stripe needs the raw bytes to verify the signature
export const dynamic = 'force-dynamic'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

// Stripe requires the raw body — do NOT parse as JSON before calling constructEvent
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        // Expected when we cancel outbid holds — nothing to do, bid is already OUTBID
        break

      default:
        // Unhandled event — acknowledge to avoid Stripe retrying
        break
    }
  } catch (err) {
    console.error(`[webhook] Error handling ${event.type}:`, err)
    // Return 500 so Stripe retries
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ── payment_intent.payment_failed ────────────────────────────────────────────
// Fires when 3DS auth fails or the card is declined during authorization.
// The bid is in DB as ACTIVE but the hold was never established.
// We mark it HOLD_FAILED and remove it as the auction's current bid.

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const bid = await prisma.bid.findFirst({
    where: {
      stripePaymentIntentId: pi.id,
      status: 'ACTIVE',
    },
    include: {
      auction: {
        select: { id: true, currentBidId: true, status: true },
      },
    },
  })

  if (!bid) {
    // Already handled or bid not found — idempotent
    console.log(`[webhook/payment_failed] No active bid for PI ${pi.id} — skipping`)
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.bid.update({
      where: { id: bid.id },
      data: {
        status: 'HOLD_FAILED',
        stripeError: pi.last_payment_error?.message ?? 'Payment failed',
      },
    })

    // Remove from auction only if it's still the current bid
    if (bid.auction.currentBidId === bid.id) {
      await tx.auction.update({
        where: { id: bid.auctionId },
        data: { currentBidId: null },
      })
    }
  })

  console.log(
    `[webhook/payment_failed] Bid ${bid.id} marked HOLD_FAILED — PI ${pi.id} — ${pi.last_payment_error?.message ?? 'no details'}`
  )
}
