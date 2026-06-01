import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LabelCaps } from '@/components/ui/LabelCaps'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { markAllNotificationsRead } from '@/app/actions/notifications'

export const metadata = {
  title: 'Notificaciones — Cronos',
}

const KIND_META: Record<string, { label: string; icon: string; color: string }> = {
  AUCTION_WON: {
    label: 'Subasta Ganada',
    icon: '🏆',
    color: 'text-[#f2ca50]',
  },
  AUCTION_LOST: {
    label: 'Subasta Perdida',
    icon: '◇',
    color: 'text-[#99907c]',
  },
  BID_OUTBID: {
    label: 'Puja Superada',
    icon: '↑',
    color: 'text-[#ff8a73]',
  },
  AUCTION_EXTENDED: {
    label: 'Subasta Extendida',
    icon: '⏱',
    color: 'text-[#d0c5af]',
  },
  ROYALTY_EARNED: {
    label: 'Royalty Recibido',
    icon: '💛',
    color: 'text-[#f2ca50]',
  },
  EARLY_ACCESS_GRANTED: {
    label: 'Acceso Anticipado',
    icon: '✦',
    color: 'text-[#f2ca50]',
  },
  PETITION_STATUS_CHANGE: {
    label: 'Estado de Petición',
    icon: '◈',
    color: 'text-[#d0c5af]',
  },
}

