import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MomentCard } from '@/components/moment/MomentCard'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { SellButton } from '@/components/market/SellButton'

export const metadata = {
  title: 'La Bóveda — Cronos',
  description: 'Tu colección privada de momentos históricos curados.',
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

async function getVaultData(userId: string) {
  const [ownerships, royalties, allPublishedMoments] = await Promise.all([
    prisma.ownership.findMany({
      where: { userId },
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
        listings: {
          where: { status: 'ACTIVE' },
          select: { id: true, askingPrice: true },
          take: 1,
        },
      },
      orderBy: { acquiredAt: 'desc' },
    }),
    prisma.transaction.findMany({
      where: { kind: 'ROYALTY_PAYMENT', royaltyRecipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.moment.findMany({
      where: { status: { not: 'DRAFT' } },
      select: { id: true, era: true },
    }),
  ])

  const totalValue = ownerships.reduce((sum, o) => sum + o.acquisitionPrice, 0)
  const totalRoyalties = royalties.reduce((sum, r) => sum + r.royaltyAmount, 0)
  const years = ownerships.map((o) => o.moment.year)
  const yearSpan = years.length >= 2 ? Math.abs(Math.max(...years) - Math.min(...years)) : null

  // Colecciones completas por era
  const ownedMomentIds = new Set(ownerships.map((o) => o.momentId))
  const momentsByEra = allPublishedMoments.reduce<Record<string, string[]>>((acc, m) => {
    if (!acc[m.era]) acc[m.era] = []
    acc[m.era].push(m.id)
    return acc
  }, {})
  const completedEras = Object.entries(momentsByEra)
    .filter(([, ids]) => ids.length > 0 && ids.every((id) => ownedMomentIds.has(id)))
    .map(([era]) => era)

  return { ownerships, totalValue, yearSpan, royalties, totalRoyalties, completedEras }
}

export default async function VaultPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { ownerships, totalValue, yearSpan, royalties, totalRoyalties, completedEras } = await getVaultData(session.user.id)
  const totalValueEur = (totalValue / 100).toLocaleString('es-ES')
  const totalRoyaltiesEur = (totalRoyalties / 100).toLocaleString('es-ES')

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-6 mb-10">
        <div className="max-w-xl">
          <h1 className="font-serif text-5xl font-bold mb-3 text-[#e5e2e1]">La Bóveda</h1>
          <p className="text-[#d0c5af] leading-relaxed">
            Su colección privada de momentos históricos. Segura, autenticada y exclusivamente suya.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {session.user.email && (
            <LabelCaps className="text-[#4d4635]">{session.user.email}</LabelCaps>
          )}
          <Link
            href={`/curator/${session.user.id}`}
            className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#99907c] hover:text-[#f2ca50] transition-colors"
          >
            Ver perfil público →
          </Link>
          <Link
            href="/perfil"
            className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#4d4635] hover:text-[#f2ca50] transition-colors"
          >
            Editar perfil →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#4d4635] mb-16">
        <div className="bg-[#131313] p-8">
          <LabelCaps className="text-[#99907c] block mb-3">Valor del Portafolio</LabelCaps>
          <div className="font-serif text-4xl font-bold text-[#f2ca50]">
            {ownerships.length > 0 ? `${totalValueEur} €` : '—'}
          </div>
        </div>
        <div className="bg-[#131313] p-8">
          <LabelCaps className="text-[#99907c] block mb-3">Momentos en Propiedad</LabelCaps>
          <div className="font-serif text-4xl font-bold text-[#e5e2e1]">{ownerships.length}</div>
        </div>
        <div className="bg-[#131313] p-8">
          <LabelCaps className="text-[#99907c] block mb-3">Alcance Histórico</LabelCaps>
          <div className="font-serif text-4xl font-bold text-[#e5e2e1]">
            {yearSpan ? `${yearSpan.toLocaleString('es-ES')} años` : '—'}
          </div>
        </div>
        <div className="bg-[#131313] p-8">
          <LabelCaps className="text-[#99907c] block mb-3">Royalties Ganados</LabelCaps>
          <div className="font-serif text-4xl font-bold text-[#5fd97a]">
            {totalRoyalties > 0 ? `${totalRoyaltiesEur} €` : '—'}
          </div>
        </div>
      </div>

      <GoldDivider className="mb-10" />

      {/* Colecciones completas */}
      {completedEras.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4 text-[#e5e2e1]">Colecciones Completas</h2>
          <div className="flex flex-wrap gap-3">
            {completedEras.map((era) => (
              <div
                key={era}
                className="flex items-center gap-2 border border-[#f2ca50]/40 bg-[rgba(242,202,80,0.06)] px-4 py-2"
              >
                <span className="text-[#f2ca50] text-base">★</span>
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#f2ca50]">
                  {ERA_LABELS[era] ?? era}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#4d4635] mt-3">
            Posees al menos un ejemplar de cada momento publicado en estas eras.
          </p>
        </div>
      )}

      <h2 className="font-serif text-3xl font-bold mb-8 text-[#e5e2e1]">Artefactos Adquiridos</h2>

      {ownerships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerships.map((ownership) => {
            const activeListing = ownership.listings[0]
            return (
              <div key={ownership.id} className="flex flex-col">
                <MomentCard
                  moment={ownership.moment}
                  variant="vault"
                  ownership={{
                    serialNumber: ownership.serialNumber,
                    acquisitionPrice: ownership.acquisitionPrice,
                    acquiredAt: ownership.acquiredAt,
                  }}
                />
                <SellButton
                  ownershipId={ownership.id}
                  activeListingId={activeListing?.id}
                  askingPrice={activeListing?.askingPrice}
                />
                <Link
                  href={`/certificado/${ownership.id}`}
                  className="mt-2 block text-center text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4d4635] hover:text-[#f2ca50] transition-colors py-1"
                >
                  Ver certificado →
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="border border-[#4d4635] p-20 text-center">
          <p className="text-[#99907c] text-sm mb-6">Tu bóveda está vacía.</p>
          <p className="text-[#4d4635] text-xs mb-8">
            Participa en una subasta para adquirir tu primer momento histórico.
          </p>
          <Link href="/explorer" className="btn-secondary">
            Explorar Momentos
          </Link>
        </div>
      )}

      {/* Royalties */}
      {royalties.length > 0 && (
        <>
          <GoldDivider className="my-12" />
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold mb-2 text-[#e5e2e1]">Royalties Ganados</h2>
            <p className="text-sm text-[#99907c]">
              5% automático cada vez que un momento tuyo se revende en el mercado secundario.
            </p>
          </div>
          <div className="border border-[#4d4635] divide-y divide-[#4d4635]">
            {royalties.map((r) => {
              const salePriceEur = (r.grossAmount / 100).toLocaleString('es-ES')
              const royaltyEur = (r.royaltyAmount / 100).toLocaleString('es-ES')
              return (
                <div key={r.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm text-[#e5e2e1] mb-1">
                      Momento vendido por{' '}
                      <span className="text-[#f2ca50] font-semibold">{salePriceEur} €</span>
                    </p>
                    <LabelCaps className="text-[#4d4635]">
                      {r.createdAt.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </LabelCaps>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-2xl font-bold text-[#5fd97a]">
                      +{royaltyEur} €
                    </div>
                    <LabelCaps className="text-[#4d4635]">royalty 5%</LabelCaps>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
