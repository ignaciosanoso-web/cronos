// Lógica pura de comisiones. Todos los importes en céntimos (enteros).
//
// - Subasta inaugural: Cronos retiene el 10 % del precio final (tasa de acuñación).
// - Mercado secundario: Cronos cobra el 8 %; el primer propietario recibe un 5 % de royalty.
//
// Mantener estas constantes aquí como única fuente de verdad — están referenciadas
// en how-it-works, los emails y las server actions.

export const PRIMARY_FEE_BPS = 1000 // 10 % subasta inaugural
export const SECONDARY_FEE_BPS = 800 // 8 % mercado secundario
export const ROYALTY_BPS = 500 // 5 % royalty al primer propietario

const BPS_DENOMINATOR = 10000

/** Aplica un porcentaje en puntos básicos a un importe en céntimos, redondeando. */
export function applyBps(amountCents: number, bps: number): number {
  return Math.round((amountCents * bps) / BPS_DENOMINATOR)
}

/** Comisión de Cronos en una subasta inaugural (el resto va al sistema). */
export function calculatePrimaryFee(amountCents: number): number {
  return applyBps(amountCents, PRIMARY_FEE_BPS)
}

export interface SecondaryFees {
  /** Comisión de plataforma (8 %). */
  cronosFee: number
  /** Royalty al primer propietario (5 %, o 0 si el vendedor es el primer propietario). */
  royaltyAmount: number
  /** Neto que recibe el vendedor tras comisión y royalty. */
  sellerNet: number
}

/**
 * Desglosa una venta de mercado secundario.
 * @param amountCents  Precio de venta en céntimos.
 * @param sellerIsFirstOwner  Si el vendedor es el primer propietario, no hay royalty.
 */
export function calculateSecondaryFees(
  amountCents: number,
  sellerIsFirstOwner: boolean
): SecondaryFees {
  const cronosFee = applyBps(amountCents, SECONDARY_FEE_BPS)
  const royaltyAmount = sellerIsFirstOwner ? 0 : applyBps(amountCents, ROYALTY_BPS)
  const sellerNet = amountCents - cronosFee - royaltyAmount
  return { cronosFee, royaltyAmount, sellerNet }
}
