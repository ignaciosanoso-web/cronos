'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  return session.user
}

// ── Crear listing ────────────────────────────────────────────────────────────
export async function createListing(
  ownershipId: string,
  askingPriceEur: number
): Promise<{ success: true; listingId: string } | { error: string }> {
  try {
    const user = await requireUser()

    const ownership = await prisma.ownership.findUnique({
      where: { id: ownershipId },
      include: { listings: { where: { status: 'ACTIVE' } } },
    })
    if (!ownership) return { error: 'Propiedad no encontrada.' }
    if (ownership.userId !== user.id) return { error: 'No eres el propietario.' }
    if (ownership.listings.length > 0) return { error: 'Este ejemplar ya está en venta.' }

    const listing = await prisma.listing.create({
      data: {
        ownershipId,
        sellerId: user.id,
        askingPrice: Math.round(askingPriceEur * 100),
        status: 'ACTIVE',
      },
    })

    revalidatePath('/vault')
    revalidatePath('/market')
    return { success: true, listingId: listing.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al crear el listing.' }
  }
}

// ── Cancelar listing ─────────────────────────────────────────────────────────
export async function cancelListing(
  listingId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireUser()

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) return { error: 'Listing no encontrado.' }
    if (listing.sellerId !== user.id) return { error: 'Sin permisos.' }
    if (listing.status !== 'ACTIVE') return { error: 'El listing ya no está activo.' }

    await prisma.$transaction([
      prisma.offer.updateMany({
        where: { listingId, status: 'PENDING' },
        data: { status: 'EXPIRED' },
      }),
      prisma.listing.update({
        where: { id: listingId },
        data: { status: 'CANCELLED' },
      }),
    ])

    revalidatePath('/vault')
    revalidatePath('/market')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al cancelar.' }
  }
}

// ── Hacer oferta ─────────────────────────────────────────────────────────────
export async function makeOffer(
  listingId: string,
  amountEur: number,
  message?: string
): Promise<{ success: true; offerId: string } | { error: string }> {
  try {
    const user = await requireUser()

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { ownership: true },
    })
    if (!listing) return { error: 'Listing no encontrado.' }
    if (listing.status !== 'ACTIVE') return { error: 'Este listing ya no está activo.' }
    if (listing.sellerId === user.id) return { error: 'No puedes hacerte una oferta a ti mismo.' }

    const cents = Math.round(amountEur * 100)
    if (cents < 100) return { error: 'La oferta mínima es 1 €.' }

    // Solo 1 oferta activa por usuario por listing
    const existing = await prisma.offer.findFirst({
      where: { listingId, buyerId: user.id, status: 'PENDING' },
    })
    if (existing)
      return { error: 'Ya tienes una oferta pendiente en este listing. Retírala primero.' }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

    const offer = await prisma.offer.create({
      data: {
        listingId,
        buyerId: user.id,
        amount: cents,
        message: message?.trim() || null,
        expiresAt,
        status: 'PENDING',
      },
    })

    revalidatePath(`/market/${listingId}`)
    return { success: true, offerId: offer.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al hacer la oferta.' }
  }
}

