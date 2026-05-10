import { neon } from '@neondatabase/serverless'
import type { Project } from '~/types'

const sql = neon(process.env.DATABASE_URL!)

// Joins clients so the table can show client_name without an N+1 fetch.
export default defineEventHandler(async (): Promise<Project[]> => {
  const rows = await sql`
    SELECT
      p.id, p.name, p.client_id, c.name AS client_name,
      p.status, p.priority, p.progress, p.budget,
      p.deadline, p.started_at, p.finished_at,
      p.description, p.created_at, p.updated_at
    FROM projects p
    LEFT JOIN clients c ON c.id = p.client_id
    ORDER BY
      CASE p.status
        WHEN 'in_progress' THEN 0
        WHEN 'review'      THEN 1
        WHEN 'blocked'     THEN 2
        WHEN 'planned'     THEN 3
        WHEN 'done'        THEN 4
        ELSE 5
      END,
      p.deadline ASC NULLS LAST,
      p.name ASC
  `
  return rows as Project[]
})
