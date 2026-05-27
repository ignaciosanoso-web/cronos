'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  slug: string
}

export function ShareButton({ title, slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/momento/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: seleccionar texto
    }
  }

  function handleTwitter() {
    const url = `${window.location.origin}/momento/${slug}`
    const text = `Acabo de descubrir "${title}" en el archivo histórico de Cronos.`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 border border-[#4d4635] hover:border-[#f2ca50] bg-transparent px-4 py-2 text-[11px] font-semibold tracking-[0.15em] uppercase text-[#99907c] hover:text-[#f2ca50] transition-colors"
      >
        {copied ? (
          <>
            <svg width="12" height="12" fill="none" stroke="#5fd97a" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-[#5fd97a]">Copiado</span>
          </>
        ) : (
          <>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar enlace
          </>
        )}
      </button>
      <button
        onClick={handleTwitter}
        className="border border-[#4d4635] hover:border-[#1d9bf0] bg-transparent px-3 py-2 text-[#4d4635] hover:text-[#1d9bf0] transition-colors"
        title="Compartir en X (Twitter)"
      >
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
    </div>
  )
}
