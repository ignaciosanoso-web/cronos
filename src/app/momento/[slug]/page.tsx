import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TierBadge } from '@/components/ui/TierBadge'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
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
  return {
    title: `${moment.title} — Cronos`,
    description: moment.description.substring(0, 160),
  }
}

export default async function MomentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const moment = await getMoment(slug)

  if (!moment) notFound()

  const mechanics = TIER_MECHANICS[moment.tier]
  const activeAuction = moment.auctions[0] ?? null
  const currentBidEur = activeAuction?.currentBid
    ? (activeAuction.currentBid.amount / 100).toLocaleString('es-ES')
    : null
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

          {/* Stats */}
          <div className="flex gap-8 mb-8">
            <div>
              <LabelCaps className="text-[#99907c] block mb-1">
                {activeAuction ? 'Puja actual' : 'Precio base'}
              </LabelCaps>
              <span className="font-serif text-3xl font-bold text-[#f2ca50]">
                {activeAuction && currentBidEur ? currentBidEur : basePriceEur} €
              </span>
            </div>
            <div className="border-l border-[#4d4635] pl-8">
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
            <Link
              href={`/momento/${moment.slug}/pujar`}
              className="btn-primary w-full text-center block"
            >
              Pujar Ahora
            </Link>
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
        </div>
      </div>

      <GoldDivider className="mb-20" />

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
