'use client'

import { useState, useTransition } from 'react'
import { votePetition } from '@/app/actions/petitions'

interface Props {
  petitionId: string
  initialVotes: number
  initialVoted: boolean
  isOwn: boolean
}

export function PetitionVoteButton({ petitionId, initialVotes, initialVoted, isOwn }: Props) {
  const [votes, setVotes] = useState(initialVotes)
  const [voted, setVoted] = useState(initialVoted)
  const [isPending, startTransition] = useTransition()

  function handleVote() {
    if (isOwn) return
    startTransition(async () => {
      const result = await votePetition(petitionId)
      if ('error' in result) return
      setVoted(result.voted)
      setVotes((v) => v + (result.voted ? 1 : -1))
    })
  }

  return (
    <button
      onClick={handleVote}
      disabled={isPending || isOwn}
      title={isOwn ? 'No puedes votar tu propia petición' : voted ? 'Retirar voto' : 'Apoyar'}
      className={`flex flex-col items-center gap-1 px-3 py-2 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        voted
          ? 'border-[#f2ca50] text-[#f2ca50]'
          : 'border-[#4d4635] text-[#99907c] hover:border-[#f2ca50] hover:text-[#f2ca50]'
      }`}
    >
      <svg
        width="14"
        height="14"
        fill={voted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M12 4l-8 8h5v8h6v-8h5z" />
      </svg>
      <span className="font-serif text-sm font-bold tabular-nums">{votes}</span>
    </button>
  )
}
