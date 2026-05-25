import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { MomentCard } from '@/components/moment/MomentCard'
import { TierBadge } from '@/components/ui/TierBadge'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { GoldDivider } from '@/components/ui/GoldDivider'
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

async function getCuratorData(userId: string) {
  const [user, royalties, allPublishedMoments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        ownerships: {
          where: { isPublic: true },
          include: {
            moment: {
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
            },
          },
          orderBy: { acquiredAt: 'desc' },
        },
      },
    }),
    prisma.transaction.aggregate({
      where: { kind: 'ROYALTY_PAYMENT', royaltyRecipientId: userId },
      _sum: { royaltyAmount: true },
      _count: true,
    }),
    prisma.moment.findMany({
      where: { status: { not: 'DRAFT' } },
      select: { id: true, era: true },
    }),
  ])

  return { user, royalties, allPublishedMoments }
}

const TIER_ORDER: Record<Tier, number> = { MITICO: 0, EXCEPCIONAL: 1, RARO: 2, COMUN: 3 }

export default async function CuratorProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const [{ user: curator, royalties, allPublishedMoments }, session] = await Promise.all([
    getCuratorData(userId),
    auth(),
  ])

  if (!curator) notFound()

  const isOwnProfile = session?.user?.id === userId
  const displayName = curator.displayName ?? curator.name ?? 'Curador Anónimo'
  const totalValue = curator.ownerships.reduce((s, o) => s + o.acquisitionPrice, 0)
  const totalRoyalties = royalties._sum.royaltyAmount ?? 0
  const years = curator.ownerships.map((o) => o.moment.year)
  const yearSpan = years.length >= 2 ? Math.abs(Math.max(...years) - Math.min(...years)) : null

  // Top tier badge
  const topTier = curator.ownerships
    .map((o) => o.moment.tier)
    .sort((a, b) => TIER_ORDER[a] - TIER_ORDER[b])[0]

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Colecciones completas
  const ownedMomentIds = new Set(curator.ownerships.map((o) => o.momentId))
  const momentsByEra = allPublishedMoments.reduce<Record<string, string[]>>((acc, m) => {
    if (!acc[m.era]) acc[m.era] = []
    acc[m.era].push(m.id)
    return acc
  }, {})
  const completedEras = Object.entries(momentsByEra)
    .filter(([, ids]) => ids.length > 0 && ids.every((id) => ownedMomentIds.has(id)))
    .map(([era]) => era)

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      {/* Header del perfil */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {curator.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={curator.avatarUrl}
              alt={displayName}
              className="w-24 h-24 object-cover border border-[#4d4635]"
            />
          ) : (
            <div className="w-24 h-24 bg-[#1c1b1b] border border-[#4d4635] flex items-center justify-center">
              <span className="font-serif text-3xl font-bold text-[#f2ca50]">{initials}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="font-serif text-4xl font-bold text-[#e5e2e1]">{displayName}</h1>
            {topTier && <TierBadge tier={topTier} />}
          </div>
          {curator.bio ? (
            <p className="text-[#d0c5af] leading-relaxed max-w-2xl mb-4">{curator.bio}</p>
          ) : (
            <p className="text-[#4d4635] text-sm mb-4">Este curador no ha añadido una biografía.</p>
          )}
          <LabelCaps className="text-[#4d4635]">
            Curador desde{' '}
            {curator.createdAt.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </LabelCaps>
        </div>

        {isOwnProfile && (
          <Link href="/vault" className="btn-secondary flex-shrink-0">
            Ver mi Bóveda →
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#4d4635] mb-10">
        <div className="bg-[#131313] p-6">
          <LabelCaps className="text-[#99907c] block mb-2">Momentos</LabelCaps>
          <div className="font-serif text-3xl font-bold text-[#e5e2e1]">
            {curator.ownerships.length}
          </div>
        </div>
        <div className="bg-[#131313] p-6">
          <LabelCaps className="text-[#99907c] block mb-2">Valor colección</LabelCaps>
          <div className="font-serif text-3xl font-bold text-[#f2ca50]">
            {curator.ownerships.length > 0
              ? `${(totalValue / 100).toLocaleString('es-ES')} €`
              : '—'}
          </div>
        </div>
        <div className="bg-[#131313] p-6">
          <LabelCaps className="text-[#99907c] block mb-2">Alcance histórico</LabelCaps>
          <div className="font-serif text-3xl font-bold text-[#e5e2e1]">
            {yearSpan ? `${yearSpan.toLocaleString('es-ES')} años` : '—'}
          </div>
        </div>
        <div className="bg-[#131313] p-6">
          <LabelCaps className="text-[#99907c] block mb-2">Royalties</LabelCaps>
          <div className="font-serif text-3xl font-bold text-[#5fd97a]">
            {totalRoyalties > 0 ? `${(totalRoyalties / 100).toLocaleString('es-ES')} €` : '—'}
          </div>
        </div>
      </div>

      {/* Colecciones completas */}
      {completedEras.length > 0 && (
        <div className="mb-12">
          <div className="flex flex-wrap gap-3">
            {completedEras.map((era) => (
              <div key={era} className="flex items-center gap-2 border border-[#f2ca50]/40 bg-[rgba(242,202,80,0.06)] px-4 py-2">
                <span className="text-[#f2ca50]">★</span>
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#f2ca50]">
                  {ERA_LABELS[era] ?? era}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <GoldDivider className="mb-10" />

      <h2 className="font-serif text-3xl font-bold mb-8 text-[#e5e2e1]">Colección</h2>

      {curator.ownerships.length === 0 ? (
        <div className="border border-[#4d4635] p-16 text-center">
          <p className="text-[#4d4635] text-sm">La colección de este curador está vacía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curator.ownerships.map((ownership) => (
            <MomentCard
              key={ownership.id}
              moment={ownership.moment}
              variant="vault"
              ownership={{
                serialNumber: ownership.serialNumber,
                acquisitionPrice: ownership.acquisitionPrice,
                acquiredAt: ownership.acquiredAt,
              }}
            />
          ))}
        </div>
      )}
    </main>
  )
}
