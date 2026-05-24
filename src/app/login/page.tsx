import { signIn, auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session?.user) redirect('/')

  const { error } = await searchParams

  return (
    <main className="min-h-screen bg-[#131313] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link href="/" className="font-serif text-4xl font-bold text-[#f2ca50] inline-block mb-8">
            Cronos
          </Link>
          <div className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#f2ca50] border border-[#735c00] px-3 py-1 mb-6">
            Acceso Curatorial
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-3">Entra a tu Bóveda</h1>
          <p className="text-[#d0c5af] text-sm leading-relaxed">
            Introduce tu email y te enviaremos un enlace de acceso. Sin contraseña.
          </p>
        </div>

        {error && (
          <div className="border border-red-900 bg-red-950/30 text-red-400 text-sm px-4 py-3 mb-6">
            Algo fue mal. Inténtalo de nuevo.
          </div>
        )}

        {/* Magic link */}
        <form
          action={async (formData: FormData) => {
            'use server'
            await signIn('resend', {
              email: formData.get('email') as string,
              redirectTo: '/',
            })
          }}
          className="space-y-6 mb-8"
        >
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#99907c] mb-3">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="tu@email.com"
              className="w-full bg-transparent border-b border-[#4d4635] text-[#e5e2e1] py-3 text-sm placeholder:text-[#4d4635] focus:outline-none focus:border-[#f2ca50] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#f2ca50] text-[#3c2f00] py-4 text-[12px] font-semibold tracking-[0.15em] uppercase hover:bg-[#ffe088] transition-colors"
          >
            Enviar enlace de acceso
          </button>
        </form>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.35)] to-transparent" />
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#99907c]">o</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.35)] to-transparent" />
        </div>

        {/* Google OAuth */}
        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="w-full border border-[#f2ca50] text-[#f2ca50] py-4 text-[12px] font-semibold tracking-[0.15em] uppercase hover:bg-[rgba(242,202,80,0.08)] transition-colors flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>
        </form>

        <p className="text-center text-[11px] text-[#99907c] mt-8 leading-relaxed">
          Al acceder aceptas los términos curatoriales de Cronos.
          <br />
          Tu colección, tu legado.
        </p>
      </div>
    </main>
  )
}
