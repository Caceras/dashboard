import { neon } from '@neondatabase/serverless'
import type { Client } from '~/types'

const sql = neon(process.env.DATABASE_URL!)

export default defineEventHandler(async (): Promise<Client[]> => {
  const rows = await sql`
    SELECT
      id, name, company, email, status, avatar_url, location,
      hourly_rate, tags, created_at, updated_at
    FROM clients
    ORDER BY
      CASE status
        WHEN 'active'   THEN 0
        WHEN 'prospect' THEN 1
        WHEN 'paused'   THEN 2
        WHEN 'archived' THEN 3
        ELSE 4
      END,
      name ASC
  `
  return rows as Client[]
})
