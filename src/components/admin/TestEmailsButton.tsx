'use client'

import { useState, useTransition } from 'react'
import { sendTestEmails } from '@/app/actions/admin/test-emails'

export function TestEmailsButton() {
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()

  function handle() {
    startTransition(async () => {
      const result = await sendTestEmails()
      setStatus('error' in result ? 'error' : 'sent')
      setTimeout(() => setStatus('idle'), 4000)
    })
  }

  return (
    <button
      onClick={handle}
      disabled={isPending}
      className="border border-[#4d4635] hover:border-[#f2ca50] bg-transparent px-4 py-2 text-[11px] font-semibold tracking-[0.15em] uppercase text-[#99907c] hover:text-[#f2ca50] transition-colors disabled:opacity-50"
    >
      {isPending
        ? 'Enviando…'
        : status === 'sent'
        ? '✓ 5 emails enviados'
        : status === 'error'
        ? '✗ Error'
        : 'Enviar emails de prueba'}
    </button>
  )
}
