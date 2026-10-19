import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { db, getMeta, setMeta } from '../db'
import { EVENTS_SEED_VERSION, getEvent, getEvents } from '../services/api/eventsApi'
import { showLocalNotification } from '../services/notifications'
import { useSettingsStore } from './settings'
import type { FimEvent } from '../types'

const LAST_SYNC_KEY = 'lastEventSync'
const SEED_VERSION_KEY = 'eventsSeedVersion'

export const useEventsStore = defineStore('events', () => {
  const items = ref<FimEvent[]>([])
  const loading = ref(false)
  const refreshing = ref(false)
  const lastSync = ref<number | null>(null)
  const newEventIds = ref<string[]>([])
  const error = ref<string | null>(null)

  const sorted = computed(() =>
    [...items.value].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
  )

  const upcoming = computed(() => {
    const now = Date.now() - 60 * 60 * 1000
    return sorted.value.filter((e) => Date.parse(e.endsAt) >= now)
  })

  async function syncSeedVersion(): Promise<void> {
    const stored = await getMeta(SEED_VERSION_KEY)
    if (stored === EVENTS_SEED_VERSION) return
    await clearCache()
    await setMeta(SEED_VERSION_KEY, EVENTS_SEED_VERSION)
  }

  async function loadFromCache() {
    loading.value = true
    try {
      await syncSeedVersion()
      items.value = await db.events.toArray()
      const sync = await getMeta(LAST_SYNC_KEY)
      lastSync.value = sync ? Date.parse(sync) : null
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<number> {
    refreshing.value = true
    error.value = null
    try {
      await syncSeedVersion()
      const cached = await db.events.toArray()
      const existingIds = new Set(cached.map((e) => e.id))
      const since = await currentSince()
      const incoming = await getEvents(since)
      if (incoming.length) {
        await db.events.bulkPut(incoming)
        items.value = await db.events.toArray()

        const fresh = incoming.filter((e) => !existingIds.has(e.id))
        await announceNewEvents(since ? fresh : [])
        if (since) newEventIds.value = fresh.map((e) => e.id)

        await setMeta(LAST_SYNC_KEY, maxUpdatedAt(incoming, cached))
        lastSync.value = Date.now()
      }
      return incoming.length
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al sincronizar eventos'
      return 0
    } finally {
      refreshing.value = false
    }
  }

  async function currentSince(): Promise<string | null> {
    const all = await db.events.toArray()
    const max = all.reduce((m, e) => (e.updatedAt > m ? e.updatedAt : m), '')
    return max || (await getMeta(LAST_SYNC_KEY))
  }

  function maxUpdatedAt(incoming: FimEvent[], cached: FimEvent[]): string {
    return [...incoming, ...cached].reduce((m, e) => (e.updatedAt > m ? e.updatedAt : m), '')
  }

  async function announceNewEvents(fresh: FimEvent[]) {
    const settings = useSettingsStore()
    if (!settings.notificationsEnabled || !fresh.length) return
    const relevant = fresh.filter((e) => settings.notifyCategory[e.category])
    for (const event of relevant.slice(0, 3)) {
      await showLocalNotification('Nuevo evento en la FIM', event.title, {
        eventId: event.id,
        url: `/evento/${event.id}`,
      })
    }
  }

  function getById(id: string): FimEvent | undefined {
    return items.value.find((e) => e.id === id)
  }

  async function ensureEvent(id: string): Promise<FimEvent | undefined> {
    const cached = getById(id)
    if (cached) return cached
    const event = await getEvent(id)
    if (event) {
      await db.events.put(event)
      items.value = await db.events.toArray()
    }
    return event
  }

  async function clearCache(): Promise<void> {
    await db.events.clear()
    items.value = []
    lastSync.value = null
    newEventIds.value = []
    await setMeta(LAST_SYNC_KEY, '')
  }

  function clearNewFlags() {
    newEventIds.value = []
  }

  return {
    items,
    sorted,
    upcoming,
    loading,
    refreshing,
    lastSync,
    newEventIds,
    error,
    loadFromCache,
    refresh,
    getById,
    ensureEvent,
    clearCache,
    clearNewFlags,
  }
})
