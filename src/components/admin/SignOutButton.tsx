'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-xs text-[#4d4635] hover:text-[#ff8a73] transition-colors"
    >
      Cerrar sesión
    </button>
  )
}
