'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  return session.user
}

// ── Crear petición ───────────────────────────────────────────────────────────
export async function createPetition(
  proposedYear: number,
  proposedTitle: string,
  justification: string,
  sources: string[]
): Promise<{ success: true; id: string } | { error: string }> {
  try {
    const user = await requireUser()

    if (!proposedTitle.trim()) return { error: 'El título es obligatorio.' }
    if (!justification.trim() || justification.length < 50)
      return { error: 'La justificación debe tener al menos 50 caracteres.' }
    if (proposedYear < -100000 || proposedYear > new Date().getFullYear())
      return { error: 'Año fuera de rango.' }

    // Máximo 3 peticiones activas por usuario
    const activeCount = await prisma.petition.count({
      where: { proposerId: user.id, status: 'IN_REVIEW' },
    })
    if (activeCount >= 3)
      return { error: 'Ya tienes 3 peticiones en revisión. Espera a que se resuelvan.' }

    const petition = await prisma.petition.create({
      data: {
        proposerId: user.id,
        proposedYear,
        proposedTitle: proposedTitle.trim(),
        justification: justification.trim(),
        sources: sources.filter((s) => s.trim()),
        status: 'IN_REVIEW',
      },
    })

    revalidatePath('/petitions')
    return { success: true, id: petition.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al crear la petición.' }
  }
}

// ── Votar petición ───────────────────────────────────────────────────────────
export async function votePetition(
  petitionId: string
): Promise<{ voted: boolean } | { error: string }> {
  try {
    const user = await requireUser()

    const petition = await prisma.petition.findUnique({ where: { id: petitionId } })
    if (!petition) return { error: 'Petición no encontrada.' }
    if (petition.status !== 'IN_REVIEW') return { error: 'Esta petición ya no está en revisión.' }
    if (petition.proposerId === user.id) return { error: 'No puedes votar tu propia petición.' }

    const existing = await prisma.petitionVote.findUnique({
      where: { petitionId_userId: { petitionId, userId: user.id } },
    })

    if (existing) {
      // Toggle off
      await prisma.petitionVote.delete({
        where: { petitionId_userId: { petitionId, userId: user.id } },
      })
      revalidatePath('/petitions')
      return { voted: false }
    }

    await prisma.petitionVote.create({ data: { petitionId, userId: user.id } })
    revalidatePath('/petitions')
    return { voted: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al votar.' }
  }
}
