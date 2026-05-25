'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/timeline', label: 'Línea de Tiempo' },
  { href: '/explorer', label: 'Explorador' },
  { href: '/market', label: 'Mercado' },
  { href: '/petitions', label: 'Peticiones' },
  { href: '/how-it-works', label: 'Cómo Funciona' },
  { href: '/my-bids', label: 'Mis Pujas' },
  { href: '/vault', label: 'La Bóveda' },
]

interface HeaderProps {
  unreadCount?: number
}

export function Header({ unreadCount = 0 }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="border-b border-[#4d4635] sticky top-0 bg-[rgba(19,19,19,0.95)] backdrop-blur z-50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-3xl font-bold text-[#f2ca50]">
            Cronos
          </Link>

          <nav className="hidden md:flex gap-8 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-[#f2ca50] ${
                  pathname === link.href ? 'text-[#f2ca50]' : 'text-[#e5e2e1]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <Link
              href="/notifications"
              className="relative hidden md:flex items-center text-[#e5e2e1] hover:text-[#f2ca50] transition-colors"
              title="Notificaciones"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#f2ca50] text-[#131313] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link
              href="/vault"
              className="hidden md:block text-[#e5e2e1] hover:text-[#f2ca50] transition-colors"
              title="Mi perfil"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            </Link>

            <button
              className="md:hidden text-[#e5e2e1] hover:text-[#f2ca50] transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-[#131313] z-[60] px-8 pt-20">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 text-[#f2ca50] text-3xl leading-none"
            aria-label="Cerrar menú"
          >
            ×
          </button>
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-serif text-3xl font-semibold py-4 border-b border-[#2a2a2a] hover:text-[#f2ca50] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/notifications"
              onClick={() => setMobileOpen(false)}
              className="font-serif text-3xl font-semibold py-4 border-b border-[#2a2a2a] hover:text-[#f2ca50] transition-colors flex items-center gap-3"
            >
              Notificaciones
              {unreadCount > 0 && (
                <span className="bg-[#f2ca50] text-[#131313] text-sm font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
