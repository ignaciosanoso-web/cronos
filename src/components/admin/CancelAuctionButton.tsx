'use client'

import { useTransition } from 'react'
import { cancelAuction } from '@/app/actions/admin/auction'

interface Props {
  auctionId: string
}

export function CancelAuctionButton({ auctionId }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('¿Cancelar esta subasta? No se puede deshacer.')) return
    startTransition(async () => {
      const result = await cancelAuction(auctionId)
      if ('error' in result) alert(result.error)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="label-caps text-[9px] border border-[#ff8a73]/40 text-[#ff8a73] px-2 py-1 hover:bg-[#ff8a73]/10 transition-colors disabled:opacity-40"
    >
      {isPending ? '…' : 'Cancelar'}
    </button>
  )
}
