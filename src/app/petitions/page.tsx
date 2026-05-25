import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { PetitionVoteButton } from '@/components/petitions/PetitionVoteButton'
import { NewPetitionForm } from '@/components/petitions/NewPetitionForm'

export const metadata = {
  title: 'Peticiones — Cronos',
  description:
    'Propón nuevos momentos históricos para el archivo de Cronos y apoya los de otros curadores.',
}

const STATUS_LABEL: Record<string, string> = {
  IN_REVIEW: 'En revisión',
  APPROVED_SCHEDULED: 'Aprobada',
  ARCHIVED: 'Archivada',
}
const STATUS_COLOR: Record<string, string> = {
  IN_REVIEW: 'text-[#f2ca50]',
  APPROVED_SCHEDULED: 'text-[#5fd97a]',
  ARCHIVED: 'text-[#4d4635]',
}

async function getPetitions(userId?: string) {
  const petitions = await prisma.petition.findMany({
    where: { status: { in: ['IN_REVIEW', 'APPROVED_SCHEDULED'] } },
    orderBy: [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }],
    take: 50,
    include: {
      proposer: { select: { name: true, displayName: true } },
      _count: { select: { votes: true } },
      // Always include but filter to user's vote — empty array = not voted
      votes: {
        where: { userId: userId ?? '__no_match__' },
        select: { id: true },
        take: 1,
      },
    },
  })
  return petitions
}

export default async function PetitionsPage() {
  const session = await auth()
  const userId = session?.user?.id
  const petitions = await getPetitions(userId)

  const inReview = petitions.filter((p) => p.status === 'IN_REVIEW')
  const approved = petitions.filter((p) => p.status === 'APPROVED_SCHEDULED')

  return (
    <main className="max-w-[1100px] mx-auto px-6 md:px-8 py-16">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
        <div className="max-w-xl">
          <LabelCaps className="text-[#4d4635] block mb-3">Archivo colaborativo</LabelCaps>
          <h1 className="font-serif text-5xl font-bold text-[#e5e2e1] mb-4">Peticiones</h1>
          <p className="text-[#d0c5af] leading-relaxed">
            ¿Falta un momento que merece estar en el archivo? Propónlo aquí. Los momentos con más
            apoyo de la comunidad pasan a revisión curatorial.
          </p>
        </div>
        <NewPetitionForm />
      </div>

      <GoldDivider className="mb-10" />

      {/* Stats */}
      <div className="flex gap-8 mb-12">
        <div>
          <div className="font-serif text-3xl font-bold text-[#f2ca50]">{inReview.length}</div>
          <LabelCaps className="text-[#4d4635] block mt-1">En revisión</LabelCaps>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-[#5fd97a]">{approved.length}</div>
          <LabelCaps className="text-[#4d4635] block mt-1">Aprobadas</LabelCaps>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-[#e5e2e1]">
            {petitions.reduce((s, p) => s + p._count.votes, 0)}
          </div>
          <LabelCaps className="text-[#4d4635] block mt-1">Votos totales</LabelCaps>
        </div>
      </div>

      {/* Lista */}
      {petitions.length === 0 ? (
        <div className="border border-[#4d4635] p-16 text-center">
          <p className="text-[#4d4635] text-sm mb-4">Aún no hay peticiones.</p>
          <p className="text-[#99907c] text-xs">Sé el primero en proponer un momento histórico.</p>
        </div>
      ) : (
        <div className="border border-[#4d4635] divide-y divide-[#4d4635]">
          {petitions.map((petition) => {
            const proposerName =
              petition.proposer?.displayName ?? petition.proposer?.name ?? 'Curador anónimo'
            const isOwn = userId != null && petition.proposerId === userId
            const hasVoted = userId ? petition.votes.length > 0 : false
            const yearLabel =
              petition.proposedYear < 0
                ? `${Math.abs(petition.proposedYear)} a.C.`
                : String(petition.proposedYear)

            return (
              <div
                key={petition.id}
                className="flex items-start gap-4 p-5 hover:bg-[#1c1b1b] transition-colors"
              >
                {/* Vote button */}
                {userId ? (
                  <PetitionVoteButton
                    petitionId={petition.id}
                    initialVotes={petition._count.votes}
                    initialVoted={hasVoted}
                    isOwn={isOwn}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 px-3 py-2 border border-[#4d4635] text-[#4d4635]">
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4l-8 8h5v8h6v-8h5z" />
                    </svg>
                    <span className="font-serif text-sm tabular-nums">{petition._count.votes}</span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <span className="font-serif text-sm text-[#f2ca50] tabular-nums">
                      {yearLabel}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#e5e2e1] leading-tight">
                      {petition.proposedTitle}
                    </h3>
                    <span className={`label-caps text-[9px] ${STATUS_COLOR[petition.status]}`}>
                      {STATUS_LABEL[petition.status]}
                    </span>
                  </div>
                  <p className="text-sm text-[#99907c] leading-relaxed line-clamp-2 mb-2">
                    {petition.justification}
                  </p>
                  <div className="flex items-center gap-3">
                    <LabelCaps className="text-[#4d4635]">{proposerName}</LabelCaps>
                    <span className="text-[#4d4635] text-xs">·</span>
                    <LabelCaps className="text-[#4d4635]">
                      {petition.createdAt.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </LabelCaps>
                    {petition.sources.length > 0 && (
                      <>
                        <span className="text-[#4d4635] text-xs">·</span>
                        <LabelCaps className="text-[#4d4635]">
                          {petition.sources.length}{' '}
                          {petition.sources.length === 1 ? 'fuente' : 'fuentes'}
                        </LabelCaps>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info footer */}
      <div className="mt-12 p-6 border border-[#4d4635] bg-[#1c1b1b]">
        <LabelCaps className="text-[#4d4635] block mb-3">Proceso de revisión</LabelCaps>
        <p className="text-sm text-[#99907c] leading-relaxed">
          Las peticiones con más de <span className="text-[#e5e2e1]">10 votos</span> pasan a
          revisión prioritaria por el equipo curatorial. La decisión final es editorial: verificamos
          procedencia histórica, seleccionamos el tier adecuado y fijamos la circulación antes de
          programar la subasta. El proceso toma entre{' '}
          <span className="text-[#e5e2e1]">2 y 6 semanas</span>.
        </p>
      </div>
    </main>
  )
}
