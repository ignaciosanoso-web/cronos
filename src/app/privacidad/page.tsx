import { GoldDivider } from '@/components/ui/GoldDivider'
import { LabelCaps } from '@/components/ui/LabelCaps'

export const metadata = {
  title: 'Política de Privacidad — Cronos',
}

const sections = [
  {
    title: '1. Responsable del tratamiento',
    content:
      'Cronos es el responsable del tratamiento de los datos personales recogidos a través de esta plataforma. Para ejercer tus derechos o realizar consultas sobre privacidad, escríbenos a privacidad@cronos.app.',
  },
  {
    title: '2. Datos que recogemos',
    content:
      'Recogemos el correo electrónico para la autenticación, el nombre de perfil opcional, la fotografía de perfil opcional, el historial de subastas y adquisiciones, y los datos de pago procesados de forma segura por Stripe (Cronos no almacena datos de tarjeta de crédito).',
  },
  {
    title: '3. Finalidad del tratamiento',
    content:
      'Usamos tus datos para gestionar tu cuenta y autenticación, procesar pagos y subastas, enviarte notificaciones sobre tus pujas y propiedades, calcular y distribuir royalties, y mejorar la plataforma mediante análisis agregado y anónimo.',
  },
  {
    title: '4. Base jurídica',
    content:
      'El tratamiento se basa en la ejecución del contrato de servicio para las funciones principales, en el consentimiento para comunicaciones opcionales, y en el interés legítimo para la prevención de fraude y mejora del servicio.',
  },
  {
    title: '5. Conservación de datos',
    content:
      'Conservamos los datos de cuenta mientras la cuenta esté activa. Los registros de transacciones se conservan durante 7 años por obligaciones fiscales y legales. Los datos de sesión se eliminan al cerrar la sesión.',
  },
  {
    title: '6. Compartición con terceros',
    content:
      'No vendemos ni cedemos tus datos a terceros con fines comerciales. Compartimos datos únicamente con Stripe (pagos), Resend (emails transaccionales) y Neon (base de datos), todos ellos bajo contratos de procesamiento de datos conformes con el RGPD.',
  },
  {
    title: '7. Tus derechos',
    content:
      'Tienes derecho a acceder a tus datos, rectificarlos, suprimirlos, oponerte al tratamiento, solicitar la portabilidad y presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD). Para ejercer estos derechos, contacta en privacidad@cronos.app.',
  },
  {
    title: '8. Cookies',
    content:
      'Usamos exclusivamente cookies técnicas necesarias para el funcionamiento de la sesión y la autenticación. No utilizamos cookies de seguimiento, publicidad ni analítica de terceros.',
  },
]

export default function PrivacidadPage() {
  return (
    <main className="max-w-[800px] mx-auto px-6 md:px-8 py-16">
      <LabelCaps className="text-[#4d4635] block mb-4">Legal</LabelCaps>
      <h1 className="font-serif text-5xl font-bold text-[#e5e2e1] mb-4">Política de Privacidad</h1>
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
        Para consultas sobre privacidad, contacta en{' '}
        <a href="mailto:privacidad@cronos.app" className="text-[#99907c] hover:text-[#f2ca50] transition-colors">
          privacidad@cronos.app
        </a>
      </p>
    </main>
  )
}
