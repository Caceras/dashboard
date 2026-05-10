import type { Tool } from '~/types'

export default defineEventHandler(async (): Promise<Tool[]> => {
  const sql = useDb()
  const rows = await sql`
    SELECT id, name, category, vendor, plan, billing_cycle,
           cost, currency, renews_on, owner, status, website, notes, created_at
    FROM tools
    ORDER BY renews_on NULLS LAST, name
  ` as unknown as Tool[]
  return rows
})
