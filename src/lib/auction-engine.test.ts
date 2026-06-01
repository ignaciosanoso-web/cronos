import { describe, it, expect } from 'vitest'
import { minimumBid, computeExtension, BID_INCREMENT, TIER_MECHANICS } from './auction-engine'

describe('minimumBid', () => {
  it('devuelve el precio de salida cuando no hay pujas', () => {
    expect(minimumBid(null, 50000)).toBe(50000)
  })

  it('exige un incremento del 5 % sobre la puja actual', () => {
    expect(minimumBid(100000, 50000)).toBe(105000)
  })

  it('redondea hacia arriba para garantizar el incremento mínimo', () => {
    // 10001 * 1.05 = 10501.05 → 10502 (ceil)
    expect(minimumBid(10001, 0)).toBe(10502)
  })

  it('el incremento es del 5 %', () => {
    expect(BID_INCREMENT).toBe(1.05)
  })
})

describe('computeExtension', () => {
  const closesAt = new Date('2026-06-01T12:00:00Z')

  it('NO extiende si la puja llega con holgura', () => {
    // COMUN extiende solo en los últimos 5 min; pujamos a 1 hora del cierre
    const now = new Date('2026-06-01T11:00:00Z')
    const { triggeredExtension, newClosesAt } = computeExtension('COMUN', closesAt, now)
    expect(triggeredExtension).toBe(false)
    expect(newClosesAt).toEqual(closesAt)
  })

  it('extiende si la puja entra dentro de la ventana del tier', () => {
    // MITICO extiende en los últimos 30 min; pujamos a 10 min del cierre
    const now = new Date('2026-06-01T11:50:00Z')
    const { triggeredExtension, newClosesAt } = computeExtension('MITICO', closesAt, now)
    expect(triggeredExtension).toBe(true)
    // now + 30 min = 12:20, posterior al cierre original → nuevo cierre
    expect(newClosesAt).toEqual(new Date('2026-06-01T12:20:00Z'))
  })

  it('nunca acorta el cierre: toma el máximo entre cierre actual y now+extensión', () => {
    // RARO extiende en los últimos 10 min; pujamos justo a 10 min y 0s
    const now = new Date('2026-06-01T11:50:00Z')
    const { triggeredExtension, newClosesAt } = computeExtension('RARO', closesAt, now)
    expect(triggeredExtension).toBe(true)
    // now + 10 min = 12:00, igual al cierre → se mantiene 12:00 (no se acorta)
    expect(newClosesAt).toEqual(closesAt)
  })

  it('justo en el límite de la ventana dispara la extensión (≤)', () => {
    // EXCEPCIONAL: 15 min. Pujamos exactamente a 15:00 min del cierre
    const now = new Date('2026-06-01T11:45:00Z')
    const { triggeredExtension } = computeExtension('EXCEPCIONAL', closesAt, now)
    expect(triggeredExtension).toBe(true)
  })

  it('todos los tiers tienen mecánica definida', () => {
    expect(Object.keys(TIER_MECHANICS).sort()).toEqual(['COMUN', 'EXCEPCIONAL', 'MITICO', 'RARO'])
  })
})
