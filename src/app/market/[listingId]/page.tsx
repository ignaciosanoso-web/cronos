import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { TierBadge } from '@/components/ui/TierBadge'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { MarketActions } from '@/components/market/MarketActions'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

const ERA_LABELS: Record<string, string> = {
  PREHISTORIA: 'Prehistoria',
  MUNDO_ANTIGUO: 'Mundo Antiguo',
  EDAD_MEDIA: 'Edad Media',
  RENACIMIENTO: 'Renacimiento',
  ERA_INDUSTRIAL: 'Era Industrial',
  ERA_ESPACIAL: 'Era Espacial',
  ERA_DIGITAL: 'Era Digital',
}

const OFFER_STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-[#f2ca50]' },
  ACCEPTED: { label: 'Aceptada', color: 'text-[#5fd97a]' },
  REJECTED: { label: 'Rechazada', color: 'text-[#ff8a73]' },
  EXPIRED: { label: 'Expirada', color: 'text-[#4d4635]' },
  WITHDRAWN: { label: 'Retirada', color: 'text-[#4d4635]' },
}

async function getListing(listingId: string) {
  return prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      seller: { select: { id: true, name: true, displayName: true } },
      ownership: {
        include: {
          moment: true,
        },
      },
      offers: {
        orderBy: { amount: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, displayName: true } },
        },
      },
    },
  })
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>
}) {
  const { listingId } = await params
  const [listing, session] = await Promise.all([getListing(listingId), auth()])

  if (!listing) notFound()

  const { moment, serialNumber } = listing.ownership
  const yearLabel = moment.year < 0 ? `${Math.abs(moment.year)} a.C.` : String(moment.year)
  const askingEur = (listing.askingPrice / 100).toLocaleString('es-ES')
  const isSeller = session?.user?.id === listing.sellerId
  const isAuthenticated = !!session?.user?.id

  const myPendingOffer = listing.offers.find(
    (o) => o.buyerId === session?.user?.id && o.status === 'PENDING'
  )

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 md:py-16">
      <Link
        href="/market"
        className="inline-flex items-center gap-2 label-caps text-[#99907c] hover:text-[#f2ca50] transition-colors mb-10"
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M19 12H5M5 12l7-7M5 12l7 7" />
        </svg>
        Volver al Mercado
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-16">
        {/* Imagen */}
        <div>
          <div className="relative aspect-[4/3] bg-[#1c1b1b] overflow-hidden">
            <ImageWithFallback
              src={moment.imageUrl ?? ''}
              alt={moment.title}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full bg-[#0e0e0e] flex flex-col items-center justify-center gap-2">
                  <span className="font-serif font-bold text-[#2a2a2a] text-5xl">{yearLabel}</span>
                  <span className="font-semibold tracking-[0.2em] uppercase text-[#2a2a2a] text-[10px]">
                    {ERA_LABELS[moment.era]}
                  </span>
                </div>
              }
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <TierBadge tier={moment.tier} className="!bg-[#131313]/80" />
            </div>
            <div className="absolute top-4 right-4 font-serif text-[#f2ca50] bg-[#131313]/80 px-3 py-1 text-sm">
              #{serialNumber} / {moment.totalCirculation}
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-[#4d4635]">
            <Link
              href={`/momento/${moment.slug}`}
              className="hover:text-[#f2ca50] transition-colors underline underline-offset-2"
            >
              Ver ficha del momento →
            </Link>
          </div>
        </div>

        {/* Info + acciones */}
        <div>
          <LabelCaps className="text-[#f2ca50] block mb-3">
            {ERA_LABELS[moment.era]} · {yearLabel}
          </LabelCaps>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 leading-tight text-[#e5e2e1]">
            {moment.title}
          </h1>
          <p className="text-sm text-[#99907c] mb-6">
            Vendido por{' '}
            <Link
              href={`/curator/${listing.sellerId}`}
              className="hover:text-[#f2ca50] transition-colors"
            >
              {listing.seller.displayName ?? listing.seller.name ?? 'Curador'}
            </Link>
          </p>

          <GoldDivider className="mb-6" />

          <div className="mb-8">
            <LabelCaps className="text-[#99907c] block mb-1">Precio pedido</LabelCaps>
            <span className="font-serif text-4xl font-bold text-[#f2ca50]">{askingEur} €</span>
          </div>

          {listing.status !== 'ACTIVE' && (
            <div className="border border-[#4d4635] p-4 mb-6">
              <LabelCaps className="text-[#99907c]">
                Este listing ya no está activo (
                {listing.status === 'SOLD' ? 'vendido' : 'cancelado'})
              </LabelCaps>
            </div>
          )}

          {listing.status === 'ACTIVE' && (
            <MarketActions
              listingId={listing.id}
              askingPriceCents={listing.askingPrice}
              isSeller={isSeller}
              isAuthenticated={isAuthenticated}
              myPendingOfferId={myPendingOffer?.id}
              myPendingOfferAmount={myPendingOffer?.amount}
            />
          )}
        </div>
      </div>

      {/* Ofertas (solo visible para el vendedor o si hay oferta propia) */}
      {(isSeller || myPendingOffer) && listing.offers.length > 0 && (
        <>
          <GoldDivider className="mb-8" />
          <h2 className="font-serif text-2xl font-bold mb-6 text-[#e5e2e1]">
            {isSeller ? `Ofertas recibidas (${listing.offers.length})` : 'Tu oferta'}
          </h2>
          <div className="border border-[#4d4635]">
            {(isSeller
              ? listing.offers
              : listing.offers.filter((o) => o.buyerId === session?.user?.id)
            ).map((offer) => {
              const meta = OFFER_STATUS_META[offer.status]
              const offerEur = (offer.amount / 100).toLocaleString('es-ES')
              const buyerName = offer.buyer.displayName ?? offer.buyer.name ?? 'Curador'

              return (
                <div
                  key={offer.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#4d4635] last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-serif text-xl font-bold text-[#f2ca50]">
                        {offerEur} €
                      </span>
                      <LabelCaps className={`${meta.color} text-[9px]`}>{meta.label}</LabelCaps>
                    </div>
                    {isSeller && <p className="text-xs text-[#99907c]">por {buyerName}</p>}
                    {offer.message && (
                      <p className="text-xs text-[#a8a39e] mt-1 italic">
                        &ldquo;{offer.message}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-[#4d4635] mt-1">
                      Expira: {offer.expiresAt.toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  {isSeller && offer.status === 'PENDING' && (
                    <MarketActions
                      listingId={listing.id}
                      askingPriceCents={listing.askingPrice}
                      isSeller={true}
                      isAuthenticated={true}
                      offerId={offer.id}
                      offerMode
                    />
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
