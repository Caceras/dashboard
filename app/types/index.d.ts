import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

// ── Works domain ──────────────────────────────────────────────────────────────

export type ClientStatus = 'active' | 'paused' | 'archived' | 'prospect'

export interface Client {
  id: number
  name: string
  company: string | null
  email: string | null
  status: ClientStatus
  avatar_url: string | null
  location: string | null
  hourly_rate: number | string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export type ProjectStatus = 'planned' | 'in_progress' | 'review' | 'done' | 'blocked'
export type ProjectPriority = 'low' | 'medium' | 'high'

export interface Project {
  id: number
  name: string
  client_id: number | null
  client_name?: string | null
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  budget: number | string | null
  deadline: string | null
  started_at: string | null
  finished_at: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export type BillingCycle = 'monthly' | 'yearly' | 'one_time'
export type ToolStatus = 'active' | 'trial' | 'cancelled'

export interface Tool {
  id: number
  name: string
  category: string
  vendor: string | null
  plan: string | null
  billing_cycle: BillingCycle
  cost: number | string
  currency: string
  renews_on: string | null
  owner: string | null
  status: ToolStatus
  website: string | null
  notes: string | null
  created_at: string
}

export interface Expense {
  id: number
  description: string
  amount: number | string
  currency: string
  category: string
  vendor: string | null
  project_id: number | null
  client_id: number | null
  client_name?: string | null
  project_name?: string | null
  billable: boolean
  reimbursed: boolean
  occurred_on: string
  receipt_url: string | null
  notes: string | null
  created_at: string
}

export type EventKind = 'meeting' | 'focus' | 'deadline' | 'review' | 'other'

export interface CalendarEvent {
  id: number
  title: string
  description: string | null
  kind: EventKind
  starts_at: string
  ends_at: string
  all_day: boolean
  location: string | null
  project_id: number | null
  client_id: number | null
  client_name?: string | null
  project_name?: string | null
}

export interface SeoKeyword {
  id: number
  keyword: string
  domain: string
  client_id: number | null
  client_name?: string | null
  position: number
  previous_position: number
  search_volume: number
  difficulty: number
  url: string | null
  country: string
  checked_at: string
}

export interface SeoAudit {
  id: number
  domain: string
  client_id: number | null
  client_name?: string | null
  score: number
  performance: number
  accessibility: number
  best_practices: number
  seo: number
  issues: number
  audited_at: string
}
