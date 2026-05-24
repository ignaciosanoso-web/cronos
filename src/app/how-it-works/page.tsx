import Link from 'next/link'
import { TierBadge } from '@/components/ui/TierBadge'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { FaqAccordion } from '@/components/ui/FaqAccordion'

export const metadata = {
  title: 'Cómo Funciona — Cronos',
  description:
    'El Protocolo Cronos: subastas anti-sniping, tiers de rareza y mercado secundario histórico.',
}

const STEPS = [
  {
    num: '01',
    tag: 'Descubrimiento',
    title: 'Explora el archivo histórico',
    body: 'Recorre la línea de tiempo, busca por fecha exacta o navega por eras. Cada momento que adquieras tiene una ficha curada: contexto, procedencia, ubicación y fuentes verificadas.',
  },
  {
    num: '02',
    tag: 'Subasta Inaugural',
    title: 'La primera venta es siempre por subasta',
    body: 'Cuando un momento entra al mercado por primera vez, abre con un precio base definido por su rareza. Si alguien puja en los minutos finales, la subasta se extiende automáticamente — esto evita que se pierda por descuido. La subasta solo concluye cuando pasa la ventana de extensión sin pujas nuevas.',
  },
  {
    num: '03',
    tag: 'Adjudicación y Bóveda',
    title: 'El momento entra en tu Bóveda',
    body: 'Al ganar una subasta, el momento pasa a tu Bóveda privada. Se acuña un certificado de curaduría a tu nombre. Tu perfil público de Curador se actualiza con el nuevo artefacto.',
  },
  {
    num: '04',
    tag: 'Mercado Secundario',
    title: 'Vende, conserva o transfiere',
    body: 'Puedes poner tus momentos en venta al precio que consideres. Otros curadores pueden hacer ofertas directas, sin subasta. Cronos cobra una comisión del 8% sobre cada transacción del mercado secundario.',
  },
]

const TIERS = [
  {
    tier: 'MITICO' as const,
    example: 'Aterrizaje Lunar · Einstein 1905',
    base: '7 días',
    ext: '+30 min por puja tardía',
  },
  {
    tier: 'EXCEPCIONAL' as const,
    example: 'Caída de Constantinopla',
    base: '72 horas',
    ext: '+15 min por puja tardía',
  },
  {
    tier: 'RARO' as const,
    example: 'Batalla de Hastings · Woodstock',
    base: '48 horas',
    ext: '+10 min por puja tardía',
  },
  {
    tier: 'COMUN' as const,
    example: 'Eventos del archivo general',
    base: '24 horas',
    ext: '+5 min por puja tardía',
  },
]

