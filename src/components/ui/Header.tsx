'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/timeline', label: 'Línea de Tiempo' },
  { href: '/explorer', label: 'Explorador' },
  { href: '/how-it-works', label: 'Cómo Funciona' },
  { href: '/my-bids', label: 'Mis Pujas' },
  { href: '/vault', label: 'La Bóveda' },
]

export function Header() {
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
          </nav>
        </div>
      )}
    </>
  )
}
