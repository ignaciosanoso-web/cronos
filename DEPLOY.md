# Cronos — Guía de despliegue en producción

## Stack de producción recomendado

| Servicio           | Proveedor                             | Tier gratuito      |
| ------------------ | ------------------------------------- | ------------------ |
| Base de datos      | [Neon](https://neon.tech)             | ✅ 0.5 GB          |
| Hosting + CI       | [Vercel](https://vercel.com)          | ✅ Hobby           |
| Email (magic link) | [Resend](https://resend.com)          | ✅ 3k/mes          |
| Pagos              | [Stripe](https://stripe.com)          | ✅ Sin cuota fija  |
| Tiempo real        | [Pusher Channels](https://pusher.com) | ✅ 200k msgs/día   |
| Colas/Crons        | [Inngest](https://app.inngest.com)    | ✅ 50k steps/mes   |
| Imágenes           | [Cloudinary](https://cloudinary.com)  | ✅ 25 créditos/mes |

---

## Paso 1 — Base de datos (Neon)

1. Crea un proyecto en [console.neon.tech](https://console.neon.tech)
2. Ve a **Connection Details** → activa **Pooled connection** → copia la cadena de conexión
3. La URL tiene el formato: `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/cronos?sslmode=require`
4. Ejecuta las migraciones contra la BD de producción:
   ```bash
   DATABASE_URL="tu-url-neon" npx prisma migrate deploy
   ```

---

## Paso 2 — Vercel

1. Sube el repositorio a GitHub
2. En Vercel, **Add New Project** → selecciona el repo
3. Framework: **Next.js** (autodetectado)
4. Build Command queda como está en `package.json`: `prisma generate && next build`
5. Añade **todas las variables de entorno** desde `.env.local.example`
   - `DATABASE_URL` → cadena Neon (pooled)
   - `AUTH_SECRET` → `openssl rand -base64 32`
   - `NEXTAUTH_URL` → tu URL de Vercel (ej: `https://cronos.vercel.app`)
   - Resto de variables según cada servicio

---

## Paso 3 — Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Edita tu OAuth 2.0 Client ID
3. Añade a **Authorized redirect URIs**:
   ```
   https://tu-dominio.vercel.app/api/auth/callback/google
   ```

---

## Paso 4 — Stripe (webhooks de producción)

1. En [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → **Add endpoint**
2. URL: `https://tu-dominio.vercel.app/api/webhooks/stripe`
3. Eventos a escuchar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET` en Vercel

---

## Paso 5 — Inngest (producción)

1. En [app.inngest.com](https://app.inngest.com) → crea o selecciona tu app
2. Ve a **Apps** → **Sync App** → introduce tu URL:
   ```
   https://tu-dominio.vercel.app/api/inngest
   ```
3. Copia **Event Key** → `INNGEST_EVENT_KEY`
4. Copia **Signing Key** → `INNGEST_SIGNING_KEY`
5. El cron `close-expired-auctions` se activará automáticamente cada minuto

---

## Paso 6 — Resend (dominio verificado)

1. En [resend.com/domains](https://resend.com/domains) → **Add Domain**
2. Añade los registros DNS que Resend te indique
3. Una vez verificado, actualiza en `src/lib/auth.ts`:
   ```typescript
   from: 'Cronos <noreply@tu-dominio.com>'
   ```

---

## Paso 7 — Primer admin en producción

Tras el primer despliegue, inicia sesión con tu cuenta y ejecuta:

```bash
# Cambia el email por el tuyo
DATABASE_URL="tu-url-neon" npx tsx scripts/make-admin.ts tu@email.com
```

---

## Checklist de variables de entorno en Vercel

- [ ] `DATABASE_URL`
- [ ] `AUTH_SECRET`
- [ ] `NEXTAUTH_URL`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `PUSHER_APP_ID`
- [ ] `PUSHER_KEY`
- [ ] `PUSHER_SECRET`
- [ ] `PUSHER_CLUSTER`
- [ ] `NEXT_PUBLIC_PUSHER_KEY`
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `INNGEST_EVENT_KEY`
- [ ] `INNGEST_SIGNING_KEY`
