import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { TierBadge } from '@/components/ui/TierBadge'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { AuctionLive } from '@/components/auction/AuctionLive'
import { ShareButton } from '@/components/ui/ShareButton'
import type { Tier } from '@prisma/client'

const ERA_LABELS: Record<string, string> = {
  PREHISTORIA: 'Prehistoria',
  MUNDO_ANTIGUO: 'Mundo Antiguo',
  EDAD_MEDIA: 'Edad Media',
  RENACIMIENTO: 'Renacimiento',
  ERA_INDUSTRIAL: 'Era Industrial',
  ERA_ESPACIAL: 'Era Espacial',
  ERA_DIGITAL: 'Era Digital',
}

const TIER_MECHANICS: Record<
  Tier,
  { baseLabel: string; extensionMin: number; triggerMin: number }
> = {
  MITICO: { baseLabel: '7 días', extensionMin: 30, triggerMin: 30 },
  EXCEPCIONAL: { baseLabel: '72 horas', extensionMin: 15, triggerMin: 15 },
  RARO: { baseLabel: '48 horas', extensionMin: 10, triggerMin: 10 },
  COMUN: { baseLabel: '24 horas', extensionMin: 5, triggerMin: 5 },
}

async function getMoment(slug: string) {
  return prisma.moment.findUnique({
    where: { slug },
    include: {
      contextEvents: { orderBy: { order: 'asc' } },
      auctions: {
        where: { status: { in: ['OPEN', 'EXTENDING'] } },
        orderBy: { opensAt: 'desc' },
        take: 1,
        include: {
          currentBid: true,
        },
      },
    },
  })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const moment = await getMoment(slug)
  if (!moment) return {}
  const description = moment.description.substring(0, 160)
  const images = moment.imageUrl ? [{ url: moment.imageUrl, width: 1200, height: 630 }] : []
  return {
    title: `${moment.title} — Cronos`,
    description,
    openGraph: {
      title: `${moment.title} — Cronos`,
      description,
      images,
      type: 'website',
      siteName: 'Cronos · El Archivo del Tiempo',
    },
    twitter: {
      card: images.length > 0 ? 'summary_large_image' : 'summary',
      title: `${moment.title} — Cronos`,
      description,
      images: moment.imageUrl ? [moment.imageUrl] : [],
    },
  }
}

async function getOwnership(momentId: string, userId?: string) {
  if (!userId) return null
  return prisma.ownership.findFirst({
    where: { momentId, userId },
    select: { id: true, serialNumber: true, acquisitionPrice: true, acquiredAt: true },
  })
}

async function getOwners(momentId: string) {
  return prisma.ownership.findMany({
    where: { momentId, isPublic: true },
    include: { user: { select: { displayName: true, name: true } } },
    orderBy: { serialNumber: 'asc' },
  })
}

