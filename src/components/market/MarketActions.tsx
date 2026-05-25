'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  makeOffer,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  cancelListing,
} from '@/app/actions/market'
import { LabelCaps } from '@/components/ui/LabelCaps'

interface MarketActionsProps {
  listingId: string
  askingPriceCents: number
  isSeller: boolean
  isAuthenticated: boolean
  myPendingOfferId?: string
  myPendingOfferAmount?: number
  // Para modo oferta individual en la tabla de ofertas
  offerId?: string
  offerMode?: boolean
}

export function MarketActions({
  listingId,
  askingPriceCents,
  isSeller,
  isAuthenticated,
  myPendingOfferId,
  myPendingOfferAmount,
  offerId,
  offerMode = false,
}: MarketActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  function handleAction(fn: () => Promise<{ success: true } | { error: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if ('error' in result) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  // Modo tabla de ofertas: botones aceptar/rechazar
  if (offerMode && offerId) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAction(() => acceptOffer(offerId))}
          disabled={isPending}
          className="btn-primary text-xs px-3 py-1.5 disabled:opacity-40"
        >
          {isPending ? '…' : 'Aceptar'}
        </button>
        <button
          onClick={() => handleAction(() => rejectOffer(offerId))}
          disabled={isPending}
          className="label-caps text-[9px] border border-[#ff8a73]/40 text-[#ff8a73] px-2 py-1 hover:bg-[#ff8a73]/10 transition-colors disabled:opacity-40"
        >
          {isPending ? '…' : 'Rechazar'}
        </button>
      </div>
    )
  }

  // Vendedor: solo puede cancelar el listing
  if (isSeller) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-[#99907c]">
          Tu momento está en el mercado. Espera ofertas o cancela el listing.
        </p>
        <button
          onClick={() => {
            if (!confirm('¿Cancelar el listing? Volverá a tu Bóveda.')) return
            handleAction(() => cancelListing(listingId))
          }}
          disabled={isPending}
          className="label-caps text-[9px] border border-[#ff8a73]/40 text-[#ff8a73] px-3 py-1.5 hover:bg-[#ff8a73]/10 transition-colors disabled:opacity-40"
        >
          {isPending ? '…' : 'Cancelar listing'}
        </button>
        {error && <p className="text-xs text-[#ff8a73]">{error}</p>}
      </div>
    )
  }

  // No autenticado
  if (!isAuthenticated) {
    return (
      <div className="border border-[#4d4635] p-4">
        <p className="text-sm text-[#99907c] mb-3">Inicia sesión para hacer una oferta.</p>
        <a href="/login" className="btn-primary text-sm">
          Acceder
        </a>
      </div>
    )
  }

  // Comprador con oferta pendiente
  if (myPendingOfferId) {
    const offerEur = myPendingOfferAmount
      ? (myPendingOfferAmount / 100).toLocaleString('es-ES')
      : '—'
    return (
      <div className="space-y-3">
        <div className="border border-[#f2ca50]/30 bg-[#1c1b1b] p-4">
          <LabelCaps className="text-[#f2ca50] block mb-1">Tu oferta activa</LabelCaps>
          <span className="font-serif text-2xl font-bold text-[#f2ca50]">{offerEur} €</span>
          <p className="text-xs text-[#99907c] mt-1">Pendiente de respuesta del vendedor</p>
        </div>
        <button
          onClick={() => handleAction(() => withdrawOffer(myPendingOfferId))}
          disabled={isPending}
          className="label-caps text-[9px] border border-[#4d4635] text-[#99907c] px-3 py-1.5 hover:border-[#ff8a73] hover:text-[#ff8a73] transition-colors disabled:opacity-40"
        >
          {isPending ? '…' : 'Retirar oferta'}
        </button>
        {error && <p className="text-xs text-[#ff8a73]">{error}</p>}
      </div>
    )
  }

  // Comprador: formulario de oferta
  const minEur = Math.ceil((askingPriceCents * 0.5) / 100) // mín 50% del precio pedido

  if (showOfferForm) {
    return (
      <div className="space-y-4">
        <div>
          <label className="label-caps text-[#99907c] block mb-1 text-[10px]">
            Tu oferta (€) — mín. {minEur} €
          </label>
          <input
            type="number"
            min={minEur}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-2 text-sm focus:outline-none focus:border-[#f2ca50]"
            placeholder={`${minEur}`}
          />
        </div>
        <div>
          <label className="label-caps text-[#99907c] block mb-1 text-[10px]">
            Mensaje (opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-2 text-sm focus:outline-none focus:border-[#f2ca50] resize-none"
            placeholder="¿Por qué quieres este momento?"
          />
        </div>
        {error && <p className="text-xs text-[#ff8a73]">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => {
              const euros = parseFloat(amount)
              if (isNaN(euros) || euros < minEur) {
                setError(`La oferta mínima es ${minEur} €`)
                return
              }
              handleAction(() => makeOffer(listingId, euros, message))
            }}
            disabled={isPending}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            {isPending ? 'Enviando…' : 'Enviar oferta'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowOfferForm(false)
              setError(null)
            }}
            className="btn-secondary px-4"
          >
            Cancelar
          </button>
        </div>
        <p className="text-xs text-[#4d4635]">
          La oferta es válida 7 días. Sin pago inmediato — el vendedor debe aceptarla primero.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowOfferForm(true)} className="btn-primary w-full">
        Hacer una oferta
      </button>
      <p className="text-xs text-[#4d4635] text-center">
        Precio pedido: {(askingPriceCents / 100).toLocaleString('es-ES')} €
      </p>
    </div>
  )
}
