'use client'

import { useEffect, useState } from 'react'
import { getPusherClient } from '@/lib/pusher-client'
import { AuctionCountdown } from './AuctionCountdown'
import { BidForm } from './BidForm'
import { LabelCaps } from '@/components/ui/LabelCaps'

interface AuctionLiveProps {
  auctionId: string
  initialBidCents: number | null
  startPriceCents: number
  initialClosesAt: string
  triggerMin: number
  extensionMin: number
}

interface BidPlacedPayload {
  amountCents: number
  closesAt: string
  extended: boolean
}

export function AuctionLive({
  auctionId,
  initialBidCents,
  startPriceCents,
  initialClosesAt,
  triggerMin,
  extensionMin,
}: AuctionLiveProps) {
  const [currentBidCents, setCurrentBidCents] = useState(initialBidCents)
  const [closesAt, setClosesAt] = useState(initialClosesAt)
  const [outbidFlash, setOutbidFlash] = useState(false)

  useEffect(() => {
    const client = getPusherClient()
    const channel = client.subscribe(`auction-${auctionId}`)

    channel.bind('bid-placed', (data: BidPlacedPayload) => {
      setCurrentBidCents(data.amountCents)
      setClosesAt(data.closesAt)
      setOutbidFlash(true)
      setTimeout(() => setOutbidFlash(false), 4000)
    })

    return () => {
      client.unsubscribe(`auction-${auctionId}`)
    }
  }, [auctionId])

  // Precio a mostrar: puja actual o precio base si aún no hay pujas
  const displayCents = currentBidCents ?? startPriceCents
  const displayEur = (displayCents / 100).toLocaleString('es-ES')
  const hasActiveBid = currentBidCents !== null

  return (
    <div className="space-y-5">
      {/* Precio en tiempo real */}
      <div className="flex items-baseline gap-3">
        <div>
          <LabelCaps className="text-[#99907c] block mb-1">
            {hasActiveBid ? 'Puja actual' : 'Precio base'}
          </LabelCaps>
          <span className="font-serif text-3xl font-bold text-[#f2ca50] transition-all">
            {displayEur} €
          </span>
        </div>
        {outbidFlash && <span className="text-sm text-[#f2ca50] animate-pulse">↑ Nueva puja</span>}
      </div>

      <AuctionCountdown closesAt={closesAt} triggerMin={triggerMin} extensionMin={extensionMin} />

      <BidForm
        auctionId={auctionId}
        currentBidCents={currentBidCents}
        startPriceCents={startPriceCents}
      />
    </div>
  )
}
