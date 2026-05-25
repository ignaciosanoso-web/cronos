// Lazy singleton — only instantiated on the client (inside useEffect).
// We use a function instead of a module-level instance to avoid Turbopack
// loading pusher-js/dist/node during SSR, where it has no constructor.

let _instance: import('pusher-js').default | null = null

export function getPusherClient(): import('pusher-js').default {
  if (_instance) return _instance

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('pusher-js')
  // pusher-js is CJS — export may be on .default (ESM interop) or directly
  const PusherCtor = (mod.default ?? mod) as typeof import('pusher-js').default

  if (process.env.NODE_ENV === 'development') {
    PusherCtor.logToConsole = true
  }

  _instance = new PusherCtor(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu',
  })

  return _instance
}
