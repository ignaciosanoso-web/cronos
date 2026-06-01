const FROM = 'Cronos <noreply@resend.dev>'
const RESEND_API = 'https://api.resend.com/emails'

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set, skipping email')
    return
  }
  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[email] Resend error:', err)
    }
  } catch (e) {
    console.error('[email] fetch error:', e)
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

function base(content: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cronos</title></head>
<body style="margin:0;padding:0;background:#131313;font-family:'Georgia',serif;color:#e5e2e1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#131313;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1c1b1b;border:1px solid #4d4635;max-width:600px;width:100%;">
        <tr><td style="padding:32px 40px;border-bottom:1px solid #4d4635;text-align:center;">
          <span style="font-size:28px;font-weight:bold;color:#f2ca50;letter-spacing:2px;">CRONOS</span><br>
          <span style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#99907c;">El Archivo del Tiempo</span>
        </td></tr>
        <tr><td style="padding:40px;">
          ${content}
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #4d4635;text-align:center;">
          <p style="margin:0;font-size:11px;color:#4d4635;letter-spacing:2px;text-transform:uppercase;">
            © 2026 Cronos · El Mercado del Tiempo
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function btn(href: string, text: string) {
  return `<a href="${href}" style="display:inline-block;background:#f2ca50;color:#3c2f00;padding:12px 28px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;margin-top:24px;">${text}</a>`
}

function stat(label: string, value: string) {
  return `<td style="text-align:center;padding:16px 12px;border:1px solid #4d4635;background:#131313;">
    <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#99907c;margin-bottom:6px;">${label}</div>
    <div style="font-size:22px;font-weight:bold;color:#f2ca50;">${value}</div>
  </td>`
}

// ─── Email functions ──────────────────────────────────────────────────────────

export async function sendAuctionWonEmail(opts: {
  to: string
  momentTitle: string
  momentSlug: string
  serialNumber: number
  totalCirculation: number
  amountCents: number
  ownershipId: string
}) {
  const price = (opts.amountCents / 100).toLocaleString('es-ES')
  const url = `${process.env.NEXTAUTH_URL}/momento/${opts.momentSlug}`
  const certUrl = `${process.env.NEXTAUTH_URL}/certificado/${opts.ownershipId}`

  const html = base(`
    <h1 style="margin:0 0 8px;font-size:28px;color:#e5e2e1;line-height:1.2;">El momento es tuyo</h1>
    <p style="color:#99907c;font-size:14px;margin:0 0 32px;font-family:sans-serif;">Has ganado la subasta</p>

    <div style="border:1px solid #f2ca50;background:#0e0e0e;padding:24px;margin-bottom:32px;text-align:center;">
      <p style="color:#f2ca50;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Momento adquirido</p>
      <h2 style="margin:0;font-size:24px;color:#e5e2e1;">${opts.momentTitle}</h2>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        ${stat('Ejemplar', `#${opts.serialNumber} / ${opts.totalCirculation}`)}
        ${stat('Precio final', `${price} €`)}
      </tr>
    </table>

    <p style="color:#d0c5af;font-size:13px;line-height:1.6;font-family:sans-serif;margin:0 0 24px;">
      Este momento histórico está ahora registrado en tu bóveda. Tienes derecho a un
      <strong style="color:#e5e2e1;">royalty del 5%</strong> sobre cada reventa futura de este ejemplar.
    </p>

    <div style="display:flex;gap:12px;">
      ${btn(url, 'Ver momento')}
      &nbsp;&nbsp;
      ${btn(certUrl, 'Ver certificado')}
    </div>
  `)

  await send(opts.to, `✓ Has ganado: ${opts.momentTitle}`, html)
}

export async function sendOutbidEmail(opts: {
  to: string
  momentTitle: string
  momentSlug: string
  newAmountCents: number
}) {
  const price = (opts.newAmountCents / 100).toLocaleString('es-ES')
  const url = `${process.env.NEXTAUTH_URL}/momento/${opts.momentSlug}`

  const html = base(`
    <h1 style="margin:0 0 8px;font-size:28px;color:#e5e2e1;line-height:1.2;">Tu puja ha sido superada</h1>
    <p style="color:#99907c;font-size:14px;margin:0 0 32px;font-family:sans-serif;">Otro curador ha pujado más alto</p>

    <div style="border:1px solid #4d4635;background:#0e0e0e;padding:24px;margin-bottom:32px;text-align:center;">
      <p style="color:#99907c;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Momento en disputa</p>
      <h2 style="margin:0;font-size:22px;color:#e5e2e1;">${opts.momentTitle}</h2>
      <p style="color:#f2ca50;font-size:26px;font-weight:bold;margin:16px 0 0;">${price} €</p>
      <p style="color:#4d4635;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;">nueva puja más alta</p>
    </div>

    <p style="color:#d0c5af;font-size:13px;line-height:1.6;font-family:sans-serif;margin:0 0 24px;">
      La subasta sigue abierta. Si no hay nuevas pujas antes del cierre, el momento pasará al siguiente postor.
      Todavía puedes recuperar el liderato.
    </p>

    ${btn(url, 'Volver a pujar →')}
  `)

  await send(opts.to, `⚡ Tu puja ha sido superada: ${opts.momentTitle}`, html)
}

export async function sendAuctionLostEmail(opts: {
  to: string
  momentTitle: string
  momentSlug: string
}) {
  const exploreUrl = `${process.env.NEXTAUTH_URL}/explorer`

  const html = base(`
    <h1 style="margin:0 0 8px;font-size:28px;color:#e5e2e1;line-height:1.2;">La subasta ha cerrado</h1>
    <p style="color:#99907c;font-size:14px;margin:0 0 32px;font-family:sans-serif;">Este momento ha encontrado nuevo curador</p>

    <div style="border:1px solid #4d4635;background:#0e0e0e;padding:24px;margin-bottom:32px;text-align:center;">
      <p style="color:#4d4635;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Momento subastado</p>
      <h2 style="margin:0;font-size:22px;color:#99907c;">${opts.momentTitle}</h2>
    </div>

    <p style="color:#d0c5af;font-size:13px;line-height:1.6;font-family:sans-serif;margin:0 0 24px;">
      No te preocupes — hay cientos de momentos históricos esperando curador. Explora el archivo
      y encuentra el próximo fragmento de historia que merece estar en tu colección.
    </p>

    ${btn(exploreUrl, 'Explorar momentos →')}
  `)

  await send(opts.to, `Subasta cerrada: ${opts.momentTitle}`, html)
}

export async function sendMomentReceivedEmail(opts: {
  to: string
  momentTitle: string
  momentSlug: string
  fromName: string
}) {
  const vaultUrl = `${process.env.NEXTAUTH_URL}/vault`

  const html = base(`
    <h1 style="margin:0 0 8px;font-size:28px;color:#e5e2e1;line-height:1.2;">Has recibido un momento</h1>
    <p style="color:#99907c;font-size:14px;margin:0 0 32px;font-family:sans-serif;">
      ${opts.fromName} te ha transferido un fragmento de la historia
    </p>

    <div style="border:1px solid #f2ca50;background:#0e0e0e;padding:24px;margin-bottom:32px;text-align:center;">
      <p style="color:#f2ca50;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Momento recibido</p>
      <h2 style="margin:0;font-size:24px;color:#e5e2e1;">${opts.momentTitle}</h2>
    </div>

    <p style="color:#d0c5af;font-size:13px;line-height:1.6;font-family:sans-serif;margin:0 0 24px;">
      Este momento ya está registrado en tu bóveda a tu nombre. Por privacidad, se ha añadido como
      <strong style="color:#e5e2e1;">privado</strong> — puedes hacerlo público desde tu bóveda cuando quieras.
    </p>

    ${btn(vaultUrl, 'Ver mi bóveda →')}
  `)

  await send(opts.to, `Has recibido: ${opts.momentTitle}`, html)
}

export async function sendMiticoAlertEmail(opts: {
  to: string
  momentTitle: string
  momentSlug: string
  startPriceCents: number
  closesAt: string
}) {
  const price = (opts.startPriceCents / 100).toLocaleString('es-ES')
  const url = `${process.env.NEXTAUTH_URL}/momento/${opts.momentSlug}`
  const closes = new Date(opts.closesAt).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

  const html = base(`
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#f2ca50;border:1px solid #735c00;padding:6px 16px;">
        ◆ Tier Mítico
      </span>
    </div>

    <h1 style="margin:0 0 8px;font-size:30px;color:#e5e2e1;line-height:1.2;text-align:center;">
      Ha salido a subasta un momento mítico
    </h1>
    <p style="color:#99907c;font-size:14px;margin:0 0 32px;font-family:sans-serif;text-align:center;">
      Solo se subastan unos pocos ejemplares. Este puede ser el tuyo.
    </p>

    <div style="border:1px solid #f2ca50;background:#0e0e0e;padding:32px;margin-bottom:32px;text-align:center;">
      <h2 style="margin:0 0 24px;font-size:26px;color:#f2ca50;">${opts.momentTitle}</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${stat('Precio de salida', `${price} €`)}
          ${stat('Cierre', closes)}
        </tr>
      </table>
    </div>

    <p style="color:#d0c5af;font-size:13px;line-height:1.6;font-family:sans-serif;margin:0 0 24px;">
      Los momentos <strong style="color:#f2ca50;">Míticos</strong> tienen circulación extremadamente
      limitada. El ganador recibe un royalty <strong style="color:#e5e2e1;">del 5% de forma vitalicia</strong>
      sobre cada reventa futura del ejemplar.
    </p>

    <div style="text-align:center;">
      ${btn(url, '◆ Ver subasta y pujar')}
    </div>
  `)

  await send(opts.to, `◆ Subasta Mítica: ${opts.momentTitle}`, html)
}

export async function sendRoyaltyEmail(opts: {
  to: string
  momentTitle: string
  momentSlug: string
  royaltyAmountCents: number
  salePriceCents: number
}) {
  const royalty = (opts.royaltyAmountCents / 100).toLocaleString('es-ES')
  const salePrice = (opts.salePriceCents / 100).toLocaleString('es-ES')
  const vaultUrl = `${process.env.NEXTAUTH_URL}/vault`

  const html = base(`
    <h1 style="margin:0 0 8px;font-size:28px;color:#e5e2e1;line-height:1.2;">Has recibido un royalty</h1>
    <p style="color:#99907c;font-size:14px;margin:0 0 32px;font-family:sans-serif;">Tu momento histórico ha generado ingresos</p>

    <div style="border:1px solid #4d4635;background:#0e0e0e;padding:24px;margin-bottom:32px;text-align:center;">
      <p style="color:#99907c;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Momento revendido</p>
      <h2 style="margin:0;font-size:22px;color:#e5e2e1;">${opts.momentTitle}</h2>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        ${stat('Precio de reventa', `${salePrice} €`)}
        ${stat('Tu royalty (5%)', `+${royalty} €`)}
      </tr>
    </table>

    <p style="color:#d0c5af;font-size:13px;line-height:1.6;font-family:sans-serif;margin:0 0 24px;">
      Como primer propietario de este ejemplar, recibes automáticamente el 5% de cada reventa.
      Este royalty es <strong style="color:#e5e2e1;">vitalicio e infinito</strong> — cada vez que este
      ejemplar cambie de manos, recibirás tu parte.
    </p>

    ${btn(vaultUrl, 'Ver mi bóveda →')}
  `)

  await send(opts.to, `💛 Royalty recibido: +${royalty} € por ${opts.momentTitle}`, html)
}
