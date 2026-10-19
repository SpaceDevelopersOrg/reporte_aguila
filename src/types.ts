export type EventCategory = 'cultural' | 'sports'

export type CommunityType = 'club' | 'sports' | 'organizer'

export type ReportType = 'incidencia' | 'evento' | 'sugerencia' | 'otro'

export type ReportStatus = 'pending' | 'syncing' | 'synced' | 'failed'

export type ThemePreference = 'dark' | 'light' | 'system'

export interface Organizer {
  id: string
  name: string
  contact: string
}

export interface CommunityOrg {
  id: string
  name: string
  type: CommunityType
  description: string
  contact: string
  eventIds: string[]
}

export interface FimEvent {
  id: string
  title: string
  description: string
  category: EventCategory
  startsAt: string
  endsAt: string
  location: string
  organizerId: string
  tags: string[]
  updatedAt: string
}

export interface Report {
  id: string
  type: ReportType
  title: string
  description: string
  location: string
  photoDataUrl?: string
  anonymous: boolean
  createdAt: string
  status: ReportStatus
  error?: string
  syncedAt?: string
}

export interface ScheduledNotification {
  id: string
  eventId: string
  fireAt: number
  leadTimeMin: number
  title: string
  body: string
  shown: boolean
}

export const LEAD_TIME_OPTIONS = [
  { value: 15, label: '15 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 día antes' },
  { value: 10080, label: '1 semana antes' },
] as const
