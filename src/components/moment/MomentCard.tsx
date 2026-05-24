import Link from 'next/link'
import type { Moment } from '@prisma/client'
import { TierBadge } from '@/components/ui/TierBadge'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { GoldDivider } from '@/components/ui/GoldDivider'

const ERA_LABELS: Record<string, string> = {
  PREHISTORIA: 'Prehistoria',
  MUNDO_ANTIGUO: 'Mundo Antiguo',
  EDAD_MEDIA: 'Edad Media',
  RENACIMIENTO: 'Renacimiento',
  ERA_INDUSTRIAL: 'Era Industrial',
  ERA_ESPACIAL: 'Era Espacial',
  ERA_DIGITAL: 'Era Digital',
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  IN_AUCTION: {
    text: 'En Subasta',
    className: 'text-[#f2ca50] border-[rgba(242,202,80,0.3)] bg-[rgba(242,202,80,0.08)]',
  },
  IN_VAULT: {
    text: 'En Bóveda',
    className: 'text-[#d0c5af] border-[rgba(208,197,175,0.25)] bg-[rgba(208,197,175,0.05)]',
  },
  SCHEDULED: { text: 'Próximamente', className: 'text-[#99907c] border-[#4d4635] bg-transparent' },
  DRAFT: { text: 'Borrador', className: 'text-[#99907c] border-[#4d4635] bg-transparent' },
}

interface MomentCardProps {
  moment: Pick<
    Moment,
    | 'slug'
    | 'title'
    | 'year'
    | 'date'
    | 'era'
    | 'tier'
    | 'status'
    | 'description'
    | 'imageUrl'
    | 'totalCirculation'
    | 'basePrice'
  >
  variant?: 'recent' | 'explorer' | 'vault'
}

/* eslint-disable @next/next/no-img-element */

export function MomentCard({ moment, variant = 'recent' }: MomentCardProps) {
  const status = STATUS_LABEL[moment.status] ?? STATUS_LABEL.SCHEDULED
  const priceEur = (moment.basePrice / 100).toLocaleString('es-ES')
  const yearLabel = moment.year < 0 ? `${Math.abs(moment.year)} a.C.` : String(moment.year)

  if (variant === 'explorer') {
    return (
      <Link
        href={`/momento/${moment.slug}`}
        className="artifact-card block bg-[#131313] cursor-pointer"
      >
        <div className="aspect-square overflow-hidden bg-[#1c1b1b] relative">
          {moment.imageUrl ? (
            <img
              src={moment.imageUrl}
              alt={moment.title}
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#1c1b1b]" />
          )}
          <div className="absolute top-4 left-4">
            <TierBadge tier={moment.tier} />
          </div>
          <div className="absolute top-4 right-4 font-serif text-[#f2ca50] bg-[rgba(19,19,19,0.8)] px-3 py-1 text-sm">
            {yearLabel}
          </div>
        </div>
        <div className="p-6">
          <LabelCaps className="text-[#99907c] block mb-2">{ERA_LABELS[moment.era]}</LabelCaps>
          <h3 className="font-serif text-xl font-bold mb-2 text-[#e5e2e1] leading-tight">
            {moment.title}
          </h3>
          <p className="text-sm text-[#a8a39e] mb-4 line-clamp-2">{moment.description}</p>
          <GoldDivider className="mb-4" />
          <div className="flex justify-between items-center">
            <div>
              <LabelCaps className="text-[#99907c] block mb-1">
                {moment.status === 'IN_AUCTION' ? 'Puja actual' : 'Precio base'}
              </LabelCaps>
              <span className="font-serif text-xl text-[#f2ca50]">{priceEur} €</span>
            </div>
            <LabelCaps className="text-[#f2ca50]">Ver →</LabelCaps>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'vault') {
    return (
      <Link
        href={`/momento/${moment.slug}`}
        className="artifact-card block bg-[#131313] p-6 cursor-pointer"
      >
        <TierBadge tier={moment.tier} className="mb-4" />
        <h3 className="font-serif text-lg font-bold text-[#e5e2e1] mb-2 leading-tight">
          {moment.title}
        </h3>
        <LabelCaps className="text-[#99907c] block mb-4">
          {yearLabel} · {ERA_LABELS[moment.era]}
        </LabelCaps>
        <div className="flex justify-between items-end">
          <LabelCaps className="text-[#99907c]">#{moment.totalCirculation}</LabelCaps>
          <span className="font-serif text-lg font-bold text-[#f2ca50]">{priceEur} €</span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/momento/${moment.slug}`}
      className="artifact-card block bg-[#131313] p-6 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <TierBadge tier={moment.tier} />
        <span className={`label-caps border px-2 py-1 text-[10px] ${status.className}`}>
          {status.text}
        </span>
      </div>

      <LabelCaps className="text-[#99907c] block mb-2">
        {yearLabel} · {ERA_LABELS[moment.era]}
      </LabelCaps>
      <h3 className="font-serif text-xl font-bold text-[#e5e2e1] mb-3 leading-tight">
        {moment.title}
      </h3>
      <p className="text-[#d0c5af] text-sm leading-relaxed line-clamp-3 mb-6">
        {moment.description}
      </p>

      <div className="flex items-end justify-between">
        <div>
          <LabelCaps className="text-[#99907c] block mb-1">Precio base</LabelCaps>
          <span className="font-serif text-2xl font-bold text-[#f2ca50]">{priceEur} €</span>
        </div>
        <LabelCaps className="text-[#99907c]">1 de {moment.totalCirculation}</LabelCaps>
      </div>
    </Link>
  )
}
