import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MomentCard } from '@/components/moment/MomentCard'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'

export const metadata = {
  title: 'La Bóveda — Cronos',
  description: 'Tu colección privada de momentos históricos curados.',
}

async function getVaultData(userId: string) {
  const ownerships = await prisma.ownership.findMany({
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
    },
    orderBy: { acquiredAt: 'desc' },
  })

  const totalValue = ownerships.reduce((sum, o) => sum + o.acquisitionPrice, 0)
  const years = ownerships.map((o) => o.moment.year)
  const yearSpan = years.length >= 2 ? Math.abs(Math.max(...years) - Math.min(...years)) : null

  return { ownerships, totalValue, yearSpan }
}

export default async function VaultPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { ownerships, totalValue, yearSpan } = await getVaultData(session.user.id)
  const totalValueEur = (totalValue / 100).toLocaleString('es-ES')

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
        {session.user.email && (
          <LabelCaps className="text-[#4d4635]">{session.user.email}</LabelCaps>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#4d4635] mb-16">
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
      </div>

      <GoldDivider className="mb-10" />

      <h2 className="font-serif text-3xl font-bold mb-8 text-[#e5e2e1]">Artefactos Adquiridos</h2>

      {ownerships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerships.map((ownership) => (
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
    </main>
  )
}
