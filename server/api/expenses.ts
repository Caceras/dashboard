import type { Expense } from '~/types'

export default defineEventHandler(async (): Promise<Expense[]> => {
  const sql = useDb()
  const rows = await sql`
    SELECT e.id, e.description, e.amount, e.currency, e.category, e.vendor,
           e.project_id, e.client_id, c.name AS client_name, p.name AS project_name,
           e.billable, e.reimbursed, e.occurred_on, e.receipt_url, e.notes, e.created_at
    FROM expenses e
    LEFT JOIN clients  c ON c.id = e.client_id
    LEFT JOIN projects p ON p.id = e.project_id
    ORDER BY e.occurred_on DESC, e.id DESC
  ` as unknown as Expense[]
  return rows
})
