import Link from 'next/link'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="font-serif text-[120px] font-bold leading-none text-[#1c1b1b] select-none mb-6">
          404
        </div>
        <LabelCaps className="text-[#f2ca50] border border-[#735c00] px-3 py-1 inline-block mb-6">
          Fragmento no encontrado
        </LabelCaps>
        <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-4">
          Este momento no existe en el archivo
        </h1>
        <p className="text-[#99907c] text-sm leading-relaxed mb-10">
          La página que buscas ha sido eliminada, movida o nunca existió en la línea de tiempo.
        </p>
        <GoldDivider className="mb-8" />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>
          <Link href="/explorer" className="btn-secondary">
            Explorar momentos
          </Link>
        </div>
      </div>
    </main>
  )
}
