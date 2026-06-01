# Cronos · El Archivo del Tiempo

La primera casa de subastas de **momentos históricos**. Cada fecha decisiva de la historia es un
activo digital único, autenticado, con procedencia verificable y circulación limitada. Los curadores
pujan en subastas inaugurales anti-sniping, conservan sus momentos en una bóveda privada, los
revenden en el mercado secundario (con royalty vitalicio para el primer propietario) o los transfieren
a otros curadores.

## Stack

| Capa          | Tecnología                                         |
| ------------- | -------------------------------------------------- |
| Framework     | Next.js 15 (App Router, Server Actions, Turbopack) |
| Lenguaje      | TypeScript                                         |
| Base de datos | PostgreSQL (Neon) vía Prisma                       |
| Auth          | Auth.js v5 (magic link + Google OAuth)             |
| Pagos         | Stripe (PaymentIntents con captura diferida)       |
| Tiempo real   | Pusher Channels                                    |
| Jobs / cron   | Inngest (cierre de subastas)                       |
| Email         | Resend (REST API)                                  |
| Imágenes      | Cloudinary                                         |
| Estilos       | Tailwind CSS v4                                    |
| Tests         | Vitest                                             |

## Arranque local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local   # y rellenar (ver tabla abajo)

# 3. Generar el cliente de Prisma y aplicar el esquema
npx prisma generate
npx prisma migrate dev

# 4. Poblar con 10 momentos históricos reales
npm run seed

# 5. Levantar la app (y, en otra terminal, Inngest para las subastas)
npm run dev
npm run inngest
```

App en [http://localhost:3000](http://localhost:3000).

Para promover tu usuario a administrador, ejecuta el script tras registrarte:

```bash
npx tsx scripts/promote-admin.ts tu-email@ejemplo.com
```

## Scripts

| Comando              | Descripción                                            |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Servidor de desarrollo (Turbopack)                     |
| `npm run build`      | Build de producción (`prisma generate` + `next build`) |
| `npm run start`      | Servidor de producción                                 |
| `npm test`           | Suite de tests (Vitest)                                |
| `npm run test:watch` | Tests en modo watch                                    |
| `npm run lint`       | ESLint                                                 |
| `npm run seed`       | Pobla la BD con momentos de ejemplo                    |
| `npm run inngest`    | Dev server de Inngest (cierre de subastas)             |

## Variables de entorno

Todas obligatorias en producción. En Vercel se añaden desde **Settings → Environment Variables**.

| Variable                                                                 | Para qué                 | Notas                                                                  |
| ------------------------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------- |
| `DATABASE_URL`                                                           | Conexión Postgres        | Usar la cadena _pooled_ (puerto 6432) en Vercel                        |
| `AUTH_SECRET`                                                            | Cifrado de sesiones      | `openssl rand -base64 32`                                              |
| `NEXTAUTH_URL`                                                           | URL pública de la app    | **Crítica**: sin ella, los enlaces de los emails apuntan a `undefined` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`                              | Login con Google         | Google Cloud Console → OAuth 2.0                                       |
| `RESEND_API_KEY`                                                         | Envío de emails          | resend.com → API Keys                                                  |
| `STRIPE_SECRET_KEY`                                                      | Pagos (servidor)         | dashboard.stripe.com/apikeys                                           |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`                                     | Pagos (cliente)          |                                                                        |
| `STRIPE_WEBHOOK_SECRET`                                                  | Verificación de webhooks | El de **producción**, no el del CLI local                              |
| `PUSHER_APP_ID` / `PUSHER_KEY` / `PUSHER_SECRET` / `PUSHER_CLUSTER`      | Tiempo real (servidor)   | dashboard.pusher.com                                                   |
| `NEXT_PUBLIC_PUSHER_KEY` / `NEXT_PUBLIC_PUSHER_CLUSTER`                  | Tiempo real (cliente)    |                                                                        |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Subida de imágenes       | console.cloudinary.com                                                 |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY`                              | Jobs en producción       | app.inngest.com → Event Keys. En local pueden ir vacías                |

## Despliegue en Vercel

1. Importa el repo en Vercel.
2. Añade **todas** las variables de la tabla anterior (entorno _Production_).
3. Configura el webhook de Stripe apuntando a `https://TU-DOMINIO/api/webhooks/stripe`
   (eventos `payment_intent.*`) y copia el signing secret a `STRIPE_WEBHOOK_SECRET`.
4. Conecta el proyecto en **app.inngest.com** para que el cron de cierre de subastas se ejecute.
5. Tras el primer deploy, ejecuta las migraciones contra la BD de producción
   (`npx prisma migrate deploy`) y promueve tu usuario admin.

## Arquitectura

```
src/
├── app/
│   ├── actions/        Server Actions (bid, market, ownership, profile, admin/*)
│   ├── admin/          Panel de administración (momentos, subastas, usuarios)
│   ├── api/            Webhooks (Stripe), upload (Cloudinary), Inngest, Auth.js
│   ├── momento/[slug]/ Ficha de momento + subasta en vivo
│   ├── market/         Mercado secundario
│   ├── vault/          Bóveda privada del curador
│   └── ...             explorer, timeline, petitions, curator, certificado…
├── components/         UI (auction, market, vault, moment, admin, ui)
├── inngest/            Funciones de cierre de subastas
└── lib/
    ├── fees.ts            Comisiones (10% inaugural · 8% secundario · 5% royalty) ✓ testeado
    ├── auction-engine.ts  Puja mínima + anti-sniping por tier ✓ testeado
    ├── validators.ts      Validación de frontera ✓ testeado
    ├── auth.ts · prisma.ts · stripe.ts · pusher.ts · cloudinary.ts · email.ts
```

### Reglas de negocio clave

- **Subasta inaugural**: primera venta siempre por subasta. Cierre extensible (anti-sniping):
  una puja en los últimos N minutos amplía el cierre N minutos más (N según el tier).
- **Incremento mínimo de puja**: +5% sobre la puja actual.
- **Comisiones**: Cronos retiene 10% en subasta inaugural y 8% en el mercado secundario.
- **Royalty**: el primer propietario recibe 5% de cada reventa, de forma vitalicia.
- **Transferencias**: un curador puede regalar un ejemplar; el derecho de royalty del primer
  propietario **no** se transfiere.

Las cuatro reglas anteriores viven centralizadas en `lib/fees.ts` y `lib/auction-engine.ts`,
cubiertas por la suite de Vitest (`npm test`).
