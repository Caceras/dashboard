<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { CalendarEvent, Project, Tool, Expense, SeoKeyword, ProjectStatus } from '~/types'
import { formatMoney, formatTime, relativeDeadline, daysUntil, statusLabel } from '~/utils/format'

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'New project',
  icon: 'i-lucide-folder-plus',
  to: '/projects'
}, {
  label: 'Log expense',
  icon: 'i-lucide-receipt',
  to: '/expenses'
}, {
  label: 'Add client',
  icon: 'i-lucide-user-plus',
  to: '/clients'
}, {
  label: 'Schedule event',
  icon: 'i-lucide-calendar-plus',
  to: '/calendar'
}]] satisfies DropdownMenuItem[][]

// Parallel fetch — every Today block depends on a different domain.
const { data: events }   = await useFetch<CalendarEvent[]>('/api/events',       { default: () => [] })
const { data: projects } = await useFetch<Project[]>      ('/api/projects',     { default: () => [] })
const { data: tools }    = await useFetch<Tool[]>         ('/api/tools',        { default: () => [] })
const { data: expenses } = await useFetch<Expense[]>      ('/api/expenses',     { default: () => [] })
const { data: keywords } = await useFetch<SeoKeyword[]>   ('/api/seo-keywords', { default: () => [] })

// ── Pipeline (hero) ───────────────────────────────────────────────────────────
const pipelineOrder: { status: ProjectStatus, label: string, icon: string }[] = [
  { status: 'planned',     label: 'Planned',     icon: 'i-lucide-circle-dashed' },
  { status: 'in_progress', label: 'In progress', icon: 'i-lucide-loader' },
  { status: 'review',      label: 'Review',      icon: 'i-lucide-eye' },
  { status: 'blocked',     label: 'Blocked',     icon: 'i-lucide-octagon-alert' },
  { status: 'done',        label: 'Done',        icon: 'i-lucide-check' }
]

const pipeline = computed(() =>
  pipelineOrder.map(({ status, label, icon }) => {
    const list = projects.value.filter(p => p.status === status)
    const budget = list.reduce((s, p) => s + (Number(p.budget) || 0), 0)
    return { status, label, icon, count: list.length, budget }
  })
)

const pipelineTotal = computed(() => projects.value.length)

// At-risk: blocked, overdue, or deadline ≤7d with progress <60%, excluding done.
const atRisk = computed(() =>
  projects.value
    .filter((p) => {
      if (p.status === 'done') return false
      if (p.status === 'blocked') return true
      const d = daysUntil(p.deadline)
      if (d === null) return false
      if (d < 0) return true
      if (d <= 7 && p.progress < 60) return true
      return false
    })
    .sort((a, b) => (daysUntil(a.deadline) ?? 999) - (daysUntil(b.deadline) ?? 999))
    .slice(0, 5)
)

function riskReason(p: Project): { label: string, color: 'error' | 'warning' } {
  if (p.status === 'blocked') return { label: 'Blocked', color: 'error' }
  const d = daysUntil(p.deadline) ?? 999
  if (d < 0) return { label: `${Math.abs(d)}d overdue`, color: 'error' }
  return { label: `Due in ${d}d`, color: 'warning' }
}

// ── Agenda ────────────────────────────────────────────────────────────────────
const todayEvents = computed(() => {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end = new Date();   end.setHours(23, 59, 59, 999)
  return events.value
    .filter(e => new Date(e.starts_at) >= start && new Date(e.starts_at) <= end)
    .slice(0, 6)
})

// ── Finance pulse (MTD) ───────────────────────────────────────────────────────
const mtdRange = computed(() => {
  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0)
  return start
})
const mtdExpenses = computed(() => expenses.value
  .filter(e => new Date(e.occurred_on) >= mtdRange.value)
  .reduce((sum, e) => sum + Number(e.amount), 0))
const mtdToolSpend = computed(() => tools.value
  .filter(t => t.billing_cycle === 'monthly' && t.status === 'active')
  .reduce((sum, t) => sum + Number(t.cost), 0))
const activeProjectBudget = computed(() => projects.value
  .filter(p => p.status === 'in_progress' || p.status === 'review')
  .reduce((sum, p) => sum + (Number(p.budget) || 0), 0))

// ── SEO movers ────────────────────────────────────────────────────────────────
const seoMovers = computed(() =>
  [...keywords.value]
    .sort((a, b) =>
      Math.abs(b.previous_position - b.position) - Math.abs(a.previous_position - a.position)
    )
    .slice(0, 5)
)
function moveDelta(k: SeoKeyword) { return k.previous_position - k.position }

