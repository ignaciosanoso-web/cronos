'use client'

import { useState } from 'react'
import { GoldDivider } from '@/components/ui/GoldDivider'

interface FaqItem {
  q: string
  a: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="border border-[#4d4635]">
      {items.map((item, i) => (
        <div key={i} className="border-b border-[#4d4635] last:border-b-0">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-[#1c1b1b] transition-colors"
          >
            <span className="font-serif text-lg text-[#e5e2e1] pr-8">{item.q}</span>
            <span className="text-[#f2ca50] text-xl flex-shrink-0 font-light">
              {open === i ? '−' : '+'}
            </span>
          </button>
          {open === i && (
            <div className="px-8 pb-6">
              <GoldDivider className="mb-4" />
              <p className="text-[#d0c5af] text-sm leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
