import Link from 'next/link'

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-[#131313] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="font-serif text-4xl font-bold text-[#f2ca50] inline-block mb-12">
          Cronos
        </Link>
        <div className="border border-[#4d4635] bg-[#1c1b1b] p-10">
          <div className="w-14 h-14 border border-[#f2ca50] flex items-center justify-center mx-auto mb-6">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="#f2ca50"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#e5e2e1] mb-3">Revisa tu correo</h1>
          <p className="text-[#d0c5af] text-sm leading-relaxed mb-6">
            Te hemos enviado un enlace de acceso. Haz clic en él para entrar a tu Bóveda.
          </p>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#99907c]">
            El enlace expira en 24 horas
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block mt-6 text-[11px] tracking-[0.15em] uppercase text-[#99907c] hover:text-[#f2ca50] transition-colors"
        >
          ← Volver al login
        </Link>
      </div>
    </main>
  )
}
