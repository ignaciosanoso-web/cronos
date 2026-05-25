import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MomentForm } from '@/components/admin/MomentForm'
import { GoldDivider } from '@/components/ui/GoldDivider'
import Link from 'next/link'

export default async function EditarMomentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const moment = await prisma.moment.findUnique({ where: { id } })
  if (!moment) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin/momentos"
          className="text-xs text-[#4d4635] hover:text-[#f2ca50] transition-colors"
        >
          ← Momentos
        </Link>
      </div>
      <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-1">Editar Momento</h1>
      <p className="text-sm text-[#4d4635] mb-1 font-mono">{moment.slug}</p>
      <GoldDivider className="mb-8 mt-4" />
      <MomentForm
        momentId={moment.id}
        initial={{
          title: moment.title,
          year: moment.year,
          date: moment.date,
          era: moment.era,
          category: moment.category,
          tier: moment.tier,
          confidence: moment.confidence,
          description: moment.description,
          procedence: moment.procedence,
          imageUrl: moment.imageUrl,
          location: moment.location ?? '',
          totalCirculation: moment.totalCirculation,
          basePrice: moment.basePrice / 100, // céntimos → euros
          sourcesRaw: moment.sources.join('\n'),
          status: moment.status,
        }}
      />
    </div>
  )
}
