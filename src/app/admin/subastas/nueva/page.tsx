import { prisma } from '@/lib/prisma'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { AuctionForm } from '@/components/admin/AuctionForm'
import Link from 'next/link'

export default async function NuevaSubastaPage() {
  // Todos los momentos publicados pueden tener nuevas subastas (cada serial number es una copia independiente)
  const moments = await prisma.moment.findMany({
    where: { status: { not: 'DRAFT' } },
    orderBy: { title: 'asc' },
    select: { id: true, title: true, tier: true, totalCirculation: true, status: true },
  })

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin/subastas"
          className="text-xs text-[#4d4635] hover:text-[#f2ca50] transition-colors"
        >
          ← Subastas
        </Link>
      </div>
      <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-1">Nueva Subasta</h1>
      <p className="text-sm text-[#4d4635] mb-6">Programa una subasta para un momento</p>
      <GoldDivider className="mb-8" />
      <AuctionForm moments={moments} />
    </div>
  )
}
