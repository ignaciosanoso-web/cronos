'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createListing, cancelListing } from '@/app/actions/market'

interface SellButtonProps {
  ownershipId: string
  activeListingId?: string
  askingPrice?: number
}

export function SellButton({ ownershipId, activeListingId, askingPrice }: SellButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Ya está en venta
  if (activeListingId) {
    const priceEur = askingPrice ? (askingPrice / 100).toLocaleString('es-ES') : '—'
    return (
      <div className="flex items-center gap-2 mt-3">
        <span className="label-caps text-[9px] border border-[#f2ca50]/30 text-[#f2ca50] px-2 py-1">
          En venta · {priceEur} €
        </span>
        <button
          onClick={() => {
            if (!confirm('¿Retirar del mercado?')) return
            startTransition(async () => {
              const result = await cancelListing(activeListingId)
              if ('error' in result) setError(result.error)
              else router.refresh()
            })
          }}
          disabled={isPending}
          className="label-caps text-[9px] text-[#4d4635] hover:text-[#ff8a73] transition-colors disabled:opacity-40"
        >
          {isPending ? '…' : '× Retirar'}
        </button>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Precio (€)"
            className="flex-1 bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-1.5 text-xs focus:outline-none focus:border-[#f2ca50]"
          />
          <button
            onClick={() => {
              const euros = parseFloat(price)
              if (isNaN(euros) || euros < 1) {
                setError('Precio inválido')
                return
              }
              setError(null)
              startTransition(async () => {
                const result = await createListing(ownershipId, euros)
                if ('error' in result) setError(result.error)
                else {
                  setShowForm(false)
                  router.refresh()
                }
              })
            }}
            disabled={isPending}
            className="btn-primary text-xs px-3 py-1.5 disabled:opacity-40"
          >
            {isPending ? '…' : 'Publicar'}
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
      className="mt-3 label-caps text-[9px] border border-[#4d4635] text-[#99907c] px-3 py-1.5 hover:border-[#f2ca50] hover:text-[#f2ca50] transition-colors w-full"
    >
      Poner a la venta
    </button>
  )
}
