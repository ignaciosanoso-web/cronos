import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TierBadge } from '@/components/ui/TierBadge'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { GoldDivider } from '@/components/ui/GoldDivider'
import type { Era, Tier } from '@prisma/client'

export const metadata = {
  title: 'Línea de Tiempo — Cronos',
  description: 'Navega cronológicamente por todos los momentos históricos curados por Cronos.',
}

const ERA_ORDER: Era[] = [
  'PREHISTORIA',
  'MUNDO_ANTIGUO',
  'EDAD_MEDIA',
  'RENACIMIENTO',
  'ERA_INDUSTRIAL',
  'ERA_ESPACIAL',
  'ERA_DIGITAL',
]

const ERA_META: Record<Era, { label: string; span: string; id: string }> = {
  PREHISTORIA: { label: 'Prehistoria', span: '300.000 a.C. – 3.000 a.C.', id: 'prehistoria' },
  MUNDO_ANTIGUO: { label: 'Mundo Antiguo', span: '3.000 a.C. – 476 d.C.', id: 'mundo-antiguo' },
  EDAD_MEDIA: { label: 'Edad Media', span: '476 – 1492', id: 'edad-media' },
  RENACIMIENTO: { label: 'Renacimiento', span: '1300 – 1700', id: 'renacimiento' },
  ERA_INDUSTRIAL: { label: 'Era Industrial', span: '1760 – 1914', id: 'era-industrial' },
  ERA_ESPACIAL: { label: 'Era Espacial', span: '1957 – 1991', id: 'era-espacial' },
  ERA_DIGITAL: { label: 'Era Digital', span: '1991 – hoy', id: 'era-digital' },
}

const TIER_COLOR: Record<Tier, string> = {
  MITICO: 'bg-[#f2ca50]',
  EXCEPCIONAL: 'bg-[#d4af37]',
  RARO: 'bg-[#c9c6c0]',
  COMUN: 'bg-[#99907c]',
}

async function getMoments() {
  return prisma.moment.findMany({
    where: { status: { in: ['IN_AUCTION', 'IN_VAULT', 'SCHEDULED'] } },
    orderBy: { year: 'asc' },
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

export default async function TimelinePage() {
  const moments = await getMoments()

  const byEra = ERA_ORDER.reduce<Record<Era, typeof moments>>(
    (acc, era) => {
      acc[era] = moments.filter((m) => m.era === era)
      return acc
    },
    {} as Record<Era, typeof moments>
  )

  const erasWithMoments = ERA_ORDER.filter((era) => byEra[era].length > 0)

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <LabelCaps className="text-[#f2ca50] block mb-2">Navegación Cronológica</LabelCaps>
        <h1 className="font-serif text-5xl font-bold leading-tight text-[#e5e2e1] mb-3">
          El Río del Tiempo
        </h1>
        <p className="text-[#d0c5af] text-sm max-w-xl mb-8">
          Todos los momentos curados, ordenados desde la aurora de la civilización hasta el
          presente.
        </p>

        {/* Jump chips */}
        <div className="flex flex-wrap gap-2">
          {erasWithMoments.map((era) => (
            <a key={era} href={`#${ERA_META[era].id}`} className="chip">
              {ERA_META[era].label}
            </a>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-12">
        {(['MITICO', 'EXCEPCIONAL', 'RARO', 'COMUN'] as Tier[]).map((tier) => (
          <div key={tier} className="flex items-center gap-2">
            <span className={`w-2 h-2 rotate-45 inline-block ${TIER_COLOR[tier]}`} />
            <LabelCaps className="text-[#99907c]">
              {{ MITICO: 'Mítico', EXCEPCIONAL: 'Excepcional', RARO: 'Raro', COMUN: 'Común' }[tier]}
            </LabelCaps>
          </div>
        ))}
      </div>

      <GoldDivider className="mb-16" />

      {/* Timeline por era */}
      <div className="space-y-24">
        {erasWithMoments.map((era) => {
          const meta = ERA_META[era]
          const eraMoments = byEra[era]

          return (
            <section key={era} id={meta.id}>
              {/* Era header */}
              <div className="flex items-end justify-between mb-8">
                <div>
                  <LabelCaps className="text-[#f2ca50] block mb-1">{meta.span}</LabelCaps>
                  <h2 className="font-serif text-3xl font-bold text-[#e5e2e1]">{meta.label}</h2>
                </div>
                <LabelCaps className="text-[#4d4635]">
                  {eraMoments.length} {eraMoments.length === 1 ? 'momento' : 'momentos'}
                </LabelCaps>
              </div>

              <GoldDivider className="mb-10" />

              {/* Entries */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[88px] md:left-[120px] top-0 bottom-0 w-px bg-[#4d4635]" />

                <div className="space-y-0">
                  {eraMoments.map((moment, idx) => {
                    const yearLabel =
                      moment.year < 0 ? `${Math.abs(moment.year)} a.C.` : String(moment.year)
                    const priceEur = (moment.basePrice / 100).toLocaleString('es-ES')
                    const isLast = idx === eraMoments.length - 1

                    return (
                      <div
                        key={moment.slug}
                        className={`flex gap-0 ${isLast ? '' : 'border-b border-[#1c1b1b]'}`}
                      >
                        {/* Year column */}
                        <div className="w-[88px] md:w-[120px] pt-6 pb-6 pr-6 flex-shrink-0 text-right">
                          <span className="font-serif text-sm text-[#99907c]">{yearLabel}</span>
                        </div>

                        {/* Diamond marker */}
                        <div className="relative flex-shrink-0 pt-7">
                          <div
                            className={`w-2.5 h-2.5 rotate-45 relative z-10 ${TIER_COLOR[moment.tier]}`}
                            style={{ marginLeft: '-5px' }}
                          />
                        </div>

                        {/* Content */}
                        <Link
                          href={`/momento/${moment.slug}`}
                          className="flex-1 pl-8 py-6 group hover:bg-[#1c1b1b] transition-colors"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <TierBadge tier={moment.tier} />
                            {moment.status === 'IN_AUCTION' && (
                              <span className="label-caps text-[10px] border border-[rgba(242,202,80,0.3)] bg-[rgba(242,202,80,0.08)] text-[#f2ca50] px-2 py-1">
                                En Subasta
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-xl font-bold text-[#e5e2e1] mb-2 leading-tight group-hover:text-[#f2ca50] transition-colors">
                            {moment.title}
                          </h3>
                          <p className="text-sm text-[#a8a39e] leading-relaxed line-clamp-2 mb-3 max-w-2xl">
                            {moment.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="font-serif text-[#f2ca50]">{priceEur} €</span>
                            <LabelCaps className="text-[#4d4635]">
                              {moment.totalCirculation} ejemplares
                            </LabelCaps>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* Footer count */}
      <GoldDivider className="mt-24 mb-8" />
      <div className="text-center">
        <LabelCaps className="text-[#4d4635]">
          {moments.length} momentos en el archivo histórico
        </LabelCaps>
      </div>
    </main>
  )
}
