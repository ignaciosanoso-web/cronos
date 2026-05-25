'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useRef } from 'react'
import { LabelCaps } from '@/components/ui/LabelCaps'

const ERAS = [
  { value: '', label: 'Todas las Eras' },
  { value: 'PREHISTORIA', label: 'Prehistoria' },
  { value: 'MUNDO_ANTIGUO', label: 'Mundo Antiguo' },
  { value: 'EDAD_MEDIA', label: 'Edad Media' },
  { value: 'RENACIMIENTO', label: 'Renacimiento' },
  { value: 'ERA_INDUSTRIAL', label: 'Era Industrial' },
  { value: 'ERA_ESPACIAL', label: 'Era Espacial' },
  { value: 'ERA_DIGITAL', label: 'Era Digital' },
]

const TIERS = [
  { value: '', label: 'Todos' },
  { value: 'MITICO', label: 'Mítico' },
  { value: 'EXCEPCIONAL', label: 'Excepcional' },
  { value: 'RARO', label: 'Raro' },
  { value: 'COMUN', label: 'Común' },
]

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'CIENCIA', label: 'Ciencia' },
  { value: 'ARTE', label: 'Arte' },
  { value: 'GUERRA', label: 'Guerra' },
  { value: 'POLITICA', label: 'Política' },
  { value: 'EXPLORACION', label: 'Exploración' },
]

export function ExplorerFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentEra = searchParams.get('era') ?? ''
  const currentTier = searchParams.get('tier') ?? ''
  const currentCat = searchParams.get('cat') ?? ''
  const currentQ = searchParams.get('q') ?? ''

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilter('q', value.trim())
    }, 350)
  }

  const hasFilters = currentEra || currentTier || currentCat || currentQ

  return (
    <div className="border border-[#4d4635] p-6 space-y-5">
      <div className="flex items-center justify-between mb-1">
        <LabelCaps className="text-[#99907c]">Filtros</LabelCaps>
        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="label-caps text-[#f2ca50] hover:text-[#ffe088] transition-colors text-[10px]"
          >
            Limpiar filtros ×
          </button>
        )}
      </div>

      {/* Búsqueda por texto */}
      <div className="flex items-center gap-3 bg-[#0e0e0e] border border-[#4d4635] focus-within:border-[#f2ca50] px-4 py-2 transition-colors">
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="#4d4635"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          className="flex-shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          defaultValue={currentQ}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar momento…"
          className="bg-transparent flex-1 text-sm text-[#e5e2e1] placeholder:text-[#4d4635] outline-none"
        />
      </div>

      <div>
        <LabelCaps className="text-[#4d4635] block mb-3">Era</LabelCaps>
        <div className="flex flex-wrap gap-2">
          {ERAS.map((era) => (
            <button
              key={era.value}
              onClick={() => setFilter('era', era.value)}
              className={`chip ${currentEra === era.value ? 'active' : ''}`}
            >
              {era.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <LabelCaps className="text-[#4d4635] block mb-3">Tier</LabelCaps>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((tier) => (
            <button
              key={tier.value}
              onClick={() => setFilter('tier', tier.value)}
              className={`chip ${currentTier === tier.value ? 'active' : ''}`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <LabelCaps className="text-[#4d4635] block mb-3">Categoría</LabelCaps>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter('cat', cat.value)}
              className={`chip ${currentCat === cat.value ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