// ── Renewals ──────────────────────────────────────────────────────────────────
const upcomingRenewals = computed(() =>
  tools.value
    .filter(t => t.renews_on)
    .sort((a, b) => (daysUntil(a.renews_on) ?? 999) - (daysUntil(b.renews_on) ?? 999))
    .slice(0, 4)
)

// ── Greeting ──────────────────────────────────────────────────────────────────
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 5)  return 'Late night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric'
})

function pipelineAccent(status: ProjectStatus) {
  switch (status) {
    case 'in_progress': return 'text-primary'
    case 'review':      return 'text-info'
    case 'blocked':     return 'text-error'
    case 'done':        return 'text-success'
    default:            return 'text-muted'
  }
}
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Today" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Greeting strip -->
      <div class="flex flex-col gap-1">
        <p class="text-sm text-muted">{{ todayLabel }}</p>
        <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-highlighted text-balance">
          {{ greeting }}, Caceras.
        </h1>
        <p class="text-sm text-muted">
          {{ pipelineTotal }} projects in pipeline &middot; {{ todayEvents.length }} event{{ todayEvents.length === 1 ? '' : 's' }} today.
        </p>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════
           HERO — Projects pipeline
           ═══════════════════════════════════════════════════════════════════ -->
      <UCard :ui="{ root: 'overflow-hidden', body: 'p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-medium text-highlighted">Pipeline</h2>
              <p class="text-xs text-muted mt-0.5">Project flow across {{ pipelineTotal }} projects</p>
            </div>
            <ULink to="/projects" class="text-xs text-muted hover:text-default">All projects →</ULink>
          </div>
        </template>

        <!-- Status ribbon -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-default border-t border-default">
          <NuxtLink
            v-for="col in pipeline"
            :key="col.status"
            to="/projects"
            class="px-5 py-4 hover:bg-elevated/40 transition-colors group"
          >
            <div class="flex items-center gap-2">
              <UIcon :name="col.icon" class="size-4 shrink-0" :class="pipelineAccent(col.status)" />
              <p class="text-xs uppercase tracking-wide text-muted">{{ col.label }}</p>
            </div>
            <p class="text-3xl font-semibold tabular-nums text-highlighted mt-2">{{ col.count }}</p>
            <p class="text-xs text-muted mt-1 tabular-nums">
              {{ col.budget > 0 ? formatMoney(col.budget) : '—' }}
            </p>
          </NuxtLink>
        </div>

        <!-- At-risk panel -->
        <div class="border-t border-default px-5 py-4 bg-elevated/20">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-lucide-triangle-alert" class="size-4 text-warning" />
            <h3 class="text-sm font-medium text-highlighted">Needs attention</h3>
            <span class="text-xs text-muted">&middot; {{ atRisk.length }} project{{ atRisk.length === 1 ? '' : 's' }}</span>
          </div>

          <div v-if="atRisk.length === 0" class="text-sm text-muted py-4 text-center">
            Nothing at risk. The pipeline is healthy.
          </div>

          <ul v-else class="flex flex-col gap-2">
            <li
              v-for="project in atRisk"
              :key="project.id"
              class="flex items-center gap-3 rounded-md bg-default ring ring-default px-3 py-2.5"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium text-highlighted truncate">{{ project.name }}</p>
                  <UBadge variant="subtle" color="neutral" class="capitalize text-xs shrink-0">
                    {{ statusLabel(project.status) }}
                  </UBadge>
                </div>
                <p class="text-xs text-muted truncate mt-0.5">
                  {{ project.client_name || 'Internal' }} &middot; {{ project.progress }}% complete
                </p>
              </div>
              <UBadge :color="riskReason(project).color" variant="subtle" class="shrink-0 tabular-nums">
                {{ riskReason(project).label }}
              </UBadge>
            </li>
          </ul>
        </div>
      </UCard>

      <!-- ═══════════════════════════════════════════════════════════════════
           Secondary — Agenda + Finance pulse
           ═══════════════════════════════════════════════════════════════════ -->
      <div class="grid lg:grid-cols-[1fr_auto] gap-4 sm:gap-6">
        <UCard :ui="{ root: 'overflow-hidden', body: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-medium text-highlighted">Agenda</h2>
              <ULink to="/calendar" class="text-xs text-muted hover:text-default">Open calendar →</ULink>
            </div>
          </template>

          <div v-if="todayEvents.length === 0" class="p-8 text-sm text-muted text-center">
            Nothing scheduled today. Take it easy.
          </div>

          <ul v-else class="divide-y divide-default">
            <li v-for="event in todayEvents" :key="event.id" class="flex items-start gap-3 px-5 py-3">
              <div class="text-xs text-muted w-16 shrink-0 pt-0.5 tabular-nums">
                {{ formatTime(event.starts_at) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-highlighted font-medium truncate">{{ event.title }}</p>
                <p class="text-xs text-muted truncate">
                  <span class="capitalize">{{ event.kind }}</span>
                  <template v-if="event.client_name"> &middot; {{ event.client_name }}</template>
                  <template v-if="event.location"> &middot; {{ event.location }}</template>
                </p>
              </div>
              <UBadge variant="subtle" color="neutral" class="capitalize">{{ event.kind }}</UBadge>
            </li>
          </ul>
        </UCard>

        <div class="flex flex-col gap-3 lg:w-72">
          <UCard :ui="{ body: 'p-4' }">
            <p class="text-xs uppercase tracking-wide text-muted">Active project budget</p>
            <p class="text-2xl font-semibold text-highlighted mt-2 tabular-nums">{{ formatMoney(activeProjectBudget) }}</p>
            <p class="text-xs text-muted mt-1">In-progress &amp; review</p>
          </UCard>
          <UCard :ui="{ body: 'p-4' }">
            <p class="text-xs uppercase tracking-wide text-muted">Tool spend / month</p>
            <p class="text-2xl font-semibold text-highlighted mt-2 tabular-nums">{{ formatMoney(mtdToolSpend) }}</p>
            <p class="text-xs text-muted mt-1">{{ tools.filter(t => t.status === 'active').length }} active subscriptions</p>
          </UCard>
          <UCard :ui="{ body: 'p-4' }">
            <p class="text-xs uppercase tracking-wide text-muted">Expenses MTD</p>
            <p class="text-2xl font-semibold text-highlighted mt-2 tabular-nums">{{ formatMoney(mtdExpenses) }}</p>
            <p class="text-xs text-muted mt-1">{{ expenses.filter(e => new Date(e.occurred_on) >= mtdRange).length }} entries</p>
          </UCard>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════
           Tertiary — SEO movers + Renewals
           ═══════════════════════════════════════════════════════════════════ -->
      <div class="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <UCard :ui="{ root: 'overflow-hidden', body: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-medium text-highlighted">SEO movers</h2>
              <ULink to="/seo" class="text-xs text-muted hover:text-default">SEO dashboard →</ULink>
            </div>
          </template>

          <ul class="divide-y divide-default">
            <li v-for="k in seoMovers" :key="k.id" class="px-5 py-3 flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm text-highlighted truncate">{{ k.keyword }}</p>
                <p class="text-xs text-muted truncate">{{ k.domain }}</p>
              </div>
              <span class="text-xs text-muted tabular-nums">#{{ k.position }}</span>
              <UBadge
                :color="moveDelta(k) > 0 ? 'success' : moveDelta(k) < 0 ? 'error' : 'neutral'"
                variant="subtle"
                class="tabular-nums w-14 justify-center"
              >
                {{ moveDelta(k) > 0 ? '+' : '' }}{{ moveDelta(k) }}
              </UBadge>
            </li>
          </ul>
        </UCard>

        <UCard :ui="{ root: 'overflow-hidden', body: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-medium text-highlighted">Upcoming renewals</h2>
              <ULink to="/tools" class="text-xs text-muted hover:text-default">All tools →</ULink>
            </div>
          </template>

          <ul class="divide-y divide-default">
            <li v-for="tool in upcomingRenewals" :key="tool.id" class="px-5 py-3 flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm text-highlighted font-medium truncate">{{ tool.name }}</p>
                <p class="text-xs text-muted truncate capitalize">{{ tool.category }} &middot; {{ tool.plan || tool.billing_cycle }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-highlighted tabular-nums">{{ formatMoney(tool.cost, tool.currency) }}</p>
                <p
                  class="text-xs tabular-nums"
                  :class="(daysUntil(tool.renews_on) ?? 99) <= 7 ? 'text-warning' : 'text-muted'"
                >
                  {{ relativeDeadline(tool.renews_on) }}
                </p>
              </div>
            </li>
          </ul>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
