import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { MomentCard } from '@/components/moment/MomentCard'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'

async function getRecentMoments() {
  return prisma.moment.findMany({
    where: {
      status: { in: ['IN_AUCTION', 'IN_VAULT'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: {
      slug: true,
      title: true,
      year: true,
      date: true,
      era: true,
      tier: true,
      status: true,
      description: true,
      imageUrl: true,
      totalCirculation: true,
      basePrice: true,
    },
  })
}

export default async function HomePage() {
  const moments = await getRecentMoments()

  return (
    <main>
      {/* ====== HERO ====== */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <LabelCaps className="text-[#f2ca50] border border-[#735c00] px-3 py-1 inline-block mb-8">
            La Curaduría Definitiva
          </LabelCaps>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6 text-[#e5e2e1]">
            Posee un Pedazo de Historia
          </h1>
          <p className="text-[#d0c5af] text-lg leading-relaxed mb-12">
            Adquiere derechos exclusivos sobre los momentos más cruciales de la existencia humana.
            Cura tu legado con activos históricos definitivos.
          </p>

          {/* Buscador */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-10">
            <div className="flex-1 bg-[#1c1b1b] border border-[#4d4635] flex items-center px-5 py-3">
              <input
                type="text"
                placeholder="Encuentra tu momento..."
                className="bg-transparent flex-1 outline-none text-sm placeholder:text-[#4d4635] text-[#e5e2e1]"
              />
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="#f2ca50"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <Link href="/explorer" className="btn-primary text-center">
              Explorar
            </Link>
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap justify-center gap-3">
            <button className="chip active">Todos</button>
            <button className="chip">Ciencia</button>
            <button className="chip">Arte</button>
            <button className="chip">Guerra</button>
            <button className="chip">Exploración</button>
            <button className="chip">Política</button>
          </div>
        </div>

        <GoldDivider className="my-20" />

        {/* ====== ADQUISICIONES RECIENTES ====== */}
        <div>
          <h2 className="font-serif text-4xl font-bold mb-2 text-[#e5e2e1]">
            Adquisiciones Recientes
          </h2>
          <p className="text-[#a8a39e] text-sm mb-10">
            Momentos históricos que ahora forman parte de colecciones privadas.
          </p>

          {moments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#4d4635]">
              {moments.map((moment) => (
                <MomentCard key={moment.slug} moment={moment} variant="recent" />
              ))}
            </div>
          ) : (
            <div className="border border-[#4d4635] p-16 text-center">
              <p className="text-[#99907c] text-sm">El archivo histórico se está preparando.</p>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-16">
          <div className="border border-[#4d4635] px-6 py-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#f2ca50] rounded-full animate-pulse" />
            <LabelCaps className="text-[#f2ca50]">Actualizaciones en tiempo real</LabelCaps>
          </div>
        </div>

        <GoldDivider className="my-20" />

        {/* ====== TEASER PROTOCOLO ====== */}
        <div className="max-w-3xl mx-auto text-center">
          <LabelCaps className="text-[#f2ca50] border border-[#735c00] px-3 py-1 inline-block mb-6">
            El Protocolo Cronos
          </LabelCaps>
          <h2 className="font-serif text-4xl font-bold mb-4 text-[#e5e2e1]">
            Subastas Donde el Mercado Decide
          </h2>
          <p className="text-[#d0c5af] leading-relaxed mb-8">
            Toda puja en los minutos finales extiende la subasta. Nadie pierde un momento histórico
            por estar dormido — solo cuando el silencio se sostiene, el tiempo cambia de manos.
          </p>
          <Link href="/how-it-works" className="btn-secondary">
            Conoce el Protocolo
          </Link>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-[#4d4635] mt-32">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-serif text-2xl font-bold text-[#f2ca50] mb-4">Cronos</div>
            <p className="text-[#a8a39e] text-sm leading-relaxed">
              Curadores de la línea de tiempo histórica definitiva.
            </p>
          </div>
          <div>
            <LabelCaps className="text-[#99907c] block mb-4">Explorar</LabelCaps>
            <ul className="space-y-2 text-sm text-[#a8a39e]">
              <li>
                <Link href="/timeline" className="hover:text-[#f2ca50] transition-colors">
                  Línea de Tiempo
                </Link>
              </li>
              <li>
                <Link href="/explorer" className="hover:text-[#f2ca50] transition-colors">
                  Explorador
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#f2ca50] transition-colors">
                  Cómo Funciona
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <LabelCaps className="text-[#99907c] block mb-4">Tu Cuenta</LabelCaps>
            <ul className="space-y-2 text-sm text-[#a8a39e]">
              <li>
                <Link href="/vault" className="hover:text-[#f2ca50] transition-colors">
                  La Bóveda
                </Link>
              </li>
              <li>
                <Link href="/my-bids" className="hover:text-[#f2ca50] transition-colors">
                  Mis Pujas
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#f2ca50] transition-colors">
                  Acceder
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <LabelCaps className="text-[#99907c] block mb-4">Legal</LabelCaps>
            <ul className="space-y-2 text-sm text-[#a8a39e]">
              <li>
                <span className="cursor-not-allowed opacity-50">Términos</span>
              </li>
              <li>
                <span className="cursor-not-allowed opacity-50">Privacidad</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#4d4635]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-6 flex justify-between items-center">
            <LabelCaps className="text-[#4d4635]">© 2025 Cronos</LabelCaps>
            <LabelCaps className="text-[#4d4635]">El Mercado del Tiempo</LabelCaps>
          </div>
        </div>
      </footer>
    </main>
  )
}
