import { describe, it, expect } from 'vitest'
import {
  normalizeEmail,
  isValidEmail,
  parseEurosToCents,
  isValidBid,
  cleanText,
} from './validators'

describe('normalizeEmail', () => {
  it('recorta espacios y pasa a minúsculas', () => {
    expect(normalizeEmail('  Curador@Cronos.APP  ')).toBe('curador@cronos.app')
  })
})

describe('isValidEmail', () => {
  it('acepta emails con formato válido', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('  Nacho@Cronos.app ')).toBe(true)
  })

  it('rechaza formatos inválidos', () => {
    expect(isValidEmail('sin-arroba.com')).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('a @b.co')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('parseEurosToCents', () => {
  it('convierte euros a céntimos', () => {
    expect(parseEurosToCents(10)).toBe(1000)
    expect(parseEurosToCents(1.5)).toBe(150)
  })

  it('acepta strings con coma o punto decimal', () => {
    expect(parseEurosToCents('12,50')).toBe(1250)
    expect(parseEurosToCents('12.50')).toBe(1250)
  })

  it('redondea al céntimo', () => {
    expect(parseEurosToCents(9.999)).toBe(1000)
  })

  it('rechaza valores no positivos o no finitos', () => {
    expect(parseEurosToCents(0)).toBeNull()
    expect(parseEurosToCents(-5)).toBeNull()
    expect(parseEurosToCents('abc')).toBeNull()
    expect(parseEurosToCents(Infinity)).toBeNull()
  })

  it('respeta el mínimo por defecto de 1 € (100 céntimos)', () => {
    expect(parseEurosToCents(0.5)).toBeNull() // 50 céntimos < 100
    expect(parseEurosToCents(1)).toBe(100)
  })

  it('permite configurar el mínimo', () => {
    expect(parseEurosToCents(0.5, 1)).toBe(50)
  })
})

describe('isValidBid', () => {
  it('acepta pujas iguales o superiores a la mínima', () => {
    expect(isValidBid(105000, 105000)).toBe(true)
    expect(isValidBid(110000, 105000)).toBe(true)
  })

  it('rechaza pujas por debajo de la mínima', () => {
    expect(isValidBid(104999, 105000)).toBe(false)
  })

  it('rechaza importes no enteros o no finitos', () => {
    expect(isValidBid(100.5, 100)).toBe(false)
    expect(isValidBid(NaN, 100)).toBe(false)
    expect(isValidBid(Infinity, 100)).toBe(false)
  })
})

describe('cleanText', () => {
  it('recorta espacios', () => {
    expect(cleanText('  hola  ')).toBe('hola')
  })

  it('devuelve null para vacío, null o undefined', () => {
    expect(cleanText('   ')).toBeNull()
    expect(cleanText(null)).toBeNull()
    expect(cleanText(undefined)).toBeNull()
  })

  it('devuelve null si supera maxLength', () => {
    expect(cleanText('a'.repeat(401))).toBeNull()
    expect(cleanText('a'.repeat(400))).toBe('a'.repeat(400))
  })

  it('respeta un maxLength personalizado', () => {
    expect(cleanText('hola', 3)).toBeNull()
    expect(cleanText('hol', 3)).toBe('hol')
  })
})
