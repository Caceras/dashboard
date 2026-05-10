import type { SeoAudit } from '~/types'

export default defineEventHandler(async (): Promise<SeoAudit[]> => {
  const sql = useDb()
  const rows = await sql`
    SELECT a.id, a.domain, a.client_id, c.name AS client_name,
           a.score, a.performance, a.accessibility, a.best_practices, a.seo,
           a.issues, a.audited_at
    FROM seo_audits a
    LEFT JOIN clients c ON c.id = a.client_id
    ORDER BY a.audited_at DESC
  ` as unknown as SeoAudit[]
  return rows
})
