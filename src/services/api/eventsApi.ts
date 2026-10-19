import { turso } from './turso'
import type { EventCategory, FimEvent } from '../../types'

export const EVENTS_SEED_VERSION = '2026-10-19-3'

interface EventRow {
  id: string
  title: string
  description: string
  category: string
  startsAt: string
  endsAt: string
  location: string
  organizerId: string
  tags: string
  updatedAt: string
}

function parseTags(value: unknown): string[] {
  if (Array.isArray(value))
    return value.map(String)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

function rowToEvent(row: EventRow): FimEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    category: row.category as EventCategory,
    startsAt: String(row.startsAt),
    endsAt: String(row.endsAt),
    location: String(row.location),
    organizerId: String(row.organizerId),
    tags: parseTags(row.tags),
    updatedAt: String(row.updatedAt),
  }
}

const extraEvents: FimEvent[] = []
let extraCounter = 0

export function simulateNewEvent(): FimEvent {
  extraCounter += 1
  const now = new Date()
  const startsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000)
  const event: FimEvent = {
    id: `ev-simulado-${extraCounter}`,
    title: `Evento nuevo de la comunidad #${extraCounter}`,
    description:
      'Este evento se acaba de publicar y se detectó al reconectar con el servidor. Aparece primero en el feed.',
    category: extraCounter % 2 === 0 ? 'sports' : 'cultural',
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    location: 'Explanada FIM',
    organizerId: 'org-sociedad',
    tags: ['nuevo'],
    updatedAt: now.toISOString(),
  }
  extraEvents.push(event)
  return event
}

export function clearSimulatedEvents(): void {
  extraEvents.length = 0
  extraCounter = 0
}

async function fetchAllEvents(): Promise<FimEvent[]> {
  const result = await turso.execute('SELECT * FROM events ORDER BY startsAt')
  return result.rows.map((row) => rowToEvent(row as unknown as EventRow))
}

export async function getEvents(since?: string | null): Promise<FimEvent[]> {
  const all = [...extraEvents, ...(await fetchAllEvents())]
  if (!since) return all
  const sinceMs = Date.parse(since)
  if (Number.isNaN(sinceMs)) return all
  return all.filter((event) => Date.parse(event.updatedAt) > sinceMs)
}

export async function getEvent(id: string): Promise<FimEvent | undefined> {
  const simulated = extraEvents.find((event) => event.id === id)
  if (simulated) return simulated
  const result = await turso.execute({ sql: 'SELECT * FROM events WHERE id = ?', args: [id] })
  const row = result.rows[0]
  return row ? rowToEvent(row as unknown as EventRow) : undefined
}
