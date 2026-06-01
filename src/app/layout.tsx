import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Header } from '@/components/ui/Header'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['600', '700', '900'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://cronos.app'

export const metadata: Metadata = {
  title: {
    default: 'Cronos — El Mercado del Tiempo',
    template: '%s — Cronos',
  },
  description:
    'Adquiere derechos exclusivos sobre los momentos más cruciales de la historia. La primera casa de subastas de momentos históricos.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'Cronos — El Mercado del Tiempo',
    description:
      'Adquiere derechos exclusivos sobre los momentos más cruciales de la historia. La primera casa de subastas de momentos históricos.',
    url: BASE_URL,
    siteName: 'Cronos · El Archivo del Tiempo',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cronos — El Mercado del Tiempo',
    description:
      'Adquiere derechos exclusivos sobre los momentos más cruciales de la historia. La primera casa de subastas de momentos históricos.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

async function getUnreadCount(userId?: string): Promise<number> {
  if (!userId) return 0
  return prisma.notification.count({
    where: { userId, sentAt: null },
  })
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  const unreadCount = await getUnreadCount(session?.user?.id)

  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Header
          unreadCount={unreadCount}
          isAuthenticated={!!session?.user}
          isAdmin={session?.user?.role === 'ADMIN'}
        />
        {children}
      </body>
    </html>
  )
}
