import type { EventCategory, ReportStatus, ReportType } from '../types'

const dateFmt = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const timeFmt = new Intl.DateTimeFormat('es-MX', {
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`
}

export function formatDayMonth(iso: string): { day: string; month: string } {
  const d = new Date(iso)
  return {
    day: new Intl.DateTimeFormat('es-MX', { day: 'numeric' }).format(d),
    month: new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(d).replace('.', ''),
  }
}

export function formatRelative(iso: string): string {
  const target = new Date(iso).getTime()
  const diff = target - Date.now()
  const abs = Math.abs(diff)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  const rtf = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })
  if (abs < hour) return rtf.format(Math.round(diff / minute), 'minute')
  if (abs < day) return rtf.format(Math.round(diff / hour), 'hour')
  return rtf.format(Math.round(diff / day), 'day')
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  cultural: 'Cultural',
  sports: 'Deportes',
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  incidencia: 'Incidencia',
  evento: 'Propuesta de evento',
  sugerencia: 'Sugerencia',
  comunidad: 'Propuesta de comunidad',
  otro: 'Otro',
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pendiente de enviar',
  syncing: 'Enviando…',
  synced: 'Enviado',
  failed: 'Error al enviar',
}
