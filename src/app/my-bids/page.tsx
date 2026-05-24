import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TierBadge } from '@/components/ui/TierBadge'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'

export const metadata = {
  title: 'Mis Pujas — Cronos',
  description: 'Seguimiento en tiempo real de tus pujas activas en Cronos.',
}

const BID_STATUS_LABEL: Record<string, { text: string; color: string }> = {
  ACTIVE: { text: 'Ganando', color: 'text-[#5fd97a]' },
  OUTBID: { text: 'Superado', color: 'text-[#ff8a73]' },
  WON: { text: 'Ganada', color: 'text-[#f2ca50]' },
  RELEASED: { text: 'Liberada', color: 'text-[#99907c]' },
  HOLD_FAILED: { text: 'Error', color: 'text-[#ff8a73]' },
}

async function getBidsData(userId: string) {
  const bids = await prisma.bid.findMany({
    where: { userId },
    include: {
      auction: {
        include: {
          moment: {
            select: {
              slug: true,
              title: true,
              year: true,
              era: true,
              tier: true,
            },
          },
          currentBid: { select: { amount: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const active = bids.filter((b) => b.status === 'ACTIVE').length
  const won = bids.filter((b) => b.status === 'WON').length
  const outbid = bids.filter((b) => b.status === 'OUTBID').length
  const committed = bids.filter((b) => b.status === 'ACTIVE').reduce((sum, b) => sum + b.amount, 0)

  return { bids, active, won, outbid, committed }
}

export default async function MyBidsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { bids, active, won, outbid, committed } = await getBidsData(session.user.id)
  const committedEur = (committed / 100).toLocaleString('es-ES')

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <LabelCaps className="text-[#f2ca50] block mb-3">Panel del Curador</LabelCaps>
        <h1 className="font-serif text-5xl font-bold mb-3 text-[#e5e2e1]">Mis Pujas</h1>
        <p className="text-[#d0c5af]">
          Historial de pujas y seguimiento de subastas en las que participas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#4d4635] mb-16">
        <div className="bg-[#131313] p-6">
          <LabelCaps className="text-[#99907c] block mb-3">Pujas Activas</LabelCaps>
          <div className="font-serif text-3xl font-bold text-[#f2ca50]">{active}</div>
        </div>
        <div className="bg-[#131313] p-6">
          <LabelCaps className="text-[#99907c] block mb-3">Ganadas</LabelCaps>
          <div className="font-serif text-3xl font-bold text-[#5fd97a]">{won}</div>
        </div>
        <div className="bg-[#131313] p-6">
          <LabelCaps className="text-[#99907c] block mb-3">Superado en</LabelCaps>
          <div className="font-serif text-3xl font-bold text-[#ff8a73]">{outbid}</div>
        </div>
        <div className="bg-[#131313] p-6">
          <LabelCaps className="text-[#99907c] block mb-3">Capital Comprometido</LabelCaps>
          <div className="font-serif text-3xl font-bold text-[#e5e2e1]">
            {active > 0 ? `${committedEur} €` : '—'}
          </div>
        </div>
      </div>

      <GoldDivider className="mb-10" />

      {bids.length > 0 ? (
        <div className="bg-[#1c1b1b] border border-[#4d4635]">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[80px_1fr_160px_160px_140px] gap-4 px-6 py-4 border-b border-[#4d4635]">
            {['Tier', 'Momento', 'Tu Puja', 'Puja Actual', 'Estado'].map((h) => (
              <LabelCaps key={h} className="text-[#4d4635]">
                {h}
              </LabelCaps>
            ))}
          </div>

          {bids.map((bid) => {
            const statusMeta = BID_STATUS_LABEL[bid.status] ?? BID_STATUS_LABEL.RELEASED
            const myBidEur = (bid.amount / 100).toLocaleString('es-ES')
            const currentEur = bid.auction.currentBid
              ? (bid.auction.currentBid.amount / 100).toLocaleString('es-ES')
              : myBidEur
            const yearLabel =
              bid.auction.moment.year < 0
                ? `${Math.abs(bid.auction.moment.year)} a.C.`
                : String(bid.auction.moment.year)

            return (
              <div
                key={bid.id}
                className="grid grid-cols-1 md:grid-cols-[80px_1fr_160px_160px_140px] gap-4 px-6 py-5 border-b border-[#4d4635] last:border-b-0 hover:bg-[#131313] transition-colors"
              >
                <div className="flex items-center">
                  <TierBadge tier={bid.auction.moment.tier} />
                </div>
                <div>
                  <Link
                    href={`/momento/${bid.auction.moment.slug}`}
                    className="font-serif font-bold text-[#e5e2e1] hover:text-[#f2ca50] transition-colors"
                  >
                    {bid.auction.moment.title}
                  </Link>
                  <LabelCaps className="text-[#4d4635] block mt-1">{yearLabel}</LabelCaps>
                </div>
                <div className="flex items-center">
                  <span className="font-serif text-[#e5e2e1]">{myBidEur} €</span>
                </div>
                <div className="flex items-center">
                  <span className="font-serif text-[#f2ca50]">{currentEur} €</span>
                </div>
                <div className="flex items-center">
                  <LabelCaps className={statusMeta.color}>{statusMeta.text}</LabelCaps>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="border border-[#4d4635] p-20 text-center">
          <p className="text-[#99907c] text-sm mb-6">Aún no has participado en ninguna subasta.</p>
          <p className="text-[#4d4635] text-xs mb-8">
            Cuando se abra una subasta podrás pujar desde la ficha del momento.
          </p>
          <Link href="/explorer" className="btn-secondary">
            Explorar Momentos
          </Link>
        </div>
      )}

      <p className="text-xs text-[#4d4635] text-center mt-8">
        Recibirás una notificación inmediata cuando seas superado en cualquier subasta.
      </p>
    </main>
  )
}
