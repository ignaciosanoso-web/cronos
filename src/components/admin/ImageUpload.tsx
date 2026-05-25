'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        onChange(data.url)
      }
    } catch {
      setError('Error de conexión al subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative aspect-[4/3] bg-[#0e0e0e] border border-[#4d4635] overflow-hidden w-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-[#131313]/80 text-[#ff8a73] text-xs px-1.5 py-0.5 hover:bg-[#ff8a73] hover:text-[#131313] transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-[#4d4635] hover:border-[#f2ca50] bg-[#0e0e0e] p-6 text-center cursor-pointer transition-colors"
      >
        {uploading ? (
          <p className="text-sm text-[#f2ca50]">Subiendo…</p>
        ) : (
          <>
            <p className="text-sm text-[#99907c]">
              {value ? 'Reemplazar imagen' : 'Arrastra una imagen o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-[#4d4635] mt-1">JPG, PNG, WebP · máx 8MB</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {/* URL manual como fallback */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="O pega una URL directamente"
        className="w-full bg-[#0e0e0e] border border-[#4d4635] text-[#e5e2e1] px-3 py-2 text-xs focus:outline-none focus:border-[#f2ca50] text-[#4d4635] placeholder:text-[#2a2a2a]"
      />

      {error && <p className="text-xs text-[#ff8a73]">{error}</p>}
    </div>
  )
}
