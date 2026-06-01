import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/email', () => ({ sendRoyaltyEmail: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    ownership: { findUnique: vi.fn() },
    listing: { findUnique: vi.fn(), create: vi.fn() },
    offer: { findFirst: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { createListing, cancelListing, makeOffer } from './market'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockAuth = vi.mocked(auth)
const mockPrisma = vi.mocked(prisma, true)

function signedInAs(id: string) {
  mockAuth.mockResolvedValue({ user: { id } } as never)
}

beforeEach(() => vi.clearAllMocks())

describe('createListing', () => {
  it('rechaza si no eres el propietario', async () => {
    signedInAs('intruso')
    mockPrisma.ownership.findUnique.mockResolvedValue({
      id: 'own_1',
      userId: 'dueño',
      listings: [],
    } as never)
    const res = await createListing('own_1', 100)
    expect(res).toEqual({ error: 'No eres el propietario.' })
  })

  it('rechaza si ya hay un listing activo', async () => {
    signedInAs('dueño')
    mockPrisma.ownership.findUnique.mockResolvedValue({
      id: 'own_1',
      userId: 'dueño',
      listings: [{ id: 'lst_x' }],
    } as never)
    const res = await createListing('own_1', 100)
    expect(res).toEqual({ error: 'Este ejemplar ya está en venta.' })
  })

  it('rechaza un precio inválido (≤ 0)', async () => {
    signedInAs('dueño')
    mockPrisma.ownership.findUnique.mockResolvedValue({
      id: 'own_1',
      userId: 'dueño',
      listings: [],
    } as never)
    const res = await createListing('own_1', 0)
    expect(res).toEqual({ error: 'El precio debe ser de al menos 1 €.' })
    expect(mockPrisma.listing.create).not.toHaveBeenCalled()
  })

  it('crea el listing convirtiendo euros a céntimos', async () => {
    signedInAs('dueño')
    mockPrisma.ownership.findUnique.mockResolvedValue({
      id: 'own_1',
      userId: 'dueño',
      listings: [],
    } as never)
    mockPrisma.listing.create.mockResolvedValue({ id: 'lst_new' } as never)
    const res = await createListing('own_1', 150)
    expect(res).toEqual({ success: true, listingId: 'lst_new' })
    expect(mockPrisma.listing.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ askingPrice: 15000 }) })
    )
  })
})

describe('cancelListing', () => {
  it('rechaza si no eres el vendedor', async () => {
    signedInAs('intruso')
    mockPrisma.listing.findUnique.mockResolvedValue({
      id: 'lst_1',
      sellerId: 'dueño',
      status: 'ACTIVE',
    } as never)
    const res = await cancelListing('lst_1')
    expect(res).toEqual({ error: 'Sin permisos.' })
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('rechaza si el listing no está activo', async () => {
    signedInAs('dueño')
    mockPrisma.listing.findUnique.mockResolvedValue({
      id: 'lst_1',
      sellerId: 'dueño',
      status: 'SOLD',
    } as never)
    const res = await cancelListing('lst_1')
    expect(res).toEqual({ error: 'El listing ya no está activo.' })
  })
})

describe('makeOffer', () => {
  it('rechaza ofertar en tu propio listing', async () => {
    signedInAs('dueño')
    mockPrisma.listing.findUnique.mockResolvedValue({
      id: 'lst_1',
      sellerId: 'dueño',
      status: 'ACTIVE',
      ownership: {},
    } as never)
    const res = await makeOffer('lst_1', 100)
    expect(res).toEqual({ error: 'No puedes hacerte una oferta a ti mismo.' })
  })

  it('rechaza una segunda oferta pendiente del mismo comprador', async () => {
    signedInAs('comprador')
    mockPrisma.listing.findUnique.mockResolvedValue({
      id: 'lst_1',
      sellerId: 'vendedor',
      status: 'ACTIVE',
      ownership: {},
    } as never)
    mockPrisma.offer.findFirst.mockResolvedValue({ id: 'off_existente' } as never)
    const res = await makeOffer('lst_1', 100)
    expect(res).toEqual({
      error: 'Ya tienes una oferta pendiente en este listing. Retírala primero.',
    })
    expect(mockPrisma.offer.create).not.toHaveBeenCalled()
  })

  it('crea la oferta cuando todo es válido', async () => {
    signedInAs('comprador')
    mockPrisma.listing.findUnique.mockResolvedValue({
      id: 'lst_1',
      sellerId: 'vendedor',
      status: 'ACTIVE',
      ownership: {},
    } as never)
    mockPrisma.offer.findFirst.mockResolvedValue(null as never)
    mockPrisma.offer.create.mockResolvedValue({ id: 'off_new' } as never)
    const res = await makeOffer('lst_1', 200, '  Me interesa  ')
    expect(res).toEqual({ success: true, offerId: 'off_new' })
    expect(mockPrisma.offer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 20000, message: 'Me interesa' }),
      })
    )
  })
})
