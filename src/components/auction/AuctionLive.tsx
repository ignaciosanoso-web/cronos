'use client'

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher-client'
import { AuctionCountdown } from './AuctionCountdown'
import { BidForm } from './BidForm'

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
    const channel = pusherClient.subscribe(`auction-${auctionId}`)

    channel.bind('bid-placed', (data: BidPlacedPayload) => {
      setCurrentBidCents(data.amountCents)
      setClosesAt(data.closesAt)
      // Flash de aviso — alguien pujó
      setOutbidFlash(true)
      setTimeout(() => setOutbidFlash(false), 4000)
    })

    return () => {
      pusherClient.unsubscribe(`auction-${auctionId}`)
    }
  }, [auctionId])

  return (
    <div className="space-y-5">
      <AuctionCountdown closesAt={closesAt} triggerMin={triggerMin} extensionMin={extensionMin} />

      {outbidFlash && (
        <p className="text-sm text-center text-[#f2ca50] animate-pulse">Nueva puja registrada</p>
      )}

      <BidForm
        auctionId={auctionId}
        currentBidCents={currentBidCents}
        startPriceCents={startPriceCents}
      />
    </div>
  )
}
