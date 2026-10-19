import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { db } from '../db'
import { flushReportQueue, registerBackgroundSync } from '../services/sync'
import { newId } from '../utils/format'
import type { Report, ReportStatus, ReportType } from '../types'

export interface ReportDraft {
  type: ReportType
  title: string
  description: string
  location: string
  photoDataUrl?: string
  anonymous: boolean
}

export const useReportsStore = defineStore('reports', () => {
  const items = ref<Report[]>([])
  const loading = ref(false)
  const flushing = ref(false)
  const currentUserId = ref<string | null>(null)
  const lastSummary = ref<{ synced: number; failed: number } | null>(null)

  const sorted = computed(() =>
    [...items.value].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  )

  const pendingCount = computed(
    () => items.value.filter((r) => r.status !== 'synced').length,
  )

  const isSignedIn = computed(() => !!currentUserId.value)

  function countByStatus(status: ReportStatus): number {
    return items.value.filter((r) => r.status === status).length
  }

  function isOwner(report: Report): boolean {
    return !!currentUserId.value && report.userId === currentUserId.value
  }

  async function setUser(userId: string | null) {
    if (currentUserId.value === userId) return
    currentUserId.value = userId
    await load()
  }

  async function load() {
    loading.value = true
    try {
      const all = await db.reports.toArray()
      items.value = currentUserId.value ? all.filter(isOwner) : []
    } finally {
      loading.value = false
    }
  }

  async function create(draft: ReportDraft, online: boolean): Promise<Report> {
    if (!currentUserId.value) {
      throw new Error('Necesitas iniciar sesión para publicar un reporte.')
    }
    const report: Report = {
      id: newId(),
      userId: currentUserId.value,
      type: draft.type,
      title: draft.title.trim(),
      description: draft.description.trim(),
      location: draft.location.trim(),
      photoDataUrl: draft.photoDataUrl,
      anonymous: draft.anonymous,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    await db.reports.put(report)
    await load()

    if (online) {
      await flush()
    } else {
      await registerBackgroundSync()
    }
    return report
  }

  async function retry(id: string) {
    await db.reports.update(id, { status: 'pending', error: undefined })
    await load()
    await flush()
  }

  async function remove(id: string) {
    await db.reports.delete(id)
    await load()
  }

  async function flush(): Promise<void> {
    flushing.value = true
    try {
      lastSummary.value = await flushReportQueue()
      await load()
    } finally {
      flushing.value = false
    }
  }

  return {
    items,
    sorted,
    loading,
    flushing,
    lastSummary,
    currentUserId,
    isSignedIn,
    pendingCount,
    countByStatus,
    load,
    setUser,
    create,
    retry,
    remove,
    flush,
  }
})
