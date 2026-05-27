import { prisma } from '@/lib/prisma'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { TierBadge } from '@/components/ui/TierBadge'
import { TestEmailsButton } from '@/components/admin/TestEmailsButton'
import Link from 'next/link'
import type { Tier } from '@prisma/client'

async function getStats() {
  const [moments, activeAuctions, closedWon, transactions, users, listings, ownerships] =
    await Promise.all([
      prisma.moment.count(),
      prisma.auction.count({ where: { status: { in: ['OPEN', 'EXTENDING'] } } }),
      prisma.auction.count({ where: { status: 'CLOSED_WON' } }),
      prisma.transaction.aggregate({ _sum: { grossAmount: true, cronosFee: true } }),
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.ownership.count(),
    ])

  return {
    moments,
    activeAuctions,
    closedWon,
    totalVolume: transactions._sum.grossAmount ?? 0,
    totalFees: transactions._sum.cronosFee ?? 0,
    users,
    listings,
    ownerships,
  }
}

async function getRecentAuctions() {
  return prisma.auction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: {
      moment: { select: { title: true, slug: true, tier: true } },
      currentBid: { select: { amount: true } },
      _count: { select: { bids: true } },
    },
  })
}

async function getTopMoments() {
  return prisma.moment.findMany({
    where: { status: 'IN_VAULT' },
    orderBy: { basePrice: 'desc' },
    take: 5,
    select: { title: true, tier: true, totalCirculation: true, basePrice: true, slug: true },
  })
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Programada',
  OPEN: 'Abierta',
  EXTENDING: 'Extendida',
  CLOSED_WON: 'Ganada',
  CLOSED_NO_BIDS: 'Sin pujas',
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
  const [stats, recentAuctions, topMoments] = await Promise.all([
    getStats(),
    getRecentAuctions(),
    getTopMoments(),
  ])

  const conversionRate =
    stats.closedWon + stats.activeAuctions > 0
      ? Math.round((stats.closedWon / (stats.closedWon + stats.activeAuctions + 1)) * 100)
      : 0

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-1">Dashboard</h1>
        <p className="text-sm text-[#4d4635]">
          Vista general del sistema ·{' '}
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <GoldDivider className="mb-8" />

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#4d4635] mb-4">
        {[
          {
            label: 'Volumen total',
            value: `${(stats.totalVolume / 100).toLocaleString('es-ES')} €`,
            sub: 'transacciones brutas',
            color: 'text-[#f2ca50]',
          },
          {
            label: 'Comisiones Cronos',
            value: `${(stats.totalFees / 100).toLocaleString('es-ES')} €`,
            sub: 'ingresos netos',
            color: 'text-[#5fd97a]',
          },
          {
            label: 'Momentos vendidos',
            value: stats.ownerships,
            sub: 'certificados activos',
            color: 'text-[#e5e2e1]',
          },
          {
            label: 'Tasa de cierre',
            value: `${conversionRate}%`,
            sub: 'subastas con ganador',
            color: 'text-[#a78bfa]',
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-[#131313] p-6">
            <LabelCaps className="text-[#99907c] block mb-3">{label}</LabelCaps>
            <div className={`font-serif text-3xl font-bold ${color}`}>{value}</div>
            <p className="text-xs text-[#4d4635] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* KPIs secundarios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#4d4635] mb-10">
        {[
          { label: 'Momentos', value: stats.moments },
          { label: 'Subastas activas', value: stats.activeAuctions },
          { label: 'Listings mercado', value: stats.listings },
          { label: 'Usuarios registrados', value: stats.users },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#1c1b1b] p-4">
            <LabelCaps className="text-[#4d4635] block mb-1">{label}</LabelCaps>
            <span className="font-serif text-xl font-bold text-[#e5e2e1]">{value}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link href="/admin/momentos/nuevo" className="btn-primary text-sm px-4 py-2">
          + Nuevo Momento
        </Link>
        <Link href="/admin/subastas/nueva" className="btn-secondary text-sm px-4 py-2">
          + Nueva Subasta
        </Link>
        <Link href="/admin/momentos" className="btn-secondary text-sm px-4 py-2">
          Ver Momentos
        </Link>
        <Link href="/admin/subastas" className="btn-secondary text-sm px-4 py-2">
          Ver Subastas
        </Link>
        <Link href="/admin/usuarios" className="btn-secondary text-sm px-4 py-2">
          Ver Usuarios
        </Link>
        <TestEmailsButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Subastas recientes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-[#e5e2e1]">Subastas recientes</h2>
            <Link
              href="/admin/subastas"
              className="label-caps text-[10px] text-[#f2ca50] hover:text-[#ffe088] transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          <div className="border border-[#4d4635] divide-y divide-[#4d4635]">
            {recentAuctions.length === 0 && (
              <p className="p-4 text-sm text-[#4d4635]">No hay subastas aún.</p>
            )}
            {recentAuctions.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e5e2e1] truncate">{a.moment.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#4d4635]">#{a.serialNumber}</span>
                    <span className="text-xs text-[#4d4635]">·</span>
                    <span className="text-xs text-[#4d4635]">{a._count.bids} pujas</span>
                  </div>
                </div>
                <span className={`label-caps text-[9px] ${STATUS_COLOR[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
                <span className="text-sm text-[#f2ca50] font-serif tabular-nums text-right min-w-[70px]">
                  {a.currentBid
                    ? `${(a.currentBid.amount / 100).toLocaleString('es-ES')} €`
                    : `${(a.startPrice / 100).toLocaleString('es-ES')} €`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top momentos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-[#e5e2e1]">Top momentos en bóveda</h2>
            <Link
              href="/admin/momentos"
              className="label-caps text-[10px] text-[#f2ca50] hover:text-[#ffe088] transition-colors"
            >
              Ver todos →
            </Link>
          </div>
          <div className="border border-[#4d4635] divide-y divide-[#4d4635]">
            {topMoments.map((m, i) => (
              <div key={m.slug} className="flex items-center gap-3 px-4 py-3">
                <span className="font-serif text-lg text-[#4d4635] w-5 flex-shrink-0">{i + 1}</span>
                <TierBadge tier={m.tier as Tier} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e5e2e1] truncate">{m.title}</p>
                  <p className="text-xs text-[#4d4635]">{m.totalCirculation} ejemplares</p>
                </div>
                <span className="text-sm text-[#f2ca50] font-serif tabular-nums">
                  {(m.basePrice / 100).toLocaleString('es-ES')} €
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
