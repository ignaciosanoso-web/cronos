'use client'

import { useState, useTransition } from 'react'
import { placeBid } from '@/app/actions/bid'
import { LabelCaps } from '@/components/ui/LabelCaps'

interface BidFormProps {
  auctionId: string
  currentBidCents: number | null
  startPriceCents: number
}

export function BidForm({ auctionId, currentBidCents, startPriceCents }: BidFormProps) {
  const baseCents = currentBidCents ?? startPriceCents
  const minEur = Math.ceil((baseCents * 1.05) / 100)

  const [amount, setAmount] = useState(minEur)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const isValid = amount >= minEur

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setFeedback(null)
    startTransition(async () => {
      const result = await placeBid(auctionId, Math.round(amount * 100))
      if ('error' in result) {
        setFeedback({ ok: false, text: result.error })
      } else {
        setFeedback({
          ok: true,
          text: result.extended
            ? `Puja registrada. Subasta extendida +${result.extensionMin} min.`
            : 'Puja registrada correctamente.',
        })
        setAmount(Math.ceil(amount * 1.05))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <LabelCaps className="text-[#99907c] block mb-2">Tu puja (€)</LabelCaps>
        <div className="flex items-end gap-0">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={minEur}
            step={1}
            disabled={isPending}
            className="input-museum flex-1 text-xl font-serif pr-2"
          />
          <span className="pb-2.5 pl-2 text-[#99907c] font-serif text-xl">€</span>
        </div>
        <p className="text-xs text-[#4d4635] mt-1">
          Mínimo {minEur.toLocaleString('es-ES')} € · +5% sobre la puja actual
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending || !isValid}
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? 'Registrando…' : 'Confirmar Puja'}
      </button>

      {feedback && (
        <p className={`text-sm text-center ${feedback.ok ? 'text-[#5fd97a]' : 'text-[#ff8a73]'}`}>
          {feedback.text}
        </p>
      )}
    </form>
  )
}
