import { describe, it, expect } from 'vitest'
import {
  applyBps,
  calculatePrimaryFee,
  calculateSecondaryFees,
  PRIMARY_FEE_BPS,
  SECONDARY_FEE_BPS,
  ROYALTY_BPS,
} from './fees'

describe('applyBps', () => {
  it('aplica el porcentaje correcto', () => {
    expect(applyBps(10000, 1000)).toBe(1000) // 10 % de 100 €
    expect(applyBps(10000, 800)).toBe(800) // 8 %
    expect(applyBps(10000, 500)).toBe(500) // 5 %
  })

  it('redondea al céntimo más cercano', () => {
    expect(applyBps(333, 500)).toBe(17) // 333 * 0.05 = 16.65 → 17
    expect(applyBps(101, 500)).toBe(5) // 101 * 0.05 = 5.05 → 5
  })

  it('devuelve 0 con importe 0', () => {
    expect(applyBps(0, 1000)).toBe(0)
  })
})

describe('calculatePrimaryFee', () => {
  it('retiene el 10 % en subasta inaugural', () => {
    expect(calculatePrimaryFee(150000)).toBe(15000) // 1.500 € → 150 €
  })
})

describe('calculateSecondaryFees', () => {
  it('aplica 8 % de comisión y 5 % de royalty cuando el vendedor no es el primer propietario', () => {
    const { cronosFee, royaltyAmount, sellerNet } = calculateSecondaryFees(100000, false)
    expect(cronosFee).toBe(8000) // 8 %
    expect(royaltyAmount).toBe(5000) // 5 %
    expect(sellerNet).toBe(87000) // resto
  })

  it('no aplica royalty cuando el vendedor ES el primer propietario', () => {
    const { cronosFee, royaltyAmount, sellerNet } = calculateSecondaryFees(100000, true)
    expect(cronosFee).toBe(8000)
    expect(royaltyAmount).toBe(0)
    expect(sellerNet).toBe(92000)
  })

  it('el desglose siempre suma el importe total (sin propietario original)', () => {
    const amount = 73219
    const { cronosFee, royaltyAmount, sellerNet } = calculateSecondaryFees(amount, false)
    expect(cronosFee + royaltyAmount + sellerNet).toBe(amount)
  })

  it('el desglose siempre suma el importe total (vendedor es primer propietario)', () => {
    const amount = 73219
    const { cronosFee, royaltyAmount, sellerNet } = calculateSecondaryFees(amount, true)
    expect(cronosFee + royaltyAmount + sellerNet).toBe(amount)
  })
})

describe('constantes de comisión', () => {
  it('coinciden con las anunciadas públicamente', () => {
    expect(PRIMARY_FEE_BPS).toBe(1000)
    expect(SECONDARY_FEE_BPS).toBe(800)
    expect(ROYALTY_BPS).toBe(500)
  })
})
