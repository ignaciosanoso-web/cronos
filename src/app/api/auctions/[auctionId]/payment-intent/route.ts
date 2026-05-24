import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ auctionId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión para pujar.' }, { status: 401 })
  }

  const { auctionId } = await params
  const body = await req.json()
  const amountCents: number = body.amountCents

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: 'Importe inválido.' }, { status: 400 })
  }

  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: { currentBid: { select: { amount: true } } },
  })

  if (!auction || !['OPEN', 'EXTENDING'].includes(auction.status)) {
    return NextResponse.json({ error: 'La subasta no está activa.' }, { status: 400 })
  }
  if (auction.closesAt < new Date()) {
    return NextResponse.json({ error: 'La subasta ha finalizado.' }, { status: 400 })
  }

  const minBid = auction.currentBid
    ? Math.ceil(auction.currentBid.amount * 1.05)
    : auction.startPrice

  if (amountCents < minBid) {
    const minEur = (minBid / 100).toLocaleString('es-ES')
    return NextResponse.json({ error: `La puja mínima es ${minEur} €.` }, { status: 400 })
  }

  // Obtener o crear cliente Stripe
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, stripeCustomerId: true },
  })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })

  let customerId = user.stripeCustomerId ?? undefined
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customer.id },
    })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'eur',
    customer: customerId,
    capture_method: 'manual',
    payment_method_types: ['card'],
    metadata: { auctionId, userId: session.user.id },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
