import { events as seedEvents } from '../../data/mock/events'
import { community as seedCommunity } from '../../data/mock/community'
import { organizers as seedOrganizers } from '../../data/mock/organizers'
import type { CommunityOrg, FimEvent, Organizer, Report } from '../../types'

const LATENCY_MIN = 300
const LATENCY_MAX = 800

function delay(): Promise<void> {
  const ms = LATENCY_MIN + Math.random() * (LATENCY_MAX - LATENCY_MIN)
  return new Promise((resolve) => setTimeout(resolve, ms))
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

export async function getEvents(since?: string | null): Promise<FimEvent[]> {
  await delay()
  const all = [...extraEvents, ...seedEvents]
  if (!since) return all
  const sinceMs = Date.parse(since)
  if (Number.isNaN(sinceMs)) return all
  return all.filter((event) => Date.parse(event.updatedAt) > sinceMs)
}

export async function getEvent(id: string): Promise<FimEvent | undefined> {
  await delay()
  return [...extraEvents, ...seedEvents].find((event) => event.id === id)
}

export async function getCommunity(): Promise<CommunityOrg[]> {
  await delay()
  return seedCommunity
}

export async function getOrganizers(): Promise<Organizer[]> {
  await delay()
  return seedOrganizers
}

export async function submitReport(report: Report): Promise<{ id: string; syncedAt: string }> {
  await delay()
  return { id: report.id, syncedAt: new Date().toISOString() }
}

export async function deleteReport(id: string): Promise<void> {
  await delay()
  void id
}
