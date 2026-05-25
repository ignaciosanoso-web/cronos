import { prisma } from '@/lib/prisma'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import Link from 'next/link'

async function getStats() {
  const [moments, auctions, transactions, users] = await Promise.all([
    prisma.moment.count(),
    prisma.auction.count({ where: { status: { in: ['OPEN', 'EXTENDING'] } } }),
    prisma.transaction.aggregate({ _sum: { grossAmount: true } }),
    prisma.user.count(),
  ])
  return {
    moments,
    activeAuctions: auctions,
    totalRevenue: transactions._sum.grossAmount ?? 0,
    users,
  }
}

async function getRecentAuctions() {
  return prisma.auction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: {
      moment: { select: { title: true, slug: true, tier: true } },
      currentBid: { select: { amount: true } },
    },
  })
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Programada',
  OPEN: 'Abierta',
  EXTENDING: 'Extendida',
  CLOSED_WON: 'Cerrada — Ganada',
  CLOSED_NO_BIDS: 'Cerrada — Sin pujas',
  CANCELLED: 'Cancelada',
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: 'text-[#99907c]',
  OPEN: 'text-[#5fd97a]',
  EXTENDING: 'text-[#f2ca50]',
  CLOSED_WON: 'text-[#a78bfa]',
  CLOSED_NO_BIDS: 'text-[#4d4635]',
  CANCELLED: 'text-[#ff8a73]',
}

export default async function AdminDashboard() {
  const [stats, recentAuctions] = await Promise.all([getStats(), getRecentAuctions()])

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-1">Dashboard</h1>
        <p className="text-sm text-[#4d4635]">Vista general del sistema</p>
      </div>

      <GoldDivider className="mb-8" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Momentos', value: stats.moments },
          { label: 'Subastas activas', value: stats.activeAuctions },
          {
            label: 'Volumen total',
            value: `${(stats.totalRevenue / 100).toLocaleString('es-ES')} €`,
          },
          { label: 'Usuarios', value: stats.users },
        ].map(({ label, value }) => (
          <div key={label} className="border border-[#4d4635] bg-[#1c1b1b] p-5">
            <LabelCaps className="text-[#99907c] block mb-2">{label}</LabelCaps>
            <span className="font-serif text-2xl font-bold text-[#f2ca50]">{value}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-10">
        <Link href="/admin/momentos/nuevo" className="btn-primary text-sm px-4 py-2">
          + Nuevo Momento
        </Link>
        <Link href="/admin/subastas/nueva" className="btn-secondary text-sm px-4 py-2">
          + Nueva Subasta
        </Link>
      </div>

      {/* Recent auctions */}
      <div>
        <h2 className="font-serif text-xl font-bold text-[#e5e2e1] mb-4">Subastas recientes</h2>
        <div className="border border-[#4d4635] divide-y divide-[#4d4635]">
          {recentAuctions.length === 0 && (
            <p className="p-4 text-sm text-[#4d4635]">No hay subastas aún.</p>
          )}
          {recentAuctions.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e5e2e1] truncate">{a.moment.title}</p>
                <p className="text-xs text-[#4d4635]">#{a.serialNumber}</p>
              </div>
              <span className={`label-caps text-[10px] ${STATUS_COLOR[a.status]}`}>
                {STATUS_LABEL[a.status]}
              </span>
              <span className="text-sm text-[#f2ca50] font-serif tabular-nums w-24 text-right">
                {a.currentBid
                  ? `${(a.currentBid.amount / 100).toLocaleString('es-ES')} €`
                  : `${(a.startPrice / 100).toLocaleString('es-ES')} € base`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
