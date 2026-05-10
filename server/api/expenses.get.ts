import { neon } from '@neondatabase/serverless'
import type { Expense } from '~/types'

const sql = neon(process.env.DATABASE_URL!)

// Joins clients + projects so the table can render names without N+1.
export default defineEventHandler(async (): Promise<Expense[]> => {
  const rows = await sql`
    SELECT
      e.id, e.description, e.amount, e.currency, e.category, e.vendor,
      e.project_id, e.client_id,
      c.name AS client_name,
      p.name AS project_name,
      e.billable, e.reimbursed, e.occurred_on,
      e.receipt_url, e.notes, e.created_at
    FROM expenses e
    LEFT JOIN clients  c ON c.id = e.client_id
    LEFT JOIN projects p ON p.id = e.project_id
    ORDER BY e.occurred_on DESC, e.id DESC
  `
  return rows as Expense[]
})
