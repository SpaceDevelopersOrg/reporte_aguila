/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { db } from './db'
import { flushReportQueue } from './services/sync'

declare let self: ServiceWorkerGlobalScope

const ICON = '/pwa-192x192.png'

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
})

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

/** @type {RegExp[] | undefined} */
let allowlist
// in dev mode, we disable precaching to avoid caching issues
if (import.meta.env.DEV)
  allowlist = [/^\/$/]

// to allow work offline
registerRoute(new NavigationRoute(
  createHandlerBoundToURL('index.html'),
  { allowlist },
))

interface NotifPayload {
  title: string
  body: string
  url: string
}

// --- Web Push (listo para servidor real) ---
self.addEventListener('push', (event) => {
  let payload: NotifPayload = { title: 'Reporte Águila', body: 'Nuevo aviso de la comunidad FIM.', url: '/' }
  try {
    if (event.data) {
      const data = event.data.json() as Partial<NotifPayload>
      payload = { ...payload, ...data }
    }
  } catch {
    if (event.data)
      payload.body = event.data.text()
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: ICON,
      badge: ICON,
      data: { url: payload.url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data?.url as string | undefined) ?? '/'

  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of clientList) {
      if ('focus' in client) {
        await (client as WindowClient).focus()
        if ('navigate' in client)
          await (client as WindowClient).navigate(target)
        return
      }
    }
    await self.clients.openWindow(target)
  })())
})

// --- Sincronización en segundo plano de reportes ---
self.addEventListener('sync', (event) => {
  const syncEvent = event as ExtendableEvent & { tag?: string }
  if (syncEvent.tag === 'report-queue') {
    syncEvent.waitUntil((async () => {
      await flushReportQueue()
      const clientList = await self.clients.matchAll({ type: 'window' })
      clientList.forEach((client) => client.postMessage({ type: 'REPORTS_SYNCED' }))
    })())
  }
})

// --- Alertas pre-evento programadas ---
async function showDueNotifications() {
  const now = Date.now()
  const due = await db.scheduledNotifications
    .where('fireAt')
    .belowOrEqual(now)
    .and((n) => !n.shown)
    .toArray()

  for (const item of due) {
    await self.registration.showNotification(item.title, {
      body: item.body,
      icon: ICON,
      badge: ICON,
      data: { url: `/evento/${item.eventId}` },
    })
    await db.scheduledNotifications.update(item.id, { shown: true })
  }
}

self.addEventListener('periodicsync', (event) => {
  const periodicEvent = event as ExtendableEvent & { tag?: string }
  if (periodicEvent.tag === 'events-check') {
    periodicEvent.waitUntil(showDueNotifications())
  }
})

// Permite verificar alertas vencidas bajo demanda desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
    event.waitUntil(showDueNotifications())
  }
})
