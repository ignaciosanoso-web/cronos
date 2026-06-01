import { prisma } from '@/lib/prisma'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { TierBadge } from '@/components/ui/TierBadge'
import { Pagination } from '@/components/ui/Pagination'
import Link from 'next/link'
import type { Prisma } from '@prisma/client'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Borrador',
  SCHEDULED: 'Programado',
  IN_AUCTION: 'En Subasta',
  IN_VAULT: 'En Bóveda',
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'text-[#4d4635]',
  SCHEDULED: 'text-[#99907c]',
  IN_AUCTION: 'text-[#f2ca50]',
  IN_VAULT: 'text-[#a78bfa]',
}

const PAGE_SIZE = 30

export default async function AdminMomentos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page: pageParam } = await searchParams
  const query = q?.trim() ?? ''

  const where: Prisma.MomentWhereInput = query
    ? { title: { contains: query, mode: 'insensitive' } }
    : {}

  const requestedPage = Math.max(1, Number(pageParam) || 1)
  const total = await prisma.moment.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)

  const moments = await prisma.moment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      _count: { select: { auctions: true } },
    },
  })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-1">Momentos</h1>
          <p className="text-sm text-[#4d4635]">
            {total} momentos{query ? ` · "${query}"` : ' en total'}
            {totalPages > 1 && ` · página ${page}/${totalPages}`}
          </p>
        </div>
        <Link href="/admin/momentos/nuevo" className="btn-primary text-sm px-4 py-2">
          + Nuevo Momento
        </Link>
      </div>

      {/* Búsqueda */}
      <form method="GET" className="mb-6 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Buscar por título…"
          className="flex-1 bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-4 py-2 text-sm focus:outline-none focus:border-[#f2ca50] placeholder:text-[#4d4635]"
        />
        <button type="submit" className="btn-secondary text-sm px-4 py-2">
          Buscar
        </button>
        {query && (
          <Link href="/admin/momentos" className="btn-secondary text-sm px-4 py-2">
            Limpiar
          </Link>
        )}
      </form>

      <GoldDivider className="mb-6" />

      <div className="border border-[#4d4635] divide-y divide-[#4d4635]">
        {moments.length === 0 && (
          <p className="p-4 text-sm text-[#4d4635]">
            {query ? `Ningún momento coincide con "${query}".` : 'No hay momentos todavía.'}
          </p>
        )}
        {moments.map((m) => (
          <div key={m.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[#1c1b1b] group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <TierBadge tier={m.tier} />
                <p className="text-sm text-[#e5e2e1] truncate">{m.title}</p>
              </div>
              <p className="text-xs text-[#4d4635]">
                {m.year < 0 ? `${Math.abs(m.year)} a.C.` : m.year} · {m._count.auctions} subasta
                {m._count.auctions !== 1 ? 's' : ''} · {m.totalCirculation} ejemplares
              </p>
            </div>
            <span className={`label-caps text-[10px] w-24 text-right ${STATUS_COLOR[m.status]}`}>
              {STATUS_LABEL[m.status]}
            </span>
            <span className="text-sm text-[#f2ca50] font-serif w-20 text-right">
              {(m.basePrice / 100).toLocaleString('es-ES')} €
            </span>
            <Link
              href={`/admin/momentos/${m.id}`}
              className="label-caps text-[10px] text-[#4d4635] hover:text-[#f2ca50] transition-colors ml-2 opacity-0 group-hover:opacity-100"
            >
              Editar
            </Link>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/momentos"
        params={{ q: query || undefined }}
      />
    </div>
  )
}
