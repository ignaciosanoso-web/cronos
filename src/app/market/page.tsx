import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { TierBadge } from '@/components/ui/TierBadge'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Pagination } from '@/components/ui/Pagination'

export const metadata = {
  title: 'Mercado Secundario — Cronos',
  description: 'Compra momentos históricos directamente de otros curadores.',
}

const ERA_LABELS: Record<string, string> = {
  PREHISTORIA: 'Prehistoria',
  MUNDO_ANTIGUO: 'Mundo Antiguo',
  EDAD_MEDIA: 'Edad Media',
  RENACIMIENTO: 'Renacimiento',
  ERA_INDUSTRIAL: 'Era Industrial',
  ERA_ESPACIAL: 'Era Espacial',
  ERA_DIGITAL: 'Era Digital',
}

const PAGE_SIZE = 24

async function getListings(page: number) {
  return prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      seller: { select: { id: true, name: true, displayName: true } },
      ownership: {
        include: {
          moment: {
            select: {
              slug: true,
              title: true,
              year: true,
              era: true,
              tier: true,
              imageUrl: true,
              totalCirculation: true,
            },
          },
        },
      },
      _count: { select: { offers: true } },
    },
  })
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const requestedPage = Math.max(1, Number(pageParam) || 1)

  const total = await prisma.listing.count({ where: { status: 'ACTIVE' } })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const listings = await getListings(page)

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      <div className="mb-12">
        <LabelCaps className="text-[#f2ca50] block mb-3">Mercado Secundario</LabelCaps>
        <h1 className="font-serif text-5xl font-bold mb-3 text-[#e5e2e1]">Momentos en Venta</h1>
        <p className="text-[#d0c5af]">
          Momentos históricos listados directamente por sus curadores. Haz tu oferta.
        </p>
      </div>

      <GoldDivider className="mb-10" />

      {listings.length === 0 ? (
        <div className="border border-[#4d4635] p-20 text-center">
          <p className="text-[#99907c] text-sm mb-4">
            Ningún curador ha puesto momentos a la venta todavía.
          </p>
          <Link href="/explorer" className="btn-secondary">
            Explorar momentos
          </Link>
        </div>
      ) : (
        <>
          <LabelCaps className="text-[#4d4635] block mb-6">
            {total} {total === 1 ? 'listing activo' : 'listings activos'}
            {totalPages > 1 && ` · página ${page} de ${totalPages}`}
          </LabelCaps>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#4d4635]">
            {listings.map((listing) => {
              const { moment, serialNumber } = listing.ownership
              const yearLabel =
                moment.year < 0 ? `${Math.abs(moment.year)} a.C.` : String(moment.year)
              const priceEur = (listing.askingPrice / 100).toLocaleString('es-ES')
              const sellerName = listing.seller.displayName ?? listing.seller.name ?? 'Curador'

              const imagePlaceholder = (
                <div className="w-full h-full bg-[#0e0e0e] flex flex-col items-center justify-center gap-2">
                  <span className="font-serif font-bold text-[#2a2a2a] text-4xl">{yearLabel}</span>
                  <span className="font-semibold tracking-[0.2em] uppercase text-[#2a2a2a] text-[10px]">
                    {ERA_LABELS[moment.era]}
                  </span>
                </div>
              )

              return (
                <Link
                  key={listing.id}
                  href={`/market/${listing.id}`}
                  className="group bg-[#131313] block hover:bg-[#1c1b1b] transition-colors border-b border-r border-[#4d4635]"
                >
                  {/* Imagen */}
                  <div className="aspect-[4/3] bg-[#1c1b1b] overflow-hidden relative">
                    <ImageWithFallback
                      src={moment.imageUrl ?? ''}
                      alt={moment.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      fallback={imagePlaceholder}
                    />
                    <div className="absolute top-3 left-3">
                      <TierBadge tier={moment.tier} className="!bg-[#131313]/80" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="label-caps text-[10px] bg-[#131313]/80 border border-[#f2ca50]/40 px-2 py-1 text-[#f2ca50]">
                        #{serialNumber}/{moment.totalCirculation}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <LabelCaps className="text-[#4d4635] block mb-1 text-[9px]">
                      {ERA_LABELS[moment.era]} · {yearLabel}
                    </LabelCaps>
                    <h3 className="font-serif font-bold text-[#e5e2e1] leading-tight mb-3 group-hover:text-[#f2ca50] transition-colors">
                      {moment.title}
                    </h3>
                    <GoldDivider className="mb-3" />
                    <div className="flex items-end justify-between">
                      <div>
                        <LabelCaps className="text-[#4d4635] block mb-0.5 text-[9px]">
                          Precio pedido
                        </LabelCaps>
                        <span className="font-serif text-xl font-bold text-[#f2ca50]">
                          {priceEur} €
                        </span>
                      </div>
                      <div className="text-right">
                        <LabelCaps className="text-[#4d4635] block mb-0.5 text-[9px]">
                          Vendedor
                        </LabelCaps>
                        <span className="text-xs text-[#99907c]">{sellerName}</span>
                      </div>
                    </div>
                    {listing._count.offers > 0 && (
                      <p className="text-xs text-[#4d4635] mt-2">
                        {listing._count.offers} {listing._count.offers === 1 ? 'oferta' : 'ofertas'}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} basePath="/market" />
        </>
      )}
    </main>
  )
}
