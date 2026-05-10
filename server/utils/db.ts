import { neon } from '@neondatabase/serverless'

let _sql: ReturnType<typeof neon> | null = null

export function useDb() {
  if (_sql) return _sql

  const url = process.env.DATABASE_URL
  if (!url) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DATABASE_URL is not set'
    })
  }

  _sql = neon(url)
  return _sql
}
