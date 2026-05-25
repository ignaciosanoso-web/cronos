'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPetition } from '@/app/actions/petitions'

export function NewPetitionForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [year, setYear] = useState('')
  const [title, setTitle] = useState('')
  const [justification, setJustification] = useState('')
  const [sources, setSources] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const yearNum = parseInt(year, 10)
    if (isNaN(yearNum)) {
      setError('Introduce un año válido.')
      return
    }

    const sourceList = sources
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    startTransition(async () => {
      const result = await createPetition(yearNum, title, justification, sourceList)
      if ('error' in result) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
          setYear('')
          setTitle('')
          setJustification('')
          setSources('')
          router.refresh()
        }, 1500)
      }
    })
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-sm px-5 py-3">
        + Proponer un momento
      </button>
    )
  }

  return (
    <div className="border border-[#4d4635] p-6 bg-[#1c1b1b]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl font-bold text-[#e5e2e1]">Nueva propuesta</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-[#4d4635] hover:text-[#e5e2e1] text-xl leading-none"
        >
          ×
        </button>
      </div>

      {success ? (
        <p className="text-[#5fd97a] text-sm text-center py-4">
          ✓ Propuesta enviada. El equipo curatorial la revisará.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-caps text-[10px] text-[#99907c] block mb-1.5">Año *</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Ej: 1945 o -44"
                className="w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-2 text-sm focus:outline-none focus:border-[#f2ca50]"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-caps text-[10px] text-[#99907c] block mb-1.5">
                Título del momento *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Firma de la Carta Magna"
                className="w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-2 text-sm focus:outline-none focus:border-[#f2ca50]"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-caps text-[10px] text-[#99907c] block mb-1.5">
              Justificación *{' '}
              <span className="text-[#4d4635] normal-case">
                ({justification.length}/500 — mín. 50 caracteres)
              </span>
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value.slice(0, 500))}
              placeholder="¿Por qué merece estar en el archivo? ¿Qué impacto tuvo en la historia?"
              rows={4}
              className="w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-2 text-sm focus:outline-none focus:border-[#f2ca50] resize-none"
              required
            />
          </div>

          <div>
            <label className="label-caps text-[10px] text-[#99907c] block mb-1.5">
              Fuentes <span className="text-[#4d4635] normal-case">(una por línea, opcional)</span>
            </label>
            <textarea
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              placeholder="https://es.wikipedia.org/wiki/..."
              rows={2}
              className="w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-2 text-sm focus:outline-none focus:border-[#f2ca50] resize-none"
            />
          </div>

          {error && <p className="text-[#ff8a73] text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary text-xs px-5 py-2.5 disabled:opacity-40"
            >
              {isPending ? 'Enviando…' : 'Enviar propuesta'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary text-xs px-5 py-2.5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
