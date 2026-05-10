import type { Client } from '~/types'

export default defineEventHandler(async (): Promise<Client[]> => {
  const sql = useDb()
  const rows = await sql`
    SELECT id, name, company, email, status, avatar_url, location,
           hourly_rate, tags, created_at, updated_at
    FROM clients
    ORDER BY created_at DESC
  ` as unknown as Client[]
  return rows
})
