import Dexie, { type EntityTable } from 'dexie'
import type {
  CommunityOrg,
  FimEvent,
  Organizer,
  Report,
  ScheduledNotification,
} from '../types'

export interface MetaRow {
  key: string
  value: string
}

class ReportAguilaDB extends Dexie {
  events!: EntityTable<FimEvent, 'id'>
  community!: EntityTable<CommunityOrg, 'id'>
  organizers!: EntityTable<Organizer, 'id'>
  reports!: EntityTable<Report, 'id'>
  scheduledNotifications!: EntityTable<ScheduledNotification, 'id'>
  meta!: EntityTable<MetaRow, 'key'>

  constructor() {
    super('reportaguila')
    this.version(1).stores({
      events: 'id, category, startsAt, organizerId, updatedAt',
      community: 'id, type',
      organizers: 'id',
      reports: 'id, status, createdAt',
      scheduledNotifications: 'id, eventId, fireAt',
      meta: 'key',
    })
  }
}

export const db = new ReportAguilaDB()

export async function getMeta(key: string): Promise<string | null> {
  const row = await db.meta.get(key)
  return row?.value ?? null
}

export async function setMeta(key: string, value: string): Promise<void> {
  await db.meta.put({ key, value })
}
