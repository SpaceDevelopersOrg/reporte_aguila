import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { db } from '../db'
import {
  cancelForEvent,
  getDueNotifications,
  getPermission,
  getScheduledForEvent,
  markShown,
  requestPermission,
  scheduleNotification,
  showLocalNotification,
  type NotificationPermissionKind,
} from '../services/notifications'
import { useSettingsStore } from './settings'
import { formatDateTime } from '../utils/format'
import type { FimEvent } from '../types'

export const useNotificationsStore = defineStore('notifications', () => {
  const permission = ref<NotificationPermissionKind>(getPermission())
  const subscribedEventIds = ref<string[]>([])
  const lastCheck = ref<number | null>(null)

  const isGranted = computed(() => permission.value === 'granted')
  const supported = computed(() => permission.value !== 'unsupported')

  async function refreshPermission() {
    permission.value = getPermission()
  }

  async function enable(): Promise<NotificationPermissionKind> {
    const settings = useSettingsStore()
    const result = await requestPermission()
    permission.value = result
    if (result === 'granted') settings.notificationsEnabled = true
    return result
  }

  function disable() {
    const settings = useSettingsStore()
    settings.notificationsEnabled = false
  }

  async function loadSubscriptions() {
    const all = await db.scheduledNotifications.toArray()
    subscribedEventIds.value = [...new Set(all.filter((n) => !n.shown).map((n) => n.eventId))]
  }

  function isSubscribed(eventId: string): boolean {
    return subscribedEventIds.value.includes(eventId)
  }

  async function scheduledForEvent(eventId: string) {
    return getScheduledForEvent(eventId)
  }

  async function subscribe(event: FimEvent): Promise<boolean> {
    const settings = useSettingsStore()
    const leadTimeMin = settings.leadTimeMin
    const fireAt = Date.parse(event.startsAt) - leadTimeMin * 60_000
    if (Number.isNaN(fireAt) || fireAt <= Date.now()) return false

    await scheduleNotification({
      id: `notif-${event.id}`,
      eventId: event.id,
      fireAt,
      leadTimeMin,
      title: `Pronto: ${event.title}`,
      body: `${formatDateTime(event.startsAt)} · ${event.location}`,
    })
    await loadSubscriptions()
    return true
  }

  async function unsubscribe(eventId: string) {
    await cancelForEvent(eventId)
    await loadSubscriptions()
  }

  async function toggle(event: FimEvent): Promise<boolean> {
    if (isSubscribed(event.id)) {
      await unsubscribe(event.id)
      return false
    }
    const settings = useSettingsStore()
    if (!settings.notificationsEnabled) {
      const result = await enable()
      if (result !== 'granted') return false
    }
    const ok = await subscribe(event)
    return ok
  }

  async function checkDue(): Promise<number> {
    const due = await getDueNotifications()
    if (!due.length) {
      lastCheck.value = Date.now()
      return 0
    }
    let shown = 0
    for (const item of due) {
      const ok = await showLocalNotification(item.title, item.body, {
        eventId: item.eventId,
        url: `/evento/${item.eventId}`,
      })
      await markShown(item.id)
      if (ok) shown += 1
    }
    await loadSubscriptions()
    lastCheck.value = Date.now()
    return shown
  }

  async function pendingCount(): Promise<number> {
    return db.scheduledNotifications.filter((n) => !n.shown).count()
  }

  return {
    permission,
    subscribedEventIds,
    isGranted,
    supported,
    lastCheck,
    refreshPermission,
    enable,
    disable,
    loadSubscriptions,
    isSubscribed,
    scheduledForEvent,
    subscribe,
    unsubscribe,
    toggle,
    checkDue,
    pendingCount,
  }
})
