import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? 'https://cronos.app'

  const moments = await prisma.moment.findMany({
    where: { status: { not: 'DRAFT' } },
    select: { slug: true, updatedAt: true },
  })

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/explorer`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/timeline`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/market`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${base}/petitions`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${base}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terminos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/privacidad`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const momentPages: MetadataRoute.Sitemap = moments.map((m) => ({
    url: `${base}/momento/${m.slug}`,
    lastModified: m.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...momentPages]
}
