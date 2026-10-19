import { createClient } from '@libsql/client'
import { events } from '../src/data/mock/events.ts'

const url = process.env.VITE_DB_URL
const authToken = process.env.VITE_DB_TOKEN

if (!url || !authToken) {
  console.error('Faltan VITE_DB_URL o VITE_DB_TOKEN en el entorno.')
  console.error('Ejecuta: node --env-file=.env scripts/seed-events.mjs')
  process.exit(1)
}

const client = createClient({ url, authToken })

await client.execute(`
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    startsAt TEXT NOT NULL,
    endsAt TEXT NOT NULL,
    location TEXT NOT NULL,
    organizerId TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    updatedAt TEXT NOT NULL
  )
`)

await client.execute(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    userId TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    photoDataUrl TEXT,
    anonymous INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    syncedAt TEXT
  )
`)

if (events.length) {
  await client.batch(
    events.map((event) => ({
      sql: `INSERT OR REPLACE INTO events
        (id, title, description, category, startsAt, endsAt, location, organizerId, tags, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        event.id,
        event.title,
        event.description,
        event.category,
        event.startsAt,
        event.endsAt,
        event.location,
        event.organizerId,
        JSON.stringify(event.tags),
        event.updatedAt,
      ],
    })),
    'write',
  )
}

const result = await client.execute(
  'SELECT id, title, category, startsAt, endsAt, location FROM events ORDER BY startsAt',
)
console.log(`${events.length} evento(s) sembrado(s) en Turso:`)
console.table(result.rows)
client.close()
