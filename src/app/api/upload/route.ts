import { auth } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary'
import { NextRequest, NextResponse } from 'next/server'

// ?type=avatar → cualquier usuario autenticado, carpeta cronos/avatars
// ?type=moment  → solo admins, carpeta cronos/moments (default)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const type = req.nextUrl.searchParams.get('type') ?? 'moment'

  if (type === 'moment' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const isAvatar = type === 'avatar'

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 })
    }
    // Avatares: máx 2MB · Momentos: máx 8MB
    const maxBytes = isAvatar ? 2 * 1024 * 1024 : 8 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `El archivo no puede superar ${isAvatar ? '2' : '8'}MB` },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: isAvatar ? 'cronos/avatars' : 'cronos/moments',
              transformation: isAvatar
                ? [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                    { quality: 'auto', fetch_format: 'auto' },
                  ]
                : [
                    { width: 1200, height: 900, crop: 'fill', gravity: 'auto' },
                    { quality: 'auto', fetch_format: 'auto' },
                  ],
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result as { secure_url: string; public_id: string })
            }
          )
          .end(buffer)
      }
    )

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 })
  }
}
