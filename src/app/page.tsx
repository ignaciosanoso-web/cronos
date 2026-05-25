import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { MomentCard } from '@/components/moment/MomentCard'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { TierBadge } from '@/components/ui/TierBadge'
import { AuctionCountdown } from '@/components/auction/AuctionCountdown'
import type { Tier } from '@prisma/client'

const TIER_MECHANICS: Record<Tier, { triggerMin: number; extensionMin: number }> = {
  MITICO: { triggerMin: 30, extensionMin: 30 },
  EXCEPCIONAL: { triggerMin: 15, extensionMin: 15 },
  RARO: { triggerMin: 10, extensionMin: 10 },
  COMUN: { triggerMin: 5, extensionMin: 5 },
}

const ERA_LABELS: Record<string, string> = {
  PREHISTORIA: 'Prehistoria',
  MUNDO_ANTIGUO: 'Mundo Antiguo',
  EDAD_MEDIA: 'Edad Media',
  RENACIMIENTO: 'Renacimiento',
  ERA_INDUSTRIAL: 'Era Industrial',
  ERA_ESPACIAL: 'Era Espacial',
  ERA_DIGITAL: 'Era Digital',
}

async function getActiveAuctions() {
  return prisma.auction.findMany({
    where: { status: { in: ['OPEN', 'EXTENDING'] } },
    orderBy: { closesAt: 'asc' },
    take: 4,
    include: {
      moment: {
        select: {
          slug: true,
          title: true,
          year: true,
          era: true,
          tier: true,
          imageUrl: true,
          totalCirculation: true,
        },
      },
      currentBid: { select: { amount: true } },
    },
  })
}

async function getRecentVault() {
  return prisma.moment.findMany({
    where: { status: { in: ['IN_VAULT'] } },
    orderBy: { updatedAt: 'desc' },
    take: 3,
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
  const [activeAuctions, recentVault] = await Promise.all([getActiveAuctions(), getRecentVault()])

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

          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-10">
            <Link
              href="/explorer"
              className="flex-1 bg-[#1c1b1b] border border-[#4d4635] flex items-center px-5 py-3 group hover:border-[#f2ca50] transition-colors"
            >
              <span className="bg-transparent flex-1 text-sm text-[#4d4635] group-hover:text-[#99907c] transition-colors">
                Encuentra tu momento…
              </span>
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
            </Link>
            <Link href="/explorer" className="btn-primary text-center">
              Explorar
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['Ciencia', 'Arte', 'Guerra', 'Exploración', 'Política'].map((cat) => (
              <Link
                key={cat}
                href={`/explorer?cat=${cat.toUpperCase().replace('Ó', 'O').replace('Á', 'A').replace('É', 'E')}`}
                className="chip"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        <GoldDivider className="my-20" />

        {/* ====== SUBASTAS EN CURSO ====== */}
        {activeAuctions.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 bg-[#f2ca50] rounded-full animate-pulse" />
                  <LabelCaps className="text-[#f2ca50]">En Vivo</LabelCaps>
                </div>
                <h2 className="font-serif text-4xl font-bold text-[#e5e2e1]">Subastas en Curso</h2>
              </div>
              <Link href="/explorer?status=IN_AUCTION" className="hidden md:block btn-secondary">
                Ver todas →
              </Link>
            </div>

            <div
              className={`grid gap-px bg-[#4d4635] ${activeAuctions.length >= 2 ? 'md:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}
            >
              {activeAuctions.map((auction) => {
                const mechanics = TIER_MECHANICS[auction.moment.tier]
                const currentCents = auction.currentBid?.amount ?? auction.startPrice
                const priceEur = (currentCents / 100).toLocaleString('es-ES')
                const yearLabel =
                  auction.moment.year < 0
                    ? `${Math.abs(auction.moment.year)} a.C.`
                    : String(auction.moment.year)

                return (
                  <Link
                    key={auction.id}
                    href={`/momento/${auction.moment.slug}`}
                    className="group bg-[#131313] flex gap-0 hover:bg-[#1c1b1b] transition-colors"
                  >
                    {/* Imagen */}
                    <div className="w-32 md:w-44 flex-shrink-0 overflow-hidden relative">
                      {auction.moment.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={auction.moment.imageUrl}
                          alt={auction.moment.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1c1b1b] flex items-center justify-center">
                          <span className="label-caps text-[#4d4635] text-[9px]">Sin imagen</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <TierBadge tier={auction.moment.tier} className="!bg-[#131313]/80" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                      <div>
                        <LabelCaps className="text-[#4d4635] block mb-1 text-[9px]">
                          {ERA_LABELS[auction.moment.era]} · {yearLabel}
                        </LabelCaps>
                        <h3 className="font-serif font-bold text-[#e5e2e1] leading-tight mb-3 group-hover:text-[#f2ca50] transition-colors">
                          {auction.moment.title}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-end justify-between">
                          <div>
                            <LabelCaps className="text-[#99907c] block mb-0.5 text-[9px]">
                              {auction.currentBid ? 'Puja actual' : 'Precio base'}
                            </LabelCaps>
                            <span className="font-serif text-xl font-bold text-[#f2ca50]">
                              {priceEur} €
                            </span>
                          </div>
                          <LabelCaps className="text-[#f2ca50] text-[10px]">Pujar →</LabelCaps>
                        </div>
                        <AuctionCountdown
                          closesAt={auction.closesAt.toISOString()}
                          triggerMin={mechanics.triggerMin}
                          extensionMin={mechanics.extensionMin}
                          compact
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <GoldDivider className="my-20" />
          </>
        )}

        {/* ====== ADQUIRIDOS RECIENTEMENTE ====== */}
        {recentVault.length > 0 && (
          <>
            <div className="mb-10">
              <h2 className="font-serif text-4xl font-bold mb-2 text-[#e5e2e1]">
                Adquiridos Recientemente
              </h2>
              <p className="text-[#a8a39e] text-sm">
                Momentos históricos que ahora forman parte de colecciones privadas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#4d4635]">
              {recentVault.map((moment) => (
                <MomentCard key={moment.slug} moment={moment} variant="recent" />
              ))}
            </div>

            <GoldDivider className="my-20" />
          </>
        )}

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
                <Link href="/notifications" className="hover:text-[#f2ca50] transition-colors">
                  Notificaciones
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
            <LabelCaps className="text-[#4d4635]">© 2026 Cronos</LabelCaps>
            <LabelCaps className="text-[#4d4635]">El Mercado del Tiempo</LabelCaps>
          </div>
        </div>
      </footer>
    </main>
  )
}
