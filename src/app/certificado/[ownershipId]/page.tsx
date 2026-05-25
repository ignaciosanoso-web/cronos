import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TierBadge } from '@/components/ui/TierBadge'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { PrintButton } from '@/components/ui/PrintButton'

const TIER_LABELS: Record<string, string> = {
  MITICO: 'Mítico',
  EXCEPCIONAL: 'Excepcional',
  RARO: 'Raro',
  COMUN: 'Común',
}

async function getCertificateData(ownershipId: string, userId: string) {
  const ownership = await prisma.ownership.findUnique({
    where: { id: ownershipId },
    include: {
      moment: true,
      user: { select: { displayName: true, name: true, email: true } },
    },
  })
  if (!ownership) return null
  if (ownership.userId !== userId) return null
  return ownership
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ ownershipId: string }>
}) {
  const { ownershipId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const ownership = await getCertificateData(ownershipId, session.user.id)
  if (!ownership) notFound()

  const { moment, user } = ownership
  const ownerName = user.displayName ?? user.name ?? user.email ?? 'Curador'
  const yearLabel = moment.year < 0 ? `${Math.abs(moment.year)} a.C.` : String(moment.year)
  const priceEur = (ownership.acquisitionPrice / 100).toLocaleString('es-ES')
  const acquiredDate = ownership.acquiredAt.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      {/* Print button — oculto al imprimir */}
      <div className="no-print fixed top-6 right-6 z-50">
        <PrintButton />
      </div>

      <main className="min-h-screen bg-[#131313] flex items-center justify-center p-8 print:p-0 print:bg-white">
        {/* Certificado */}
        <div className="w-full max-w-[800px] border border-[#f2ca50]/40 bg-[#0e0e0e] p-12 md:p-16 relative print:border-[#c8a800] print:bg-white print:text-black">
          {/* Esquinas decorativas */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#f2ca50]/60 print:border-[#c8a800]" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#f2ca50]/60 print:border-[#c8a800]" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#f2ca50]/60 print:border-[#c8a800]" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#f2ca50]/60 print:border-[#c8a800]" />

          {/* Header */}
          <div className="text-center mb-10">
            <div className="font-serif text-4xl font-bold text-[#f2ca50] mb-2 print:text-[#c8a800]">
              Cronos
            </div>
            <div className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#99907c] print:text-gray-500">
              El Archivo del Tiempo
            </div>
          </div>

          <GoldDivider className="mb-10" />

          {/* Título del certificado */}
          <div className="text-center mb-10">
            <LabelCaps className="text-[#f2ca50] border border-[#735c00] px-4 py-1.5 inline-block mb-4 print:text-[#c8a800] print:border-[#c8a800]">
              Certificado de Propiedad Histórica
            </LabelCaps>
            <p className="text-sm text-[#99907c] print:text-gray-500">
              Se certifica que el titular que figura a continuación es propietario legítimo
              del siguiente momento histórico registrado en el Protocolo Cronos.
            </p>
          </div>

          {/* Momento */}
          <div className="border border-[#4d4635] bg-[#1c1b1b] p-8 mb-10 text-center print:border-gray-300 print:bg-gray-50">
            <LabelCaps className="text-[#f2ca50] block mb-3 print:text-[#c8a800]">{yearLabel}</LabelCaps>
            <h1 className="font-serif text-3xl font-bold text-[#e5e2e1] mb-4 print:text-black">
              {moment.title}
            </h1>
            <div className="flex justify-center gap-2">
              <TierBadge tier={moment.tier} />
              <span className="label-caps border border-[#4d4635] px-2 py-1 text-[10px] text-[#99907c] print:border-gray-300 print:text-gray-500">
                {TIER_LABELS[moment.tier]}
              </span>
            </div>
          </div>

          {/* Datos del certificado */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 text-center">
            <div>
              <LabelCaps className="text-[#99907c] block mb-2 print:text-gray-500">Titular</LabelCaps>
              <div className="font-serif text-lg font-bold text-[#e5e2e1] print:text-black">
                {ownerName}
              </div>
            </div>
            <div>
              <LabelCaps className="text-[#99907c] block mb-2 print:text-gray-500">Ejemplar</LabelCaps>
              <div className="font-serif text-3xl font-bold text-[#f2ca50] print:text-[#c8a800]">
                #{ownership.serialNumber}
              </div>
              <div className="text-xs text-[#4d4635] mt-1 print:text-gray-400">
                de {moment.totalCirculation}
              </div>
            </div>
            <div>
              <LabelCaps className="text-[#99907c] block mb-2 print:text-gray-500">Adquirido por</LabelCaps>
              <div className="font-serif text-2xl font-bold text-[#e5e2e1] print:text-black">
                {priceEur} €
              </div>
            </div>
            <div>
              <LabelCaps className="text-[#99907c] block mb-2 print:text-gray-500">Fecha</LabelCaps>
              <div className="font-serif text-sm font-bold text-[#e5e2e1] leading-tight print:text-black">
                {acquiredDate}
              </div>
            </div>
          </div>

          <GoldDivider className="mb-8" />

          {/* ID de registro */}
          <div className="text-center">
            <p className="text-[10px] text-[#4d4635] tracking-widest print:text-gray-400">
              ID DE REGISTRO — {ownership.id.toUpperCase()}
            </p>
            <p className="text-[10px] text-[#4d4635] mt-1 print:text-gray-400">
              Verificable en cronos.app · Número de serie permanente e intransferible
            </p>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}} />
    </>
  )
}
