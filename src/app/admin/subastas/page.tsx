import { prisma } from '@/lib/prisma'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Programada',
  OPEN: 'Abierta',
  EXTENDING: 'Extendida',
  CLOSED_WON: 'Ganada',
  CLOSED_NO_BIDS: 'Sin pujas',
  CANCELLED: 'Cancelada',
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: 'text-[#99907c] border-[#4d4635]',
  OPEN: 'text-[#5fd97a] border-[#5fd97a]',
  EXTENDING: 'text-[#f2ca50] border-[#f2ca50]',
  CLOSED_WON: 'text-[#a78bfa] border-[#a78bfa]',
  CLOSED_NO_BIDS: 'text-[#4d4635] border-[#4d4635]',
  CANCELLED: 'text-[#ff8a73] border-[#ff8a73]',
}

export default async function AdminSubastas() {
  const auctions = await prisma.auction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      moment: { select: { title: true, slug: true, tier: true } },
      currentBid: { select: { amount: true } },
      _count: { select: { bids: true } },
    },
  })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-1">Subastas</h1>
          <p className="text-sm text-[#4d4635]">{auctions.length} subastas</p>
        </div>
        <Link href="/admin/subastas/nueva" className="btn-primary text-sm px-4 py-2">
          + Nueva Subasta
        </Link>
      </div>

      <GoldDivider className="mb-6" />

      <div className="border border-[#4d4635]">
        <div className="grid grid-cols-[1fr_80px_90px_110px_80px_90px] gap-2 px-4 py-2 bg-[#1c1b1b] border-b border-[#4d4635]">
          {['Momento', '#', 'Estado', 'Cierre', 'Pujas', 'Puja actual'].map((h) => (
            <LabelCaps key={h} className="text-[#4d4635] text-[9px]">
              {h}
            </LabelCaps>
          ))}
        </div>
        <div className="divide-y divide-[#4d4635]">
          {auctions.length === 0 && (
            <p className="p-4 text-sm text-[#4d4635]">No hay subastas todavía.</p>
          )}
          {auctions.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-[1fr_80px_90px_110px_80px_90px] gap-2 px-4 py-3 items-center hover:bg-[#1c1b1b]"
            >
              <div className="min-w-0">
                <p className="text-sm text-[#e5e2e1] truncate">{a.moment.title}</p>
              </div>
              <span className="text-xs text-[#99907c] font-mono">#{a.serialNumber}</span>
              <span
                className={`label-caps text-[9px] border px-1.5 py-0.5 w-fit ${STATUS_COLOR[a.status]}`}
              >
                {STATUS_LABEL[a.status]}
              </span>
              <span className="text-xs text-[#99907c] tabular-nums">
                {a.closesAt.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                })}
              </span>
              <span className="text-xs text-[#99907c] tabular-nums text-center">
                {a._count.bids}
              </span>
              <span className="text-sm text-[#f2ca50] font-serif tabular-nums text-right">
                {a.currentBid ? `${(a.currentBid.amount / 100).toLocaleString('es-ES')} €` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
