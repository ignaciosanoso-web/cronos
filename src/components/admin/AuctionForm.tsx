'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAuction } from '@/app/actions/admin/auction'
import type { Tier, MomentStatus } from '@prisma/client'

interface MomentOption {
  id: string
  title: string
  tier: Tier
  totalCirculation: number
  status: MomentStatus
}

interface AuctionFormProps {
  moments: MomentOption[]
}

// Duración por defecto según tier (en días/horas)
const TIER_DURATION: Record<Tier, number> = {
  MITICO: 7 * 24 * 60, // 7 días en minutos
  EXCEPCIONAL: 3 * 24 * 60,
  RARO: 2 * 24 * 60,
  COMUN: 1 * 24 * 60,
}

function addMinutes(date: Date, minutes: number): string {
  return new Date(date.getTime() + minutes * 60_000).toISOString().slice(0, 16)
}

export function AuctionForm({ moments }: AuctionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const now = new Date()
  const defaultOpens = addMinutes(now, 5) // 5 min desde ahora
  const [momentId, setMomentId] = useState(moments[0]?.id ?? '')
  const [serialNumber, setSerialNumber] = useState(1)
  const [startPrice, setStartPrice] = useState(100)
  const [opensAt, setOpensAt] = useState(defaultOpens)
  const [closesAt, setClosesAt] = useState(() => {
    const selected = moments[0]
    const duration = selected ? TIER_DURATION[selected.tier] : TIER_DURATION.COMUN
    return addMinutes(new Date(defaultOpens), duration)
  })

  const selectedMoment = moments.find((m) => m.id === momentId)

  function handleMomentChange(id: string) {
    setMomentId(id)
    const m = moments.find((mm) => mm.id === id)
    if (m) {
      const duration = TIER_DURATION[m.tier]
      setClosesAt(addMinutes(new Date(opensAt), duration))
    }
  }

  function handleOpensChange(val: string) {
    setOpensAt(val)
    if (selectedMoment) {
      const duration = TIER_DURATION[selectedMoment.tier]
      setClosesAt(addMinutes(new Date(val), duration))
    }
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await createAuction({
        momentId,
        serialNumber,
        startPrice,
        opensAt: new Date(opensAt).toISOString(),
        closesAt: new Date(closesAt).toISOString(),
      })
      if ('error' in result) {
        setError(result.error)
      } else {
        router.push('/admin/subastas')
        router.refresh()
      }
    })
  }

  const inputCls =
    'w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-2 text-sm focus:outline-none focus:border-[#f2ca50]'
  const labelCls = 'label-caps text-[#99907c] block mb-1'

  return (
    <div className="space-y-6">
      {/* Momento */}
      <div>
        <label className={labelCls}>Momento</label>
        <select
          className={inputCls}
          value={momentId}
          onChange={(e) => handleMomentChange(e.target.value)}
        >
          {moments.length === 0 && <option value="">No hay momentos disponibles</option>}
          {moments.map((m) => (
            <option key={m.id} value={m.id}>
              [{m.tier}] {m.title} — {m.totalCirculation} ejemplares
            </option>
          ))}
        </select>
        {selectedMoment && (
          <p className="text-xs text-[#4d4635] mt-1">
            Estado actual: {selectedMoment.status} · Circulación: {selectedMoment.totalCirculation}
          </p>
        )}
      </div>

      {/* Número de ejemplar y Precio */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nº ejemplar (serial)</label>
          <input
            className={inputCls}
            type="number"
            min={1}
            max={selectedMoment?.totalCirculation ?? 999}
            value={serialNumber}
            onChange={(e) => setSerialNumber(Number(e.target.value))}
          />
          {selectedMoment && (
            <p className="text-xs text-[#4d4635] mt-1">Máx: {selectedMoment.totalCirculation}</p>
          )}
        </div>
        <div>
          <label className={labelCls}>Precio inicial (€)</label>
          <input
            className={inputCls}
            type="number"
            min={1}
            step={0.01}
            value={startPrice}
            onChange={(e) => setStartPrice(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Apertura</label>
          <input
            className={inputCls}
            type="datetime-local"
            value={opensAt}
            onChange={(e) => handleOpensChange(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Cierre base</label>
          <input
            className={inputCls}
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
          />
        </div>
      </div>

      {selectedMoment && (
        <div className="border border-[#4d4635] bg-[#1c1b1b] p-4 text-xs text-[#a8a39e] space-y-1">
          <p>
            <span className="text-[#f2ca50]">Tier {selectedMoment.tier}</span> —duración por defecto
            aplicada automáticamente al cambiar apertura.
          </p>
          <p>
            El estado del momento pasará a <span className="text-[#f2ca50]">IN_AUCTION</span> al
            crear la subasta.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-[#ff8a73]">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !momentId}
          className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creando…' : 'Crear Subasta'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/subastas')}
          disabled={isPending}
          className="btn-secondary px-4"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
