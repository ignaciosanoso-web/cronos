/**
 * Asigna imágenes públicas a los momentos del seed.
 * Usa Special:FilePath de Wikimedia Commons (redirige al CDN sin hash).
 *
 * Uso:  npx tsx scripts/update-images.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Special:FilePath redirige al CDN real, sin necesidad de calcular el hash MD5
const BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath'

const IMAGES: Record<string, string> = {
  'primer-aterrizaje-lunar': `${BASE}/Aldrin_Apollo_11_original.jpg`,

  'caida-de-constantinopla': `${BASE}/Zonaro_GatesofConst.jpg`,

  'einstein-annus-mirabilis': `${BASE}/Albert_Einstein_Head.jpg`,

  'los-idus-de-marzo': `${BASE}/Vincenzo_Camuccini_-_La_morte_di_Cesare.jpg`,

  'da-vinci-ultima-cena': `${BASE}/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg`,

  'bomba-hiroshima': `${BASE}/Nagasakibomb.jpg`,

  'caida-muro-berlin': `${BASE}/BerlinWall-BrandenburgGate.jpg`,

  'lanzamiento-chatgpt': `${BASE}/Googleplex_HQ_(cropped).jpg`,

  'construccion-piramides-giza': `${BASE}/Kheops-Pyramid.jpg`,

  'atentados-11s': `${BASE}/North_face_south_tower_after_plane_strike_9-11.jpg`,
}

async function main() {
  let updated = 0
  for (const [slug, url] of Object.entries(IMAGES)) {
    const moment = await prisma.moment.findUnique({ where: { slug } })
    if (!moment) {
      console.log(`  ⚠ No encontrado: ${slug}`)
      continue
    }
    // Actualizar siempre los momentos del seed (no los que el usuario subió a Cloudinary)
    const isCloudinary = moment.imageUrl?.includes('cloudinary.com')
    if (isCloudinary) {
      console.log(`  – ${slug} tiene imagen Cloudinary (skipped)`)
      continue
    }
    await prisma.moment.update({ where: { slug }, data: { imageUrl: url } })
    console.log(`  ✓ ${slug}`)
    updated++
  }
  console.log(`\nActualizados: ${updated}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
