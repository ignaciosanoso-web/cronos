import Stripe from 'stripe'

// Lazy initialization — Stripe is only instantiated on first use,
// not at module load time (avoids build errors when env var is absent)
let _stripe: Stripe | null = null

function getStripeInstance(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) throw new Error('STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(apiKey, { apiVersion: '2026-04-22.dahlia' })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    const instance = getStripeInstance()
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function'
      ? (value as (...a: unknown[]) => unknown).bind(instance)
      : value
  },
})
