import { db } from '../db'
import { submitReport } from './api/reportsApi'
import type { Report } from '../types'

export interface FlushSummary {
  synced: number
  failed: number
}

export async function flushReportQueue(): Promise<FlushSummary> {
  const pending = await db.reports.where('status').anyOf('pending', 'failed').toArray()
  let synced = 0
  let failed = 0

  for (const report of pending) {
    try {
      await db.reports.update(report.id, { status: 'syncing', error: undefined })
      const result = await submitReport(report as Report)
      await db.reports.update(report.id, {
        status: 'synced',
        syncedAt: result.syncedAt,
        error: undefined,
      })
      synced += 1
    } catch (e) {
      await db.reports.update(report.id, {
        status: 'failed',
        error: e instanceof Error ? e.message : 'No se pudo enviar el reporte',
      })
      failed += 1
    }
  }

  return { synced, failed }
}

interface SyncManagerLike {
  register(tag: string): Promise<void>
}

interface PeriodicSyncManagerLike {
  register(tag: string, options?: { minInterval: number }): Promise<void>
}

export async function registerBackgroundSync(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) return false
    const registration = await navigator.serviceWorker.ready
    const sync = (registration as ServiceWorkerRegistration & { sync?: SyncManagerLike }).sync
    if (sync) {
      await sync.register('report-queue')
      return true
    }
  } catch {
    /* Background Sync no disponible */
  }
  return false
}

export async function registerPeriodicEventCheck(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) return false
    const registration = await navigator.serviceWorker.ready
    const periodic = (
      registration as ServiceWorkerRegistration & { periodicSync?: PeriodicSyncManagerLike }
    ).periodicSync
    if (periodic) {
      await periodic.register('events-check', { minInterval: 60 * 60 * 1000 })
      return true
    }
  } catch {
    /* Periodic Background Sync no disponible o sin permiso */
  }
  return false
}

export async function pendingReportCount(): Promise<number> {
  return db.reports.where('status').anyOf('pending', 'failed', 'syncing').count()
}
