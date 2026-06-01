import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { MomentCard } from '@/components/moment/MomentCard'
import { ExplorerFilters } from '@/components/explorer/ExplorerFilters'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { Pagination } from '@/components/ui/Pagination'
import type { Era, Tier, Category, Prisma } from '@prisma/client'

export const metadata = {
  title: 'Explorador de Épocas — Cronos',
  description: 'Navega por todos los momentos históricos. Filtra por era, tier y categoría.',
}

const PAGE_SIZE = 24

interface SearchParams {
  era?: string
  tier?: string
  cat?: string
  q?: string
  page?: string
}

function buildWhere(filters: SearchParams): Prisma.MomentWhereInput {
  return {
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
  }
}

async function getMoments(where: Prisma.MomentWhereInput, page: number) {
  return prisma.moment.findMany({
    where,
    orderBy: [{ tier: 'asc' }, { year: 'asc' }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
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
  const where = buildWhere(filters)
  const requestedPage = Math.max(1, Number(filters.page) || 1)

  const total = await prisma.moment.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const moments = await getMoments(where, page)

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
          {total} {total === 1 ? 'momento encontrado' : 'momentos encontrados'}
          {totalPages > 1 && ` · página ${page} de ${totalPages}`}
        </LabelCaps>

        {moments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#4d4635]">
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/explorer"
          params={{ era: filters.era, tier: filters.tier, cat: filters.cat, q: filters.q }}
        />
      </div>
    </main>
  )
}
