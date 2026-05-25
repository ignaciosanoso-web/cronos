'use client'

import { useState, useTransition, useEffect } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe-client'
import { placeBid } from '@/app/actions/bid'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { GoldDivider } from '@/components/ui/GoldDivider'

// Componente interno — tiene acceso al contexto de Stripe
function StripePaymentStep({
  auctionId,
  amountCents,
  onSuccess,
  onCancel,
}: {
  auctionId: string
  amountCents: number
  onSuccess: (extended: boolean, extensionMin: number) => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!stripe || !elements) return
    setError(null)
    startTransition(async () => {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message ?? 'Error en el pago.')
        return
      }

      if (paymentIntent?.status === 'requires_capture') {
        const result = await placeBid(auctionId, amountCents, paymentIntent.id)
        if ('error' in result) {
          setError(result.error)
        } else {
          onSuccess(result.extended, result.extensionMin)
        }
      } else {
        setError('El pago no fue autorizado. Inténtalo de nuevo.')
      }
    })
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-[#ff8a73]">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="btn-secondary flex-1"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending || !stripe || !elements}
          className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Autorizando…' : 'Confirmar Puja'}
        </button>
      </div>
    </div>
  )
}

interface BidFormProps {
  auctionId: string
  currentBidCents: number | null
  startPriceCents: number
}

export function BidForm({ auctionId, currentBidCents, startPriceCents }: BidFormProps) {
  const baseCents = currentBidCents ?? startPriceCents
  const minEur = Math.ceil((baseCents * 1.05) / 100)

  const [amount, setAmount] = useState(minEur)
  const [step, setStep] = useState<'idle' | 'loading' | 'payment'>('idle')

  // Cuando alguien puja (Pusher actualiza currentBidCents), resetear el input
  // al nuevo mínimo para evitar enviar un importe ya inválido.
  useEffect(() => {
    if (step === 'idle') {
      setAmount(minEur)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minEur])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  const isValid = amount >= minEur

  async function handleProceed() {
    if (!isValid) return
    setStep('loading')
    setFeedback(null)
    try {
      const res = await fetch(`/api/auctions/${auctionId}/payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents: Math.round(amount * 100) }),
      })
      const data = await res.json()
      if (data.error) {
        setFeedback({ ok: false, text: data.error })
        setStep('idle')
        return
      }
      setClientSecret(data.clientSecret)
      setStep('payment')
    } catch {
      setFeedback({ ok: false, text: 'Error de conexión.' })
      setStep('idle')
    }
  }

  function handleSuccess(extended: boolean, extensionMin: number) {
    setFeedback({
      ok: true,
      text: extended
        ? `Puja autorizada. Subasta extendida +${extensionMin} min.`
        : 'Puja autorizada correctamente.',
    })
    setStep('idle')
    setClientSecret(null)
    setAmount(Math.ceil(amount * 1.05))
  }

  return (
    <div className="space-y-4">
      <div>
        <LabelCaps className="text-[#99907c] block mb-2">Tu puja (€)</LabelCaps>
        <div className="flex items-end gap-0">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={minEur}
            step={1}
            disabled={step !== 'idle'}
            className="input-museum flex-1 text-xl font-serif pr-2"
          />
          <span className="pb-2.5 pl-2 text-[#99907c] font-serif text-xl">€</span>
        </div>
        <p className="text-xs text-[#4d4635] mt-1">
          Mínimo {minEur.toLocaleString('es-ES')} € · +5% sobre la puja actual
        </p>
      </div>

      {step === 'idle' && (
        <button
          type="button"
          onClick={handleProceed}
          disabled={!isValid}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Proceder al Pago
        </button>
      )}

      {step === 'loading' && (
        <button disabled className="btn-primary w-full opacity-40 cursor-not-allowed">
          Preparando…
        </button>
      )}

      {step === 'payment' && clientSecret && (
        <div className="space-y-4">
          <GoldDivider />
          <div>
            <LabelCaps className="text-[#99907c] block mb-1">
              Autorización de {amount.toLocaleString('es-ES')} €
            </LabelCaps>
            <p className="text-xs text-[#a8a39e]">
              Solo se retiene el importe. No se carga hasta que ganes. Si eres superado, el hold se
              libera automáticamente.
            </p>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorBackground: '#1c1b1b',
                  colorText: '#e5e2e1',
                  colorTextPlaceholder: '#4d4635',
                  colorPrimary: '#f2ca50',
                  borderRadius: '0px',
                  fontFamily: 'Inter, sans-serif',
                },
              },
            }}
          >
            <StripePaymentStep
              auctionId={auctionId}
              amountCents={Math.round(amount * 100)}
              onSuccess={handleSuccess}
              onCancel={() => {
                setStep('idle')
                setClientSecret(null)
              }}
            />
          </Elements>
        </div>
      )}

      {feedback && (
        <p className={`text-sm text-center ${feedback.ok ? 'text-[#5fd97a]' : 'text-[#ff8a73]'}`}>
          {feedback.text}
        </p>
      )}
    </div>
  )
}
