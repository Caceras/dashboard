import type { CalendarEvent } from '~/types'

export default defineEventHandler(async (): Promise<CalendarEvent[]> => {
  const sql = useDb()
  const rows = await sql`
    SELECT e.id, e.title, e.description, e.kind, e.starts_at, e.ends_at,
           e.all_day, e.location, e.project_id, e.client_id,
           c.name AS client_name, p.name AS project_name
    FROM calendar_events e
    LEFT JOIN clients  c ON c.id = e.client_id
    LEFT JOIN projects p ON p.id = e.project_id
    ORDER BY e.starts_at
  ` as unknown as CalendarEvent[]
  return rows
})
