import { PrismaClient, MomentStatus, AuctionStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Abre una subasta de prueba en el primer momento disponible con tier MITICO
async function main() {
  const slug = process.argv[2] ?? 'primer-aterrizaje-lunar'

  const moment = await prisma.moment.findUnique({ where: { slug } })
  if (!moment) {
    console.error(`Momento '${slug}' no encontrado.`)
    process.exit(1)
  }

  // Cancelar subastas anteriores abiertas para este momento
  const cancelled = await prisma.auction.updateMany({
    where: { momentId: moment.id, status: { in: ['OPEN', 'EXTENDING'] } },
    data: { status: AuctionStatus.CANCELLED },
  })
  if (cancelled.count > 0) console.log(`  ↩ ${cancelled.count} subasta(s) anteriores canceladas`)

  // Duración según tier
  const HOURS: Record<string, number> = {
    MITICO: 168, // 7 días
    EXCEPCIONAL: 72,
    RARO: 48,
    COMUN: 24,
  }
  const hours = HOURS[moment.tier] ?? 24
  const now = new Date()
  const closesAt = new Date(now.getTime() + hours * 60 * 60 * 1000)

  const auction = await prisma.auction.create({
    data: {
      momentId: moment.id,
      serialNumber: 1,
      startPrice: moment.basePrice,
      status: AuctionStatus.OPEN,
      opensAt: now,
      baseClosesAt: closesAt,
      closesAt,
    },
  })

  await prisma.moment.update({
    where: { id: moment.id },
    data: { status: MomentStatus.IN_AUCTION },
  })

  console.log(`\n✓ Subasta abierta`)
  console.log(`  Momento  : ${moment.title}`)
  console.log(`  Auction ID: ${auction.id}`)
  console.log(`  Precio base: ${(moment.basePrice / 100).toLocaleString('es-ES')} €`)
  console.log(`  Cierre   : ${closesAt.toLocaleString('es-ES')}`)
  console.log(`\n  Prueba en: http://localhost:3000/momento/${moment.slug}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
