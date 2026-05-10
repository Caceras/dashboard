import { neon } from '@neondatabase/serverless'
import type { CalendarEvent } from '~/types'

const sql = neon(process.env.DATABASE_URL!)

// Reads from the `calendar_events` table; pages refer to the route as `/api/events`
// to keep the URL terse. Joins clients + projects for inline labels.
export default defineEventHandler(async (): Promise<CalendarEvent[]> => {
  const rows = await sql`
    SELECT
      e.id, e.title, e.description, e.kind,
      e.starts_at, e.ends_at, e.all_day, e.location,
      e.project_id, e.client_id,
      c.name AS client_name,
      p.name AS project_name
    FROM calendar_events e
    LEFT JOIN clients  c ON c.id = e.client_id
    LEFT JOIN projects p ON p.id = e.project_id
    ORDER BY e.starts_at ASC
  `
  return rows as CalendarEvent[]
})
