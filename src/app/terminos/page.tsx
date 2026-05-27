import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'

export const metadata = {
  title: 'Términos de Servicio — Cronos',
}

const sections = [
  {
    title: '1. Objeto del servicio',
    content:
      'Cronos es una plataforma de adquisición y custodia de derechos digitales sobre representaciones de momentos históricos. Los "momentos" son activos digitales coleccionables que no confieren derechos de propiedad intelectual sobre los eventos históricos ni sobre las obras artísticas o fotográficas asociadas.',
  },
  {
    title: '2. Subastas y adquisiciones',
    content:
      'Las subastas se desarrollan según las reglas del Protocolo Cronos: cualquier puja en los últimos minutos extiende automáticamente la subasta para garantizar la igualdad de oportunidades. Las pujas son vinculantes y no pueden retirarse. El ganador debe completar el pago en un plazo de 24 horas o perderá la adjudicación.',
  },
  {
    title: '3. Pagos y comisiones',
    content:
      'Cronos aplica una comisión del 8% sobre el precio bruto de cada transacción primaria y secundaria. Las ventas en el mercado secundario generan adicionalmente un royalty del 5% para el primer propietario del momento. Los precios se muestran en euros e incluyen todos los impuestos aplicables.',
  },
  {
    title: '4. Propiedad y transferibilidad',
    content:
      'Cada momento tiene un número de serie único y un número de circulación limitado fijado en el momento de su creación. Los derechos de propiedad son transferibles mediante el mercado secundario de Cronos. La plataforma mantiene un registro de titularidad permanente e inmutable.',
  },
  {
    title: '5. Royalties',
    content:
      'El primer propietario de cada momento (quien gana la subasta original) percibe automáticamente un 5% de royalty sobre cada reventa posterior de ese ejemplar en el mercado secundario de Cronos, de forma indefinida.',
  },
  {
    title: '6. Limitación de responsabilidad',
    content:
      'Cronos no garantiza la disponibilidad continua del servicio. Los activos digitales no tienen valor garantizado y su precio puede fluctuar. La plataforma no es responsable de pérdidas derivadas de fluctuaciones de mercado, decisiones de inversión o interrupciones técnicas.',
  },
  {
    title: '7. Modificaciones',
    content:
      'Cronos se reserva el derecho de modificar estos términos con un preaviso de 30 días. El uso continuado de la plataforma tras la entrada en vigor de los cambios implica la aceptación de los nuevos términos.',
  },
  {
    title: '8. Jurisdicción',
    content:
      'Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Madrid, renunciando expresamente a cualquier otro fuero.',
  },
]

export default function TerminosPage() {
  return (
    <main className="max-w-[800px] mx-auto px-6 md:px-8 py-16">
      <LabelCaps className="text-[#4d4635] block mb-4">Legal</LabelCaps>
      <h1 className="font-serif text-5xl font-bold text-[#e5e2e1] mb-4">Términos de Servicio</h1>
      <LabelCaps className="text-[#4d4635]">Última actualización: enero 2026</LabelCaps>

      <GoldDivider className="my-10" />

      <div className="space-y-10">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-serif text-xl font-bold text-[#e5e2e1] mb-3">{s.title}</h2>
            <p className="text-[#d0c5af] text-sm leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <GoldDivider className="my-10" />

      <p className="text-xs text-[#4d4635] text-center">
        Para consultas legales, contacta en{' '}
        <a href="mailto:legal@cronos.app" className="text-[#99907c] hover:text-[#f2ca50] transition-colors">
          legal@cronos.app
        </a>
      </p>
    </main>
  )
}
