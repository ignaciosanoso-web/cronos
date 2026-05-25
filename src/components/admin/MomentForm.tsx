'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { createMoment, updateMoment, type MomentFormData } from '@/app/actions/admin/moment'
import type { Era, Category, Tier, Confidence, MomentStatus } from '@prisma/client'

interface MomentFormProps {
  momentId?: string
  initial?: Partial<MomentFormData> & { sourcesRaw?: string }
}

const ERA_OPTIONS: Era[] = [
  'PREHISTORIA',
  'MUNDO_ANTIGUO',
  'EDAD_MEDIA',
  'RENACIMIENTO',
  'ERA_INDUSTRIAL',
  'ERA_ESPACIAL',
  'ERA_DIGITAL',
]
const ERA_LABELS: Record<Era, string> = {
  PREHISTORIA: 'Prehistoria',
  MUNDO_ANTIGUO: 'Mundo Antiguo',
  EDAD_MEDIA: 'Edad Media',
  RENACIMIENTO: 'Renacimiento',
  ERA_INDUSTRIAL: 'Era Industrial',
  ERA_ESPACIAL: 'Era Espacial',
  ERA_DIGITAL: 'Era Digital',
}

const CATEGORY_OPTIONS: Category[] = ['CIENCIA', 'ARTE', 'GUERRA', 'POLITICA', 'EXPLORACION']
const TIER_OPTIONS: Tier[] = ['MITICO', 'EXCEPCIONAL', 'RARO', 'COMUN']
const CONFIDENCE_OPTIONS: Confidence[] = ['HIGH', 'MEDIUM', 'LOW']
const STATUS_OPTIONS: MomentStatus[] = ['DRAFT', 'SCHEDULED', 'IN_AUCTION', 'IN_VAULT']

export function MomentForm({ momentId, initial }: MomentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<MomentFormData>({
    title: initial?.title ?? '',
    year: initial?.year ?? new Date().getFullYear(),
    date: initial?.date ?? '',
    era: initial?.era ?? 'ERA_DIGITAL',
    category: initial?.category ?? 'CIENCIA',
    tier: initial?.tier ?? 'COMUN',
    confidence: initial?.confidence ?? 'MEDIUM',
    description: initial?.description ?? '',
    procedence: initial?.procedence ?? '',
    imageUrl: initial?.imageUrl ?? '',
    location: initial?.location ?? '',
    totalCirculation: initial?.totalCirculation ?? 5,
    basePrice: initial?.basePrice ?? 100,
    sources: initial?.sourcesRaw ?? initial?.sources ?? '',
    status: initial?.status ?? 'DRAFT',
  })

  function set<K extends keyof MomentFormData>(key: K, value: MomentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = momentId ? await updateMoment(momentId, form) : await createMoment(form)

      if ('error' in result) {
        setError(result.error)
      } else {
        router.push('/admin/momentos')
        router.refresh()
      }
    })
  }

  const inputCls =
    'w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-2 text-sm focus:outline-none focus:border-[#f2ca50]'
  const selectCls = inputCls
  const labelCls = 'label-caps text-[#99907c] block mb-1'

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Título y Año */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Título</label>
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="El Primer Aterrizaje Lunar"
          />
        </div>
        <div>
          <label className={labelCls}>Año</label>
          <input
            className={inputCls}
            type="number"
            value={form.year}
            onChange={(e) => set('year', Number(e.target.value))}
            placeholder="-3000"
          />
        </div>
      </div>

      {/* Fecha display y Era */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Fecha (texto)</label>
          <input
            className={inputCls}
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            placeholder="20 de Julio, 1969"
          />
        </div>
        <div>
          <label className={labelCls}>Era</label>
          <select
            className={selectCls}
            value={form.era}
            onChange={(e) => set('era', e.target.value as Era)}
          >
            {ERA_OPTIONS.map((e) => (
              <option key={e} value={e}>
                {ERA_LABELS[e]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tier, Categoría, Confianza, Estado */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>Tier</label>
          <select
            className={selectCls}
            value={form.tier}
            onChange={(e) => set('tier', e.target.value as Tier)}
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Categoría</label>
          <select
            className={selectCls}
            value={form.category}
            onChange={(e) => set('category', e.target.value as Category)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Confianza</label>
          <select
            className={selectCls}
            value={form.confidence}
            onChange={(e) => set('confidence', e.target.value as Confidence)}
          >
            {CONFIDENCE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Estado</label>
          <select
            className={selectCls}
            value={form.status}
            onChange={(e) => set('status', e.target.value as MomentStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Circulación y Precio base */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Circulación total</label>
          <input
            className={inputCls}
            type="number"
            min={1}
            value={form.totalCirculation}
            onChange={(e) => set('totalCirculation', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelCls}>Precio base (€)</label>
          <input
            className={inputCls}
            type="number"
            min={1}
            step={0.01}
            value={form.basePrice}
            onChange={(e) => set('basePrice', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className={labelCls}>Descripción</label>
        <textarea
          className={`${inputCls} resize-y`}
          rows={4}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      {/* Procedencia */}
      <div>
        <label className={labelCls}>Procedencia</label>
        <textarea
          className={`${inputCls} resize-y`}
          rows={3}
          value={form.procedence}
          onChange={(e) => set('procedence', e.target.value)}
        />
      </div>

      {/* Imagen y Ubicación */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>URL de imagen</label>
          <input
            className={inputCls}
            value={form.imageUrl}
            onChange={(e) => set('imageUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className={labelCls}>Ubicación (opcional)</label>
          <input
            className={inputCls}
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Mar de la Tranquilidad, Luna"
          />
        </div>
      </div>

      {/* Fuentes */}
      <div>
        <label className={labelCls}>Fuentes (una por línea)</label>
        <textarea
          className={`${inputCls} resize-y`}
          rows={3}
          value={form.sources}
          onChange={(e) => set('sources', e.target.value)}
          placeholder={'https://nasa.gov/...\nhttps://wikipedia.org/...'}
        />
      </div>

      {error && <p className="text-sm text-[#ff8a73]">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Guardando…' : momentId ? 'Guardar cambios' : 'Crear Momento'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/momentos')}
          disabled={isPending}
          className="btn-secondary px-4"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
