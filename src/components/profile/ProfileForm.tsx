'use client'

import { useState, useTransition } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { updateProfile } from '@/app/actions/profile'

interface ProfileFormProps {
  initial: {
    displayName: string
    bio: string
    avatarUrl: string
  }
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const [form, setForm] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleAvatarFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) setError(data.error)
      else set('avatarUrl', data.url)
    } catch {
      setError('Error al subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await updateProfile(form)
      if (result.error) setError(result.error)
      else setSaved(true)
    })
  }

  const labelCls = 'block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#99907c] mb-2'
  const inputCls =
    'w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-4 py-3 text-sm focus:outline-none focus:border-[#f2ca50] transition-colors placeholder:text-[#2a2a2a]'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar */}
      <div>
        <label className={labelCls}>Foto de perfil</label>
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 border border-[#4d4635] overflow-hidden flex-shrink-0 bg-[#0e0e0e]">
            {form.avatarUrl ? (
              <ImageWithFallback
                src={form.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-[#1c1b1b]">
                    <span className="font-serif text-2xl font-bold text-[#f2ca50]">
                      {(form.displayName || '?')[0].toUpperCase()}
                    </span>
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1c1b1b]">
                <span className="font-serif text-2xl font-bold text-[#f2ca50]">
                  {(form.displayName || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <label
              className="block border border-dashed border-[#4d4635] hover:border-[#f2ca50] bg-[#0e0e0e] p-4 text-center cursor-pointer transition-colors"
              htmlFor="avatar-upload"
            >
              {uploading ? (
                <span className="text-sm text-[#f2ca50]">Subiendo…</span>
              ) : (
                <span className="text-sm text-[#99907c]">
                  Arrastra o haz clic para subir foto
                </span>
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleAvatarFile(f)
                }}
              />
            </label>
            <input
              type="text"
              value={form.avatarUrl}
              onChange={(e) => set('avatarUrl', e.target.value)}
              placeholder="O pega una URL de imagen"
              className={inputCls + ' text-xs'}
            />
          </div>
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label htmlFor="displayName" className={labelCls}>
          Nombre de curador
        </label>
        <input
          id="displayName"
          type="text"
          value={form.displayName}
          onChange={(e) => set('displayName', e.target.value)}
          placeholder="Tu nombre público en Cronos"
          maxLength={60}
          className={inputCls}
        />
        <p className="text-xs text-[#4d4635] mt-1">
          Visible en tu perfil público y en los certificados de propiedad.
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className={labelCls}>
          Biografía
        </label>
        <textarea
          id="bio"
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          placeholder="Cuéntanos qué te apasiona de la historia…"
          rows={4}
          maxLength={400}
          className={inputCls + ' resize-none'}
        />
        <p className="text-xs text-[#4d4635] mt-1">{form.bio.length}/400 caracteres</p>
      </div>

      {error && (
        <p className="text-sm text-[#ff8a73] border border-[#ff8a73]/30 bg-[#ff8a73]/10 px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {saved && (
          <span className="text-sm text-[#5fd97a] font-semibold">✓ Guardado</span>
        )}
      </div>
    </form>
  )
}
