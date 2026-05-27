'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="font-serif text-[120px] font-bold leading-none text-[#1c1b1b] select-none mb-6">
          500
        </div>
        <LabelCaps className="text-[#ff8a73] border border-[#ff8a73]/30 px-3 py-1 inline-block mb-6">
          Error del sistema
        </LabelCaps>
        <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-4">
          Algo ha salido mal
        </h1>
        <p className="text-[#99907c] text-sm leading-relaxed mb-10">
          Se ha producido un error inesperado. El equipo de Cronos ha sido notificado.
        </p>
        <GoldDivider className="mb-8" />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Reintentar
          </button>
          <Link href="/" className="btn-secondary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
