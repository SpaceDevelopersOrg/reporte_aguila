import { turso } from './turso'
import type { Report } from '../../types'

export async function submitReport(report: Report): Promise<{ id: string; syncedAt: string }> {
  const syncedAt = new Date().toISOString()
  await turso.execute({
    sql: `INSERT OR REPLACE INTO reports
      (id, userId, type, title, description, location, photoDataUrl, anonymous, createdAt, syncedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      report.id,
      report.userId,
      report.type,
      report.title,
      report.description,
      report.location,
      report.photoDataUrl ?? null,
      report.anonymous ? 1 : 0,
      report.createdAt,
      syncedAt,
    ],
  })
  return { id: report.id, syncedAt }
}