// ── Aceptar oferta ───────────────────────────────────────────────────────────
export async function acceptOffer(offerId: string): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireUser()

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        listing: { include: { ownership: { include: { moment: true } } } },
        buyer: { select: { id: true, email: true } },
      },
    })
    if (!offer) return { error: 'Oferta no encontrada.' }
    if (offer.listing.sellerId !== user.id) return { error: 'Sin permisos.' }
    if (offer.status !== 'PENDING') return { error: 'La oferta ya no está pendiente.' }
    if (offer.expiresAt < new Date()) return { error: 'La oferta ha expirado.' }

    const { listing } = offer
    const ownership = listing.ownership
    const CRONOS_FEE_BPS = 800  // 8% — comisión de plataforma
    const ROYALTY_BPS = 500     // 5% — royalty al primer propietario

    // El primer propietario es quien ganó la subasta original
    const firstOwnerId = ownership.originalAdquirentId ?? ownership.userId
    // Solo hay royalty si el vendedor NO es el primer propietario
    const royaltyRecipientId = firstOwnerId !== user.id ? firstOwnerId : null
    const royaltyAmount = royaltyRecipientId
      ? Math.round((offer.amount * ROYALTY_BPS) / 10000)
      : 0
    const cronosFee = Math.round((offer.amount * CRONOS_FEE_BPS) / 10000)
    const sellerNet = offer.amount - cronosFee - royaltyAmount

    await prisma.$transaction(async (tx) => {
      // 1. Transferir propiedad — preservar el primer propietario original
      await tx.ownership.update({
        where: { id: ownership.id },
        data: {
          userId: offer.buyerId,
          acquisitionPrice: offer.amount,
          acquiredAt: new Date(),
          originalAdquirentId: firstOwnerId,
        },
      })

      // 2. Marcar listing como vendido
      await tx.listing.update({
        where: { id: listing.id },
        data: { status: 'SOLD' },
      })

      // 3. Marcar oferta como aceptada
      await tx.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' },
      })

      // 4. Rechazar otras ofertas pendientes
      await tx.offer.updateMany({
        where: { listingId: listing.id, status: 'PENDING', id: { not: offerId } },
        data: { status: 'REJECTED' },
      })

      // 5. Registrar transacción principal
      await tx.transaction.create({
        data: {
          kind: 'SECONDARY_SALE',
          momentId: ownership.momentId,
          buyerId: offer.buyerId,
          sellerId: user.id,
          grossAmount: offer.amount,
          cronosFee,
          sellerNet,
          royaltyAmount,
          royaltyRecipientId,
        },
      })

      // 6. Registrar transacción de royalty (para historial del primer propietario)
      if (royaltyRecipientId && royaltyAmount > 0) {
        await tx.transaction.create({
          data: {
            kind: 'ROYALTY_PAYMENT',
            momentId: ownership.momentId,
            buyerId: offer.buyerId,
            sellerId: user.id,
            grossAmount: offer.amount,
            cronosFee: 0,
            sellerNet: 0,
            royaltyAmount,
            royaltyRecipientId,
          },
        })

        // Notificar al primer propietario que ha ganado un royalty
        await tx.notification.create({
          data: {
            userId: royaltyRecipientId,
            kind: 'ROYALTY_EARNED',
            payload: {
              momentId: ownership.momentId,
              momentSlug: ownership.moment.slug,
              momentTitle: ownership.moment.title,
              serialNumber: ownership.serialNumber,
              salePriceCents: offer.amount,
              royaltyAmountCents: royaltyAmount,
            },
          },
        })
      }

      // 7. Notificar al comprador
      await tx.notification.create({
        data: {
          userId: offer.buyerId,
          kind: 'AUCTION_WON',
          payload: {
            type: 'SECONDARY_SALE',
            momentId: ownership.momentId,
            momentSlug: ownership.moment.slug,
            amountCents: offer.amount,
            serialNumber: ownership.serialNumber,
          },
        },
      })
    })

    revalidatePath('/vault')
    revalidatePath('/market')
    revalidatePath(`/market/${listing.id}`)
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al aceptar la oferta.' }
  }
}

// ── Rechazar oferta ──────────────────────────────────────────────────────────
export async function rejectOffer(offerId: string): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireUser()

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    })
    if (!offer) return { error: 'Oferta no encontrada.' }
    if (offer.listing.sellerId !== user.id) return { error: 'Sin permisos.' }
    if (offer.status !== 'PENDING') return { error: 'La oferta ya no está pendiente.' }

    await prisma.offer.update({ where: { id: offerId }, data: { status: 'REJECTED' } })

    revalidatePath(`/market/${offer.listingId}`)
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al rechazar.' }
  }
}

// ── Retirar oferta (comprador) ───────────────────────────────────────────────
export async function withdrawOffer(
  offerId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireUser()

    const offer = await prisma.offer.findUnique({ where: { id: offerId } })
    if (!offer) return { error: 'Oferta no encontrada.' }
    if (offer.buyerId !== user.id) return { error: 'Sin permisos.' }
    if (offer.status !== 'PENDING') return { error: 'La oferta ya no está pendiente.' }

    await prisma.offer.update({ where: { id: offerId }, data: { status: 'WITHDRAWN' } })

    revalidatePath(`/market/${offer.listingId}`)
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al retirar.' }
  }
}
