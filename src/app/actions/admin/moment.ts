'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Era, Category, Tier, Confidence, MomentStatus } from '@prisma/client'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  if (session.user.role !== 'ADMIN') throw new Error('Sin permisos')
  return session.user.id
}

export type MomentFormData = {
  title: string
  year: number
  date: string
  era: Era
  category: Category
  tier: Tier
  confidence: Confidence
  description: string
  procedence: string
  imageUrl: string
  location: string
  totalCirculation: number
  basePrice: number // en euros, se convierte a céntimos
  sources: string // separadas por comas
  status: MomentStatus
}

export async function createMoment(
  data: MomentFormData
): Promise<{ success: true; slug: string } | { error: string }> {
  try {
    await requireAdmin()

    const baseSlug = slugify(data.title)
    // Evitar colisiones de slug
    let slug = baseSlug
    let suffix = 0
    while (await prisma.moment.findUnique({ where: { slug } })) {
      suffix++
      slug = `${baseSlug}-${suffix}`
    }

    const moment = await prisma.moment.create({
      data: {
        slug,
        title: data.title.trim(),
        year: data.year,
        date: data.date.trim(),
        era: data.era,
        category: data.category,
        tier: data.tier,
        confidence: data.confidence,
        description: data.description.trim(),
        procedence: data.procedence.trim(),
        imageUrl: data.imageUrl.trim(),
        location: data.location.trim() || null,
        totalCirculation: data.totalCirculation,
        basePrice: Math.round(data.basePrice * 100), // euros → céntimos
        status: data.status,
        sources: data.sources
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      },
    })

    revalidatePath('/admin/momentos')
    revalidatePath('/explorer')
    return { success: true, slug: moment.slug }
  } catch (err) {
    console.error('[createMoment]', err)
    return { error: err instanceof Error ? err.message : 'Error al crear el momento.' }
  }
}

export async function updateMoment(
  id: string,
  data: MomentFormData
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin()

    await prisma.moment.update({
      where: { id },
      data: {
        title: data.title.trim(),
        year: data.year,
        date: data.date.trim(),
        era: data.era,
        category: data.category,
        tier: data.tier,
        confidence: data.confidence,
        description: data.description.trim(),
        procedence: data.procedence.trim(),
        imageUrl: data.imageUrl.trim(),
        location: data.location.trim() || null,
        totalCirculation: data.totalCirculation,
        basePrice: Math.round(data.basePrice * 100),
        status: data.status,
        sources: data.sources
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      },
    })

    revalidatePath('/admin/momentos')
    revalidatePath('/explorer')
    return { success: true }
  } catch (err) {
    console.error('[updateMoment]', err)
    return { error: err instanceof Error ? err.message : 'Error al actualizar el momento.' }
  }
}
