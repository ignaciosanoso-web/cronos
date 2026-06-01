// Lógica pura de subastas: puja mínima y mecánica anti-sniping por tier.
// Sin dependencias de Prisma ni de red — testeable de forma aislada.

import type { Tier } from '@prisma/client'

/** Incremento mínimo entre pujas: 5 %. */
export const BID_INCREMENT = 1.05

/**
 * Mecánica anti-sniping por tier:
 * - triggerMin: si quedan ≤ estos minutos al pujar, la subasta se extiende.
 * - extensionMin: minutos que se añaden desde el momento de la puja.
 */
export const TIER_MECHANICS: Record<Tier, { triggerMin: number; extensionMin: number }> = {
  MITICO: { triggerMin: 30, extensionMin: 30 },
  EXCEPCIONAL: { triggerMin: 15, extensionMin: 15 },
  RARO: { triggerMin: 10, extensionMin: 10 },
  COMUN: { triggerMin: 5, extensionMin: 5 },
}

/**
 * Puja mínima admisible.
 * @param currentBidCents  Puja actual más alta, o null si no hay pujas.
 * @param startPriceCents  Precio de salida de la subasta.
 */
export function minimumBid(currentBidCents: number | null, startPriceCents: number): number {
  if (currentBidCents == null) return startPriceCents
  return Math.ceil(currentBidCents * BID_INCREMENT)
}

export interface ExtensionResult {
  /** Si la puja ha disparado una extensión anti-sniping. */
  triggeredExtension: boolean
  /** Nuevo cierre de la subasta (igual al anterior si no hubo extensión). */
  newClosesAt: Date
}

/**
 * Calcula si una puja realizada en `now` extiende la subasta y el nuevo cierre.
 * El cierre nunca se acorta: se toma el máximo entre el cierre actual y `now + extensión`.
 */
export function computeExtension(
  tier: Tier,
  closesAt: Date,
  now: Date = new Date()
): ExtensionResult {
  const { triggerMin, extensionMin } = TIER_MECHANICS[tier]
  const triggerMs = triggerMin * 60 * 1000
  const extensionMs = extensionMin * 60 * 1000
  const timeLeft = closesAt.getTime() - now.getTime()

  const triggeredExtension = timeLeft <= triggerMs
  const newClosesAt = triggeredExtension
    ? new Date(Math.max(closesAt.getTime(), now.getTime() + extensionMs))
    : closesAt

  return { triggeredExtension, newClosesAt }
}
