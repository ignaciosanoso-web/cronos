import { MomentForm } from '@/components/admin/MomentForm'
import { GoldDivider } from '@/components/ui/GoldDivider'
import Link from 'next/link'

export default function NuevoMomentoPage() {
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
      <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-1">Nuevo Momento</h1>
      <p className="text-sm text-[#4d4635] mb-6">Crea un nuevo momento histórico en la bóveda</p>
      <GoldDivider className="mb-8" />
      <MomentForm />
    </div>
  )
}
