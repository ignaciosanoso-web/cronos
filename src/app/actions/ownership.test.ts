import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks de las dependencias externas ───────────────────────────────────────
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/email', () => ({ sendMomentReceivedEmail: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    ownership: { findUnique: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { transferOwnership, toggleOwnershipPublic } from './ownership'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMomentReceivedEmail } from '@/lib/email'

const mockAuth = vi.mocked(auth)
const mockPrisma = vi.mocked(prisma, true)

function signedInAs(id: string) {
  mockAuth.mockResolvedValue({ user: { id } } as never)
}

const OWNERSHIP = {
  id: 'own_1',
  userId: 'user_sender',
  momentId: 'mom_1',
  serialNumber: 3,
  moment: { slug: 'primer-iphone', title: 'Steve Jobs Presenta el iPhone' },
  listings: [] as { id: string }[],
}

beforeEach(() => {
  vi.clearAllMocks()
  // $transaction ejecuta el callback con un `tx` con los métodos usados
  mockPrisma.$transaction.mockImplementation(async (cb: unknown) => {
    if (typeof cb === 'function') {
      return (cb as (tx: unknown) => unknown)({
        listing: { updateMany: vi.fn() },
        offer: { updateMany: vi.fn() },
        ownership: { update: vi.fn() },
        notification: { create: vi.fn() },
      })
    }
  })
})

describe('transferOwnership', () => {
  it('rechaza si no hay sesión', async () => {
    mockAuth.mockResolvedValue(null as never)
    const res = await transferOwnership('own_1', 'a@b.co')
    expect(res).toEqual({ error: 'No autenticado' })
  })

  it('rechaza un email mal formado sin tocar la BD', async () => {
    signedInAs('user_sender')
    const res = await transferOwnership('own_1', 'no-es-email')
    expect(res).toEqual({ error: 'Introduce un email válido.' })
    expect(mockPrisma.ownership.findUnique).not.toHaveBeenCalled()
  })

  it('rechaza si el solicitante no es el propietario', async () => {
    signedInAs('user_intruso')
    mockPrisma.ownership.findUnique.mockResolvedValue(OWNERSHIP as never)
    const res = await transferOwnership('own_1', 'dest@cronos.app')
    expect(res).toEqual({ error: 'No autorizado' })
  })

  it('rechaza si el receptor no existe', async () => {
    signedInAs('user_sender')
    mockPrisma.ownership.findUnique.mockResolvedValue(OWNERSHIP as never)
    // recipient=null, sender=algo
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce({ displayName: 'Yo', name: null, email: 's@c.app' } as never)
    const res = await transferOwnership('own_1', 'fantasma@cronos.app')
    expect(res).toEqual({ error: 'No existe ningún curador registrado con ese email.' })
  })

  it('rechaza transferirse a uno mismo', async () => {
    signedInAs('user_sender')
    mockPrisma.ownership.findUnique.mockResolvedValue(OWNERSHIP as never)
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({ id: 'user_sender', email: 's@c.app' } as never)
      .mockResolvedValueOnce({ displayName: 'Yo', name: null, email: 's@c.app' } as never)
    const res = await transferOwnership('own_1', 's@c.app')
    expect(res).toEqual({ error: 'No puedes transferirte un momento a ti mismo.' })
  })

  it('transfiere correctamente y notifica por email al receptor', async () => {
    signedInAs('user_sender')
    mockPrisma.ownership.findUnique.mockResolvedValue(OWNERSHIP as never)
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({ id: 'user_dest', email: 'dest@cronos.app' } as never)
      .mockResolvedValueOnce({ displayName: 'Nacho', name: null, email: 's@c.app' } as never)

    const res = await transferOwnership('own_1', 'dest@cronos.app')

    expect(res).toEqual({ success: true })
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
    expect(sendMomentReceivedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'dest@cronos.app',
        momentTitle: OWNERSHIP.moment.title,
        fromName: 'Nacho',
      })
    )
  })
})

describe('toggleOwnershipPublic', () => {
  it('rechaza si no es el propietario', async () => {
    signedInAs('user_intruso')
    mockPrisma.ownership.findUnique.mockResolvedValue({ userId: 'otro' } as never)
    const res = await toggleOwnershipPublic('own_1', true)
    expect(res).toEqual({ error: 'No autorizado' })
    expect(mockPrisma.ownership.update).not.toHaveBeenCalled()
  })

  it('actualiza la visibilidad del propietario', async () => {
    signedInAs('user_sender')
    mockPrisma.ownership.findUnique.mockResolvedValue({ userId: 'user_sender' } as never)
    const res = await toggleOwnershipPublic('own_1', false)
    expect(res).toEqual({ success: true })
    expect(mockPrisma.ownership.update).toHaveBeenCalledWith({
      where: { id: 'own_1' },
      data: { isPublic: false },
    })
  })
})
