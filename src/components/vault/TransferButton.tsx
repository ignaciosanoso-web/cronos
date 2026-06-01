'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { transferOwnership } from '@/app/actions/ownership'

interface TransferButtonProps {
  ownershipId: string
  momentTitle: string
}

export function TransferButton({ ownershipId, momentTitle }: TransferButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <p className="mt-2 text-center text-[10px] font-semibold tracking-[0.15em] uppercase text-[#5fd97a] py-1">
        ✓ Transferido
      </p>
    )
  }

  if (showForm) {
    return (
      <div className="mt-2 space-y-2">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email del curador"
            aria-label={`Email del curador destino para transferir ${momentTitle}`}
            className="flex-1 bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-1.5 text-xs focus:outline-none focus:border-[#f2ca50]"
          />
          <button
            onClick={() => {
              if (!email.trim()) {
                setError('Introduce un email.')
                return
              }
              if (
                !confirm(
                  `¿Transferir "${momentTitle}" a ${email.trim()}? Esta acción es irreversible y perderás la propiedad del ejemplar.`
                )
              )
                return
              setError(null)
              startTransition(async () => {
                const result = await transferOwnership(ownershipId, email.trim())
                if ('error' in result) setError(result.error)
                else {
                  setDone(true)
                  router.refresh()
                }
              })
            }}
            disabled={isPending}
            className="btn-primary text-xs px-3 py-1.5 disabled:opacity-40"
          >
            {isPending ? '…' : 'Enviar'}
          </button>
          <button
            onClick={() => {
              setShowForm(false)
              setError(null)
            }}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            ×
          </button>
        </div>
        {error && <p className="text-xs text-[#ff8a73]">{error}</p>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="mt-2 block w-full text-center text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4d4635] hover:text-[#f2ca50] transition-colors py-1"
    >
      Transferir / Regalar →
    </button>
  )
}
