import { auth } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Solo admins pueden subir imágenes
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })

    // Validar tipo y tamaño (máx 8MB)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 })
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no puede superar 8MB' }, { status: 400 })
    }

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir a Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'cronos/moments',
              transformation: [
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
