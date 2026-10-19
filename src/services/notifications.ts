import { db } from '../db'
import type { ScheduledNotification } from '../types'

export type NotificationPermissionKind = 'default' | 'granted' | 'denied' | 'unsupported'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
}

export function getPermission(): NotificationPermissionKind {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission as NotificationPermissionKind
}

export async function requestPermission(): Promise<NotificationPermissionKind> {
  if (!isNotificationSupported()) return 'unsupported'
  const result = await Notification.requestPermission()
  return result as NotificationPermissionKind
}

const ICON = '/pwa-192x192.png'

export async function showLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<boolean> {
  if (getPermission() !== 'granted') return false
  const options: NotificationOptions = {
    body,
    icon: ICON,
    badge: ICON,
    data,
    tag: typeof data?.eventId === 'string' ? data.eventId : undefined,
  }
  try {
    const registration =
      'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined
    if (registration) {
      await registration.showNotification(title, options)
      return true
    }
    new Notification(title, options)
    return true
  } catch {
    return false
  }
}

export async function scheduleNotification(
  entry: Omit<ScheduledNotification, 'shown'>,
): Promise<void> {
  await db.scheduledNotifications.put({ ...entry, shown: false })
}

export async function cancelForEvent(eventId: string): Promise<void> {
  await db.scheduledNotifications.where('eventId').equals(eventId).delete()
}

export async function getScheduledForEvent(eventId: string): Promise<ScheduledNotification[]> {
  return db.scheduledNotifications.where('eventId').equals(eventId).toArray()
}

export async function getDueNotifications(now = Date.now()): Promise<ScheduledNotification[]> {
  return db.scheduledNotifications
    .where('fireAt')
    .belowOrEqual(now)
    .and((n) => !n.shown)
    .toArray()
}

export async function markShown(id: string): Promise<void> {
  await db.scheduledNotifications.update(id, { shown: true })
}

export async function clearScheduledNotifications(): Promise<void> {
  await db.scheduledNotifications.clear()
}

export async function pendingNotificationsCount(): Promise<number> {
  return db.scheduledNotifications.filter((n) => !n.shown).count()
}