async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const notifications = await getNotifications(session.user.id)
  const unread = notifications.filter((n) => !n.sentAt).length

  // Mark all as read on page load
  if (unread > 0) {
    await markAllNotificationsRead()
  }

  return (
    <main className="max-w-[900px] mx-auto px-6 md:px-8 py-16">
      <div className="mb-10">
        <LabelCaps className="text-[#f2ca50] block mb-3">Actividad</LabelCaps>
        <h1 className="font-serif text-4xl font-bold text-[#e5e2e1]">Notificaciones</h1>
        {unread > 0 && (
          <p className="text-sm text-[#99907c] mt-2">
            {unread} nueva{unread !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <GoldDivider className="mb-10" />

      {notifications.length === 0 ? (
        <div className="border border-[#4d4635] p-20 text-center">
          <p className="text-[#4d4635] text-sm">Sin notificaciones aún.</p>
        </div>
      ) : (
        <div className="space-y-px">
          {notifications.map((notif) => {
            const payload = notif.payload as Record<string, unknown>
            const isUnread = !notif.sentAt
            const momentSlug = payload.momentSlug as string | undefined
            const momentTitle = payload.momentTitle as string | undefined
            const amountCents = payload.amountCents as number | undefined
            const royaltyAmountCents = payload.royaltyAmountCents as number | undefined
            const salePriceCents = payload.salePriceCents as number | undefined
            const payloadType = payload.type as string | undefined
            const fromName = payload.fromName as string | undefined
            const isTransfer = notif.kind === 'AUCTION_WON' && payloadType === 'TRANSFER'

            const meta = isTransfer
              ? { label: 'Momento Recibido', icon: '🎁', color: 'text-[#f2ca50]' }
              : (KIND_META[notif.kind] ?? {
                  label: notif.kind,
                  icon: '◆',
                  color: 'text-[#99907c]',
                })

            return (
              <div
                key={notif.id}
                className={`flex items-start gap-5 p-5 border-b border-[#2a2a2a] hover:bg-[#1c1b1b] transition-colors ${
                  isUnread ? 'bg-[#1c1b1b]' : 'bg-[#131313]'
                }`}
              >
                {/* Unread dot */}
                <div className="pt-1 w-2 flex-shrink-0">
                  {isUnread && <div className="w-2 h-2 bg-[#f2ca50] rounded-full" />}
                </div>

                {/* Icon */}
                <div className={`text-lg flex-shrink-0 ${meta.color}`}>{meta.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <LabelCaps className={`${meta.color}`}>{meta.label}</LabelCaps>
                    <span className="text-xs text-[#4d4635] flex-shrink-0">
                      {notif.createdAt.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {isTransfer && (
                    <p className="text-sm text-[#d0c5af]">
                      {fromName ?? 'Otro curador'} te ha transferido
                      {momentTitle && <span className="text-[#e5e2e1]"> {momentTitle}</span>}.{' '}
                      <Link
                        href="/vault"
                        className="underline underline-offset-2 hover:text-[#f2ca50] transition-colors"
                      >
                        Ver mi bóveda →
                      </Link>
                    </p>
                  )}

                  {notif.kind === 'AUCTION_WON' && !isTransfer && (
                    <p className="text-sm text-[#d0c5af]">
                      Has ganado la subasta
                      {amountCents && (
                        <span className="text-[#f2ca50]">
                          {' '}
                          por {(amountCents / 100).toLocaleString('es-ES')} €
                        </span>
                      )}
                      .{' '}
                      {momentSlug && (
                        <Link
                          href={`/momento/${momentSlug}`}
                          className="underline underline-offset-2 hover:text-[#f2ca50] transition-colors"
                        >
                          Ver momento →
                        </Link>
                      )}
                    </p>
                  )}

                  {notif.kind === 'AUCTION_LOST' && (
                    <p className="text-sm text-[#99907c]">
                      La subasta ha terminado. Alguien más se ha hecho con este momento.{' '}
                      {momentSlug && (
                        <Link
                          href={`/momento/${momentSlug}`}
                          className="underline underline-offset-2 hover:text-[#f2ca50] transition-colors"
                        >
                          Ver momento →
                        </Link>
                      )}
                    </p>
                  )}

                  {notif.kind === 'BID_OUTBID' && (
                    <p className="text-sm text-[#ff8a73]">
                      Tu puja ha sido superada. Puedes volver a pujar.{' '}
                      {momentSlug && (
                        <Link
                          href={`/momento/${momentSlug}`}
                          className="underline underline-offset-2 hover:text-[#f2ca50] transition-colors"
                        >
                          Ver subasta →
                        </Link>
                      )}
                    </p>
                  )}

                  {notif.kind === 'ROYALTY_EARNED' && (
                    <p className="text-sm text-[#d0c5af]">
                      Has recibido un royalty de{' '}
                      {royaltyAmountCents !== undefined && (
                        <span className="text-[#f2ca50] font-semibold">
                          +{(royaltyAmountCents / 100).toLocaleString('es-ES')} €
                        </span>
                      )}
                      {salePriceCents !== undefined && (
                        <span className="text-[#4d4635]">
                          {' '}
                          (reventa por {(salePriceCents / 100).toLocaleString('es-ES')} €)
                        </span>
                      )}
                      .{' '}
                      {momentSlug && (
                        <Link
                          href={`/vault`}
                          className="underline underline-offset-2 hover:text-[#f2ca50] transition-colors"
                        >
                          Ver bóveda →
                        </Link>
                      )}
                    </p>
                  )}

                  {notif.kind === 'AUCTION_EXTENDED' && (
                    <p className="text-sm text-[#d0c5af]">
                      Se ha realizado una puja de último momento y la subasta se ha extendido.{' '}
                      {momentSlug && (
                        <Link
                          href={`/momento/${momentSlug}`}
                          className="underline underline-offset-2 hover:text-[#f2ca50] transition-colors"
                        >
                          Ver subasta →
                        </Link>
                      )}
                    </p>
                  )}

                  {notif.kind === 'PETITION_STATUS_CHANGE' && (
                    <p className="text-sm text-[#d0c5af]">
                      El estado de tu petición{momentTitle ? ` "${momentTitle}"` : ''} ha sido
                      actualizado.
                    </p>
                  )}

                  {notif.kind === 'EARLY_ACCESS_GRANTED' && (
                    <p className="text-sm text-[#d0c5af]">
                      Tienes acceso anticipado a un nuevo momento.{' '}
                      {momentSlug && (
                        <Link
                          href={`/momento/${momentSlug}`}
                          className="underline underline-offset-2 hover:text-[#f2ca50] transition-colors"
                        >
                          Ver momento →
                        </Link>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