export default async function MomentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [moment, session] = await Promise.all([getMoment(slug), auth()])

  if (!moment) notFound()

  const [ownership, owners] = await Promise.all([
    getOwnership(moment.id, session?.user?.id),
    getOwners(moment.id),
  ])

  const mechanics = TIER_MECHANICS[moment.tier]
  const activeAuction = moment.auctions[0] ?? null
  const basePriceEur = (moment.basePrice / 100).toLocaleString('es-ES')
  const yearLabel = moment.year < 0 ? `${Math.abs(moment.year)} a.C.` : String(moment.year)

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 md:py-16">
      {/* Back */}
      <Link
        href="/explorer"
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
        Volver al Explorador
      </Link>

      {/* ====== MAIN TWO-COLUMN ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-20">
        {/* LEFT — imagen */}
        <div>
          <div className="relative">
            <div className="aspect-[4/3] bg-[#1c1b1b] overflow-hidden">
              {moment.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={moment.imageUrl}
                  alt={moment.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="label-caps text-[#4d4635]">Sin imagen</span>
                </div>
              )}
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              <TierBadge tier={moment.tier} />
              <span className="label-caps border border-[#4d4635] bg-[#131313] px-2 py-1 text-[10px] text-[#99907c]">
                {ERA_LABELS[moment.era]}
              </span>
            </div>
          </div>

          {/* Sources */}
          {moment.sources.length > 0 && (
            <div className="mt-6">
              <LabelCaps className="text-[#99907c] block mb-3">Fuentes</LabelCaps>
              <ul className="space-y-1">
                {moment.sources.map((src, i) => (
                  <li key={i}>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#4d4635] hover:text-[#f2ca50] transition-colors break-all"
                    >
                      {src}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT — info + CTA */}
        <div>
          <LabelCaps className="text-[#f2ca50] block mb-3">{moment.date.toUpperCase()}</LabelCaps>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight text-[#e5e2e1]">
            {moment.title}
          </h1>
          <p className="text-[#d0c5af] leading-relaxed mb-8">{moment.description}</p>

          <GoldDivider className="mb-8" />

          {/* Stats — circulación (el precio lo gestiona AuctionLive en tiempo real) */}
          <div className="flex gap-8 mb-8">
            {!activeAuction && (
              <div>
                <LabelCaps className="text-[#99907c] block mb-1">Precio base</LabelCaps>
                <span className="font-serif text-3xl font-bold text-[#f2ca50]">
                  {basePriceEur} €
                </span>
              </div>
            )}
            <div className={activeAuction ? '' : 'border-l border-[#4d4635] pl-8'}>
              <LabelCaps className="text-[#99907c] block mb-1">Circulación</LabelCaps>
              <span className="font-serif text-xl text-[#e5e2e1]">
                {moment.totalCirculation} ejemplares
              </span>
            </div>
          </div>

          {/* Auction mechanics card */}
          <div className="border border-[#4d4635] bg-[#1c1b1b] p-5 mb-6">
            <LabelCaps className="text-[#f2ca50] block mb-2">
              Mecánica de Subasta · Tier{' '}
              {
                { MITICO: 'Mítico', EXCEPCIONAL: 'Excepcional', RARO: 'Raro', COMUN: 'Común' }[
                  moment.tier
                ]
              }
            </LabelCaps>
            <p className="text-xs text-[#a8a39e] leading-relaxed">
              Subasta base de {mechanics.baseLabel}. Cualquier puja en los últimos{' '}
              {mechanics.triggerMin} minutos extiende el cierre{' '}
              <strong className="text-[#e5e2e1]">{mechanics.extensionMin} minutos más</strong>. La
              subasta termina solo cuando esa ventana pasa sin pujas.
            </p>
          </div>

          {/* CTA */}
          {activeAuction ? (
            <AuctionLive
              auctionId={activeAuction.id}
              initialBidCents={activeAuction.currentBid?.amount ?? null}
              startPriceCents={activeAuction.startPrice}
              initialClosesAt={activeAuction.closesAt.toISOString()}
              triggerMin={mechanics.triggerMin}
              extensionMin={mechanics.extensionMin}
            />
          ) : (
            <>
              <button
                disabled
                className="btn-primary w-full opacity-40 cursor-not-allowed"
                title="Subasta no iniciada"
              >
                Subasta Próximamente
              </button>
              <p className="text-xs text-[#4d4635] mt-3 text-center">
                Sé el primer curador de este momento histórico.
              </p>
            </>
          )}

          {/* Location */}
          {moment.location && (
            <div className="mt-6 flex items-center gap-2 text-xs text-[#99907c]">
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 21c-4-4-7-7.5-7-11a7 7 0 0 1 14 0c0 3.5-3 7-7 11Z" />
                <circle cx="12" cy="10" r="2" />
              </svg>
              <span>{moment.location}</span>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-6 border-t border-[#4d4635]">
            <LabelCaps className="text-[#4d4635] block mb-3">Compartir este momento</LabelCaps>
            <ShareButton title={moment.title} slug={moment.slug} />
          </div>
        </div>
      </div>

      <GoldDivider className="mb-20" />

      {/* ====== CERTIFICADO DE PROPIEDAD ====== */}
      {ownership && (
        <>
          <GoldDivider className="mb-12" />
          <div className="border border-[#f2ca50]/30 bg-[#1c1b1b] p-8 md:p-12 mb-20 relative overflow-hidden">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#f2ca50]/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#f2ca50]/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#f2ca50]/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#f2ca50]/40" />

            <div className="text-center mb-8">
              <LabelCaps className="text-[#f2ca50] border border-[#735c00] px-4 py-1 inline-block mb-4">
                Certificado de Propiedad
              </LabelCaps>
              <h2 className="font-serif text-2xl font-bold text-[#e5e2e1]">Este momento es tuyo</h2>
            </div>

            <GoldDivider className="mb-8" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <LabelCaps className="text-[#99907c] block mb-2">Ejemplar</LabelCaps>
                <div className="font-serif text-3xl font-bold text-[#f2ca50]">
                  #{ownership.serialNumber}
                </div>
                <div className="text-xs text-[#4d4635] mt-1">de {moment.totalCirculation}</div>
              </div>
              <div>
                <LabelCaps className="text-[#99907c] block mb-2">Adquirido por</LabelCaps>
                <div className="font-serif text-3xl font-bold text-[#e5e2e1]">
                  {(ownership.acquisitionPrice / 100).toLocaleString('es-ES')} €
                </div>
              </div>
              <div>
                <LabelCaps className="text-[#99907c] block mb-2">Fecha</LabelCaps>
                <div className="font-serif text-lg font-bold text-[#e5e2e1] leading-tight">
                  {ownership.acquiredAt.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <LabelCaps className="text-[#99907c] block mb-2">Tier</LabelCaps>
                <div className="flex justify-center mt-1">
                  <TierBadge tier={moment.tier} />
                </div>
              </div>
            </div>

            <GoldDivider className="mt-8 mb-6" />

            <p className="text-center text-xs text-[#4d4635]">
              La propiedad de este momento histórico está registrada en el Protocolo Cronos. Número
              de serie permanente e intransferible.
            </p>

            <div className="mt-6 text-center">
              <Link
                href={`/certificado/${ownership.id}`}
                className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#f2ca50] border border-[#735c00] px-4 py-2 hover:bg-[rgba(242,202,80,0.08)] transition-colors"
              >
                Descargar certificado →
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ====== MURO DE PROPIETARIOS ====== */}
      {owners.length > 0 && (
        <>
          <GoldDivider className="mb-12" />
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold mb-2 text-[#e5e2e1]">
              Archivo de Propietarios
            </h2>
            <p className="text-sm text-[#99907c]">
              {owners.length} de {moment.totalCirculation} ejemplares en manos de curators.
            </p>
          </div>
          <div className="border border-[#4d4635] divide-y divide-[#4d4635] mb-20">
            {owners.map((o) => {
              const ownerName = o.user.displayName ?? o.user.name ?? 'Curador Anónimo'
              const isYours = o.userId === session?.user?.id
              return (
                <div
                  key={o.id}
                  className={`flex items-center justify-between px-6 py-4 ${isYours ? 'bg-[rgba(242,202,80,0.04)]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-xl font-bold text-[#f2ca50] tabular-nums w-12">
                      #{o.serialNumber}
                    </span>
                    <span className="text-sm text-[#e5e2e1]">
                      {ownerName}
                      {isYours && (
                        <span className="ml-2 text-[9px] font-semibold tracking-[0.15em] uppercase text-[#f2ca50] border border-[#735c00] px-1.5 py-0.5">
                          Tú
                        </span>
                      )}
                    </span>
                  </div>
                  <LabelCaps className="text-[#4d4635]">
                    {o.acquiredAt.toLocaleDateString('es-ES', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </LabelCaps>
                </div>
              )
            })}
            {moment.totalCirculation - owners.length > 0 && (
              <div className="px-6 py-4 text-center">
                <span className="text-xs text-[#4d4635]">
                  {moment.totalCirculation - owners.length} ejemplares aún sin propietario
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ====== SECONDARY TWO-COLUMN ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* LEFT — Procedencia */}
        <div className="bg-[#1c1b1b] p-8">
          <h2 className="font-serif text-2xl font-bold mb-4 text-[#e5e2e1]">Procedencia</h2>
          <GoldDivider className="mb-6" />
          <p className="text-sm text-[#d0c5af] leading-relaxed mb-6">{moment.procedence}</p>
          <div className="space-y-4">
            <div>
              <LabelCaps className="text-[#f2ca50] block mb-1">Autenticación de Fuente</LabelCaps>
              <p className="text-xs text-[#a8a39e]">
                Verificado contra registros históricos académicos. Confianza:{' '}
                {{ HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' }[moment.confidence]}.
              </p>
            </div>
            <div>
              <LabelCaps className="text-[#f2ca50] block mb-1">Fecha de Curación</LabelCaps>
              <p className="text-xs text-[#a8a39e]">
                Catalogado en La Bóveda el{' '}
                {moment.createdAt.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                .
              </p>
            </div>
            <div>
              <LabelCaps className="text-[#f2ca50] block mb-1">Año del Evento</LabelCaps>
              <p className="text-xs text-[#a8a39e]">{yearLabel}</p>
            </div>
          </div>
        </div>

        {/* RIGHT — Contexto de la Línea de Tiempo */}
        <div>
          <h2 className="font-serif text-2xl font-bold mb-4 text-[#e5e2e1]">
            Contexto de la Línea de Tiempo
          </h2>
          <GoldDivider className="mb-6" />

          {moment.contextEvents.length > 0 ? (
            <div className="space-y-6 border-l border-[#4d4635] pl-6">
              {moment.contextEvents.map((event) => (
                <div key={event.id} className="relative">
                  <div
                    className="absolute -left-[31px] top-1 w-2.5 h-2.5 rotate-45 bg-[#f2ca50]"
                    aria-hidden="true"
                  />
                  <LabelCaps className="text-[#f2ca50] block mb-1">{event.date}</LabelCaps>
                  <p className="font-serif font-bold text-[#e5e2e1] mb-1">{event.title}</p>
                  <p className="text-xs text-[#a8a39e] leading-relaxed">{event.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#4d4635]">El contexto histórico está siendo documentado.</p>
          )}
        </div>
      </div>
    </main>
  )
}
