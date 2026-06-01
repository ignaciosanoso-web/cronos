import { prisma } from '@/lib/prisma'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { GoldDivider } from '@/components/ui/GoldDivider'
import Link from 'next/link'

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      displayName: true,
      role: true,
      createdAt: true,
      _count: { select: { ownerships: true, bids: true } },
      ownerships: {
        select: { acquisitionPrice: true },
      },
    },
  })
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'text-[#f2ca50]',
  USER: 'text-[#4d4635]',
}

export default async function AdminUsuariosPage() {
  const users = await getUsers()

  const totalRevenue = users.reduce(
    (sum, u) => sum + u.ownerships.reduce((s, o) => s + o.acquisitionPrice, 0),
    0
  )

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-3xl font-bold text-[#e5e2e1]">Usuarios</h1>
        <LabelCaps className="text-[#4d4635]">{users.length} registrados</LabelCaps>
      </div>
      <GoldDivider className="mb-8 mt-4" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-[#4d4635] mb-10">
        <div className="bg-[#131313] p-5">
          <LabelCaps className="text-[#99907c] block mb-2">Total usuarios</LabelCaps>
          <span className="font-serif text-3xl font-bold text-[#e5e2e1]">{users.length}</span>
        </div>
        <div className="bg-[#131313] p-5">
          <LabelCaps className="text-[#99907c] block mb-2">Coleccionistas activos</LabelCaps>
          <span className="font-serif text-3xl font-bold text-[#e5e2e1]">
            {users.filter((u) => u._count.ownerships > 0).length}
          </span>
        </div>
        <div className="bg-[#131313] p-5">
          <LabelCaps className="text-[#99907c] block mb-2">Volumen captado</LabelCaps>
          <span className="font-serif text-3xl font-bold text-[#f2ca50]">
            {(totalRevenue / 100).toLocaleString('es-ES')} €
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#4d4635]">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1fr_80px_70px_80px_100px] gap-4 px-4 py-3 border-b border-[#4d4635] bg-[#1c1b1b]">
          {['Usuario', 'Email', 'Rol', 'Momentos', 'Pujas', 'Valor'].map((h) => (
            <LabelCaps key={h} className="text-[#4d4635] text-[9px]">
              {h}
            </LabelCaps>
          ))}
        </div>

        {users.length === 0 && (
          <p className="px-4 py-8 text-sm text-[#4d4635] text-center">No hay usuarios aún.</p>
        )}

        {users.map((user) => {
          const name = user.displayName ?? user.name ?? '—'
          const totalValue = user.ownerships.reduce((s, o) => s + o.acquisitionPrice, 0)
          return (
            <Link
              key={user.id}
              href={`/curator/${user.id}`}
              target="_blank"
              className="grid grid-cols-[1fr_1fr_80px_70px_80px_100px] gap-4 px-4 py-3 border-b border-[#4d4635] last:border-b-0 hover:bg-[#1c1b1b] transition-colors items-center"
            >
              <div className="min-w-0">
                <p className="text-sm text-[#e5e2e1] truncate hover:text-[#f2ca50] transition-colors">
                  {name}
                </p>
                <LabelCaps className="text-[#2a2a2a] text-[9px]">
                  {user.createdAt.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </LabelCaps>
              </div>
              <p className="text-xs text-[#99907c] truncate">{user.email ?? '—'}</p>
              <span
                className={`label-caps text-[9px] ${ROLE_COLOR[user.role] ?? 'text-[#4d4635]'}`}
              >
                {user.role}
              </span>
              <span className="font-serif text-sm text-[#e5e2e1] tabular-nums">
                {user._count.ownerships}
              </span>
              <span className="font-serif text-sm text-[#e5e2e1] tabular-nums">
                {user._count.bids}
              </span>
              <span className="font-serif text-sm text-[#f2ca50] tabular-nums">
                {totalValue > 0 ? `${(totalValue / 100).toLocaleString('es-ES')} €` : '—'}
              </span>
            </Link>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-[#4d4635]">
        Haz clic en cualquier fila para abrir el perfil público del curador.
      </p>
    </div>
  )
}
