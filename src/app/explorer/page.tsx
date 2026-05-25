import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { MomentCard } from '@/components/moment/MomentCard'
import { ExplorerFilters } from '@/components/explorer/ExplorerFilters'
import { LabelCaps } from '@/components/ui/LabelCaps'
import type { Era, Tier, Category } from '@prisma/client'

export const metadata = {
  title: 'Explorador de Épocas — Cronos',
  description: 'Navega por todos los momentos históricos. Filtra por era, tier y categoría.',
}

interface SearchParams {
  era?: string
  tier?: string
  cat?: string
  q?: string
}

async function getMoments(filters: SearchParams) {
  return prisma.moment.findMany({
    where: {
      status: { in: ['IN_AUCTION', 'IN_VAULT', 'SCHEDULED'] },
      ...(filters.era ? { era: filters.era as Era } : {}),
      ...(filters.tier ? { tier: filters.tier as Tier } : {}),
      ...(filters.cat ? { category: filters.cat as Category } : {}),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: 'insensitive' } },
              { description: { contains: filters.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ tier: 'asc' }, { year: 'asc' }],
    select: {
      slug: true,
      title: true,
      year: true,
      date: true,
      era: true,
      tier: true,
      status: true,
      description: true,
      imageUrl: true,
      totalCirculation: true,
      basePrice: true,
    },
  })
}

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams
  const moments = await getMoments(filters)

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="font-serif text-5xl font-bold mb-3 text-[#e5e2e1]">Explorador de Épocas</h1>
        <p className="text-[#d0c5af]">
          Navega por el continuo. Adquiere momentos de profunda importancia.
        </p>
      </div>

      <Suspense fallback={<div className="border border-[#4d4635] p-6 h-40" />}>
        <ExplorerFilters />
      </Suspense>

      <div className="mt-10">
        <LabelCaps className="text-[#4d4635] block mb-6">
          {moments.length} {moments.length === 1 ? 'momento encontrado' : 'momentos encontrados'}
        </LabelCaps>

        {moments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#4d4635]">
            {moments.map((moment) => (
              <MomentCard key={moment.slug} moment={moment} variant="explorer" />
            ))}
          </div>
        ) : (
          <div className="border border-[#4d4635] p-20 text-center">
            <p className="text-[#99907c] text-sm">
              Ningún momento coincide con los filtros seleccionados.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
