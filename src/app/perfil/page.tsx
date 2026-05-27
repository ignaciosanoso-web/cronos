import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { ProfileForm } from '@/components/profile/ProfileForm'

export const metadata = {
  title: 'Editar perfil — Cronos',
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true, bio: true, avatarUrl: true, email: true, createdAt: true },
  })

  if (!user) redirect('/login')

  return (
    <main className="max-w-[720px] mx-auto px-6 md:px-8 py-16">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-4xl font-bold text-[#e5e2e1]">Mi Perfil</h1>
        <Link
          href="/vault"
          className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#99907c] hover:text-[#f2ca50] transition-colors"
        >
          ← La Bóveda
        </Link>
      </div>
      <LabelCaps className="text-[#4d4635] block mb-8">
        {user.email} · Curador desde{' '}
        {user.createdAt.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
      </LabelCaps>

      <GoldDivider className="mb-10" />

      <ProfileForm
        initial={{
          displayName: user.displayName ?? '',
          bio: user.bio ?? '',
          avatarUrl: user.avatarUrl ?? '',
        }}
      />

      <GoldDivider className="my-10" />

      <div>
        <h2 className="font-serif text-xl font-bold text-[#e5e2e1] mb-4">Visibilidad</h2>
        <p className="text-sm text-[#99907c] leading-relaxed">
          Tu perfil público en{' '}
          <Link
            href={`/curator/${session.user.id}`}
            className="text-[#f2ca50] hover:underline"
          >
            /curator/{session.user.id.slice(0, 8)}…
          </Link>{' '}
          muestra únicamente los momentos que hayas marcado como públicos. El resto de tu
          colección permanece en tu bóveda privada.
        </p>
      </div>
    </main>
  )
}
