'use server'

import { auth } from '@/lib/auth'
import {
  sendAuctionWonEmail,
  sendOutbidEmail,
  sendAuctionLostEmail,
  sendRoyaltyEmail,
  sendMiticoAlertEmail,
} from '@/lib/email'

export async function sendTestEmails(): Promise<{ sent: number } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: 'Sin permisos' }
  }

  const to = session.user.email
  if (!to) return { error: 'No hay email en la sesión' }

  // Datos ficticios pero realistas
  const base = process.env.NEXTAUTH_URL ?? 'https://cronos.app'
  const mockOwnershipId = 'test-ownership-id'
  const mockSlug = 'primer-iphone'
  const mockTitle = 'Steve Jobs Presenta el iPhone'

  await Promise.all([
    sendAuctionWonEmail({
      to,
      momentTitle: mockTitle,
      momentSlug: mockSlug,
      serialNumber: 2,
      totalCirculation: 10,
      amountCents: 150000,
      ownershipId: mockOwnershipId,
    }),
    sendOutbidEmail({
      to,
      momentTitle: mockTitle,
      momentSlug: mockSlug,
      newAmountCents: 175000,
    }),
    sendAuctionLostEmail({
      to,
      momentTitle: mockTitle,
      momentSlug: mockSlug,
    }),
    sendRoyaltyEmail({
      to,
      momentTitle: mockTitle,
      momentSlug: mockSlug,
      royaltyAmountCents: 8750,
      salePriceCents: 175000,
    }),
    sendMiticoAlertEmail({
      to,
      momentTitle: 'El Primer Arte de la Humanidad',
      momentSlug: 'homo-sapiens-primer-arte',
      startPriceCents: 1000000,
      closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  ])

  return { sent: 5 }
}