const FAQS = [
  {
    q: '¿Qué es exactamente lo que compro?',
    a: 'Compras un certificado digital de curaduría exclusiva sobre un momento histórico, registrado en el archivo permanente de Cronos. El certificado incluye ficha curada, procedencia documental, y el derecho de reventa dentro de la plataforma. No compras propiedad legal universal del evento — eso es imposible — sino un activo de colección único y verificable.',
  },
  {
    q: '¿Por qué hay tiradas limitadas? ¿1 de 11, 1 de 7…?',
    a: 'Cada momento histórico tiene un número fijo de certificados que jamás se ampliará. Esa escasez es una promesa contractual de Cronos. Si el Aterrizaje Lunar tiene 11 certificados, solo existirán 11 propietarios simultáneos en toda la historia del marketplace.',
  },
  {
    q: '¿Cómo se garantiza la rigurosidad histórica?',
    a: 'Cada ficha es revisada por nuestro equipo curatorial — historiadores con formación académica — y contrastada con archivos primarios. Citamos fuentes verificables. Los datos contextuales tienen procedencia documentada.',
  },
  {
    q: '¿Cuál es la comisión de Cronos?',
    a: 'No cobramos por pujar ni por mantener tu Bóveda. Cobramos una comisión del 8% sobre cada venta del mercado secundario, repartida entre vendedor y comprador. En las subastas inaugurales, Cronos retiene el 15% del precio final como tasa de acuñación.',
  },
  {
    q: '¿Qué pasa si gano la subasta y no quiero pagar?',
    a: 'Las pujas son vinculantes. Al pujar autorizas la retención del importe en tu método de pago. Si la subasta finaliza a tu favor, el cobro se ejecuta automáticamente. El incumplimiento conlleva la suspensión de la cuenta y la transferencia del momento al siguiente pujador.',
  },
  {
    q: '¿Puedo regalar o transferir un momento?',
    a: 'Sí. Desde tu Bóveda puedes transferir cualquier momento a otro curador registrado. La trazabilidad se mantiene en el historial público del artefacto.',
  },
  {
    q: '¿Es esto un NFT?',
    a: 'No técnicamente. Cronos opera sobre una base de datos centralizada con auditoría notarial trimestral. Esto nos permite procesar pagos en euros sin cripto, ofrecer atención al cliente, y revertir transacciones en caso de fraude. La unicidad y procedencia están garantizadas por contrato.',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="max-w-[1100px] mx-auto px-6 md:px-8 py-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <LabelCaps className="text-[#f2ca50] border border-[#735c00] px-3 py-1 inline-block mb-6">
          El Protocolo Cronos
        </LabelCaps>
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-[#e5e2e1]">
          Cómo Funciona
        </h1>
        <p className="text-[#d0c5af] text-lg leading-relaxed">
          Cronos es la primera casa de subastas dedicada a momentos históricos. Cada fecha es un
          activo digital único, autenticado por nuestro equipo curatorial, con procedencia
          verificable y trazabilidad permanente.
        </p>
      </div>

      {/* Pasos */}
      <div className="space-y-12 mb-24">
        {STEPS.map((step) => (
          <div key={step.num} className="flex gap-8 items-start">
            <div className="flex-shrink-0 font-serif text-5xl font-bold text-[#4d4635] leading-none w-16 text-right">
              {step.num}
            </div>
            <div className="pt-1">
              <LabelCaps className="text-[#f2ca50] block mb-2">{step.tag}</LabelCaps>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#e5e2e1]">{step.title}</h3>
              <p className="text-[#d0c5af] leading-relaxed">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <GoldDivider className="mb-24" />

      {/* Tiers */}
      <div className="mb-24">
        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl font-bold mb-4 text-[#e5e2e1]">
            Los Cuatro Tiers de Rareza
          </h2>
          <p className="text-[#d0c5af] leading-relaxed max-w-2xl mx-auto">
            La gravedad histórica del momento define la mecánica de su subasta. Los momentos más
            decisivos tienen ventanas más largas para que el mercado los valore con calma.
          </p>
        </div>

        <div className="bg-[#1c1b1b] border border-[#4d4635] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#4d4635]">
                {['Tier', 'Ejemplo', 'Duración Base', 'Extensión Anti-Sniping'].map((h) => (
                  <th key={h} className="label-caps text-[#99907c] text-left px-6 py-4 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIERS.map((row) => (
                <tr key={row.tier} className="border-b border-[#4d4635] last:border-b-0">
                  <td className="px-6 py-5">
                    <TierBadge tier={row.tier} />
                  </td>
                  <td className="px-6 py-5 text-sm text-[#a8a39e]">{row.example}</td>
                  <td className="px-6 py-5 font-serif text-[#e5e2e1]">{row.base}</td>
                  <td className="px-6 py-5 text-sm text-[#d0c5af]">{row.ext}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <GoldDivider className="mb-24" />

      {/* FAQ */}
      <div className="mb-24">
        <h2 className="font-serif text-4xl font-bold mb-10 text-center text-[#e5e2e1]">
          Preguntas Frecuentes
        </h2>
        <FaqAccordion items={FAQS} />
      </div>

      <GoldDivider className="mb-24" />

      {/* CTA */}
      <div className="bg-[#1c1b1b] border border-[#4d4635] p-10 md:p-14 text-center">
        <LabelCaps className="text-[#f2ca50] block mb-4">Acceso al Archivo</LabelCaps>
        <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-[#e5e2e1]">
          Sé de los primeros curadores
        </h3>
        <p className="text-[#d0c5af] mb-8 max-w-xl mx-auto">
          Cronos abre en cohortes limitadas. Accede con tu email y empieza a curar la línea de
          tiempo.
        </p>
        <Link href="/login" className="btn-primary">
          Acceder a Cronos
        </Link>
        <p className="text-xs text-[#4d4635] mt-4">
          Sin spam. Solo el aviso de apertura y el manifiesto curatorial.
        </p>
      </div>
    </main>
  )
}
