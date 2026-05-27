'use client'

import { useState, useTransition } from 'react'
import { toggleOwnershipPublic } from '@/app/actions/ownership'

interface TogglePublicButtonProps {
  ownershipId: string
  initialIsPublic: boolean
}

export function TogglePublicButton({ ownershipId, initialIsPublic }: TogglePublicButtonProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const next = !isPublic
      setIsPublic(next) // optimistic
      const result = await toggleOwnershipPublic(ownershipId, next)
      if (result.error) setIsPublic(!next) // revert on error
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`mt-1 block w-full text-center text-[10px] font-semibold tracking-[0.15em] uppercase py-1 transition-colors disabled:opacity-50 ${
        isPublic
          ? 'text-[#5fd97a] hover:text-[#99907c]'
          : 'text-[#4d4635] hover:text-[#99907c]'
      }`}
      title={isPublic ? 'Visible en tu perfil público. Clic para ocultar.' : 'Oculto en tu perfil. Clic para hacer público.'}
    >
      {isPublic ? '● Público' : '○ Privado'}
    </button>
  )
}
