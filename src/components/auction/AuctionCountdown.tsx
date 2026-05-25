'use client'

import { useState, useEffect } from 'react'
import { LabelCaps } from '@/components/ui/LabelCaps'

function fmtCountdown(ms: number): string {
  if (ms <= 0) return 'Finalizada'
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (d > 0) return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
  if (h > 0)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface AuctionCountdownProps {
  closesAt: string
  triggerMin: number
  extensionMin: number
  /** Modo compacto para tarjetas de la home */
  compact?: boolean
}

export function AuctionCountdown({
  closesAt,
  triggerMin,
  extensionMin,
  compact = false,
}: AuctionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(new Date(closesAt).getTime() - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(new Date(closesAt).getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [closesAt])

  const finished = timeLeft <= 0
  const inWindow = !finished && timeLeft <= triggerMin * 60 * 1000

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            finished ? 'bg-[#4d4635]' : inWindow ? 'bg-[#ff8a73] animate-pulse' : 'bg-[#5fd97a]'
          }`}
        />
        <LabelCaps className="text-[#99907c] text-[9px]">Cierre en</LabelCaps>
        <span
          className={`font-mono text-xs font-bold tabular-nums ${
            finished ? 'text-[#4d4635]' : inWindow ? 'text-[#ff8a73]' : 'text-[#e5e2e1]'
          }`}
        >
          {fmtCountdown(timeLeft)}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-4">
        <LabelCaps className="text-[#99907c]">Cierre en</LabelCaps>
        <span
          className={`font-serif text-2xl font-bold tabular-nums ${
            finished ? 'text-[#4d4635]' : inWindow ? 'text-[#ff8a73]' : 'text-[#f2ca50]'
          }`}
        >
          {fmtCountdown(timeLeft)}
        </span>
      </div>
      {inWindow && (
        <LabelCaps className="text-[#ff8a73] block">
          Ventana anti-sniping activa — cualquier puja añade +{extensionMin} min
        </LabelCaps>
      )}
    </div>
  )
}
