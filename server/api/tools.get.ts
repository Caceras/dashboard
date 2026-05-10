import { neon } from '@neondatabase/serverless'
import type { Tool } from '~/types'

const sql = neon(process.env.DATABASE_URL!)

export default defineEventHandler(async (): Promise<Tool[]> => {
  const rows = await sql`
    SELECT
      id, name, category, vendor, plan, billing_cycle, cost, currency,
      renews_on, owner, status, website, notes, created_at
    FROM tools
    ORDER BY
      CASE status WHEN 'active' THEN 0 WHEN 'trial' THEN 1 ELSE 2 END,
      renews_on ASC NULLS LAST,
      name ASC
  `
  return rows as Tool[]
})
