// Validación pura en frontera. Sin dependencias externas — testeable de forma aislada.
// Centraliza las comprobaciones que antes vivían dispersas en las server actions.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Normaliza un email: recorta espacios y pasa a minúsculas. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Valida el formato de un email (tras normalizar). */
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(normalizeEmail(email))
}

/**
 * Convierte un importe en euros a céntimos enteros, validando.
 * @returns céntimos (entero ≥ minCents) o null si la entrada es inválida.
 */
export function parseEurosToCents(input: number | string, minCents = 100): number | null {
  const euros = typeof input === 'string' ? Number(input.replace(',', '.')) : input
  if (typeof euros !== 'number' || !Number.isFinite(euros) || euros <= 0) return null
  const cents = Math.round(euros * 100)
  if (cents < minCents) return null
  return cents
}

/**
 * Valida una puja contra la mínima admisible.
 * @returns true si la puja es válida (entera, finita y ≥ mínima).
 */
export function isValidBid(amountCents: number, minBidCents: number): boolean {
  return Number.isInteger(amountCents) && Number.isFinite(amountCents) && amountCents >= minBidCents
}

/** Recorta y colapsa espacios; devuelve null si queda vacío o supera maxLength. */
export function cleanText(input: string | null | undefined, maxLength = 400): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (trimmed.length === 0 || trimmed.length > maxLength) return null
  return trimmed
}
