import type { Project } from '~/types'

export default defineEventHandler(async (): Promise<Project[]> => {
  const sql = useDb()
  const rows = await sql`
    SELECT p.id, p.name, p.client_id, c.name AS client_name,
           p.status, p.priority, p.progress, p.budget,
           p.deadline, p.started_at, p.finished_at,
           p.description, p.created_at, p.updated_at
    FROM projects p
    LEFT JOIN clients c ON c.id = p.client_id
    ORDER BY
      CASE p.status
        WHEN 'in_progress' THEN 0
        WHEN 'review'      THEN 1
        WHEN 'planned'     THEN 2
        WHEN 'blocked'     THEN 3
        WHEN 'done'        THEN 4
      END,
      p.deadline NULLS LAST
  ` as unknown as Project[]
  return rows
})
