<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { CalendarEvent, Project, Tool, Expense, SeoKeyword } from '~/types'
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
}]] satisfies DropdownMenuItem[][]

// Parallel fetch — every Today block depends on a different domain.
const { data: events }   = await useFetch<CalendarEvent[]>('/api/events',       { default: () => [] })
const { data: projects } = await useFetch<Project[]>      ('/api/projects',     { default: () => [] })
const { data: tools }    = await useFetch<Tool[]>         ('/api/tools',        { default: () => [] })
const { data: expenses } = await useFetch<Expense[]>      ('/api/expenses',     { default: () => [] })
const { data: keywords } = await useFetch<SeoKeyword[]>   ('/api/seo-keywords', { default: () => [] })

const todayEvents = computed(() => {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end = new Date();   end.setHours(23, 59, 59, 999)
  return events.value
    .filter(e => new Date(e.starts_at) >= start && new Date(e.starts_at) <= end)
    .slice(0, 6)
})

const dueProjects = computed(() => projects.value
  .filter(p => p.status === 'in_progress' || p.status === 'review')
  .slice(0, 5))

const upcomingRenewals = computed(() => tools.value
  .filter(t => t.renews_on)
  .slice(0, 4))

// Finance pulse — month-to-date.
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

const seoMovers = computed(() => {
  // Largest absolute rank movements first.
  return [...keywords.value]
    .sort((a, b) =>
      Math.abs((b.previous_position - b.position)) - Math.abs((a.previous_position - a.position))
    )
    .slice(0, 5)
})

function moveDelta(k: SeoKeyword) {
  return k.previous_position - k.position
}

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
          {{ todayEvents.length }} event{{ todayEvents.length === 1 ? '' : 's' }} today &middot;
          {{ dueProjects.length }} active project{{ dueProjects.length === 1 ? '' : 's' }}.
        </p>
      </div>

      <!-- Finance pulse -->
      <UPageGrid class="lg:grid-cols-3 gap-px rounded-lg overflow-hidden ring ring-default">
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Active project budget</p>
          <p class="text-2xl font-semibold text-highlighted mt-2">{{ formatMoney(activeProjectBudget) }}</p>
          <p class="text-xs text-muted mt-1">Across {{ dueProjects.length }} live projects</p>
        </div>
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Tool spend / month</p>
          <p class="text-2xl font-semibold text-highlighted mt-2">{{ formatMoney(mtdToolSpend) }}</p>
          <p class="text-xs text-muted mt-1">{{ tools.filter(t => t.status === 'active').length }} active subscriptions</p>
        </div>
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Expenses MTD</p>
          <p class="text-2xl font-semibold text-highlighted mt-2">{{ formatMoney(mtdExpenses) }}</p>
          <p class="text-xs text-muted mt-1">{{ expenses.filter(e => new Date(e.occurred_on) >= mtdRange).length }} entries this month</p>
        </div>
      </UPageGrid>

      <!-- Two-column secondary surface -->
      <div class="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <UCard :ui="{ root: 'overflow-hidden', body: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-medium text-highlighted">Agenda</h2>
              <ULink to="/calendar" class="text-xs text-muted hover:text-default">Open calendar</ULink>
            </div>
          </template>

          <div v-if="todayEvents.length === 0" class="p-6 text-sm text-muted text-center">
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

        <UCard :ui="{ root: 'overflow-hidden', body: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-medium text-highlighted">In progress</h2>
              <ULink to="/projects" class="text-xs text-muted hover:text-default">All projects</ULink>
            </div>
          </template>

          <div v-if="dueProjects.length === 0" class="p-6 text-sm text-muted text-center">
            No active projects.
          </div>

          <ul v-else class="divide-y divide-default">
            <li v-for="project in dueProjects" :key="project.id" class="px-5 py-3">
              <div class="flex items-center justify-between gap-3 mb-1.5">
                <p class="text-sm text-highlighted font-medium truncate">{{ project.name }}</p>
                <span
                  class="text-xs tabular-nums shrink-0"
                  :class="(daysUntil(project.deadline) ?? 99) < 0 ? 'text-error' : 'text-muted'"
                >
                  {{ relativeDeadline(project.deadline) }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <UProgress :model-value="project.progress" size="xs" class="flex-1" />
                <span class="text-xs text-muted tabular-nums w-10 text-right">{{ project.progress }}%</span>
              </div>
              <p class="text-xs text-muted mt-1 truncate">
                {{ project.client_name || 'Internal' }} &middot; <span class="capitalize">{{ statusLabel(project.status) }}</span>
              </p>
            </li>
          </ul>
        </UCard>
      </div>

      <!-- SEO movers + renewals -->
      <div class="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <UCard :ui="{ root: 'overflow-hidden', body: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-medium text-highlighted">SEO movers</h2>
              <ULink to="/seo" class="text-xs text-muted hover:text-default">SEO dashboard</ULink>
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
              <ULink to="/tools" class="text-xs text-muted hover:text-default">All tools</ULink>
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
