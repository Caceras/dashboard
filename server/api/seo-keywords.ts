import type { SeoKeyword } from '~/types'

export default defineEventHandler(async (): Promise<SeoKeyword[]> => {
  const sql = useDb()
  const rows = await sql`
    SELECT k.id, k.keyword, k.domain, k.client_id, c.name AS client_name,
           k.position, k.previous_position, k.search_volume, k.difficulty,
           k.url, k.country, k.checked_at
    FROM seo_keywords k
    LEFT JOIN clients c ON c.id = k.client_id
    ORDER BY k.position
  ` as unknown as SeoKeyword[]
  return rows
})
