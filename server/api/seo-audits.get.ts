import { neon } from '@neondatabase/serverless'
import type { SeoAudit } from '~/types'

const sql = neon(process.env.DATABASE_URL!)

export default defineEventHandler(async (): Promise<SeoAudit[]> => {
  const rows = await sql`
    SELECT
      a.id, a.domain, a.client_id,
      c.name AS client_name,
      a.score, a.performance, a.accessibility,
      a.best_practices, a.seo, a.issues, a.audited_at
    FROM seo_audits a
    LEFT JOIN clients c ON c.id = a.client_id
    ORDER BY a.audited_at DESC
  `
  return rows as SeoAudit[]
})
