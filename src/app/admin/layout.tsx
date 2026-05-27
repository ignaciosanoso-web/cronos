import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/admin/SignOutButton'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/momentos', label: 'Momentos' },
  { href: '/admin/subastas', label: 'Subastas' },
  { href: '/admin/usuarios', label: 'Usuarios' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/')

  return (
    <div className="min-h-screen flex bg-[#131313]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[#4d4635] bg-[#0e0e0e] flex flex-col">
        <div className="px-6 py-6 border-b border-[#4d4635]">
          <Link href="/" className="font-serif text-xl font-bold text-[#f2ca50]">
            Cronos
          </Link>
          <p className="label-caps text-[#4d4635] mt-1 text-[9px]">Panel Admin</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 label-caps text-[11px] text-[#99907c] hover:text-[#f2ca50] hover:bg-[#1c1b1b] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-[#4d4635] space-y-2">
          <p className="text-xs text-[#4d4635] truncate">{session.user.email}</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
