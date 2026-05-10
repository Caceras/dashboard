<script setup lang="ts">
import type { Tool } from '~/types'
import { formatMoney, formatDate, relativeDeadline, daysUntil } from '~/utils/format'

const { data: tools } = await useFetch<Tool[]>('/api/tools', { default: () => [] })

const search = ref('')
const filterCategory = ref('all')

const categories = computed(() => {
  const set = new Set(tools.value.map(t => t.category))
  return [{ label: 'All categories', value: 'all' }, ...Array.from(set).map(c => ({ label: c, value: c }))]
})

const filtered = computed(() =>
  tools.value.filter(t =>
    (filterCategory.value === 'all' || t.category === filterCategory.value)
    && (!search.value
        || t.name.toLowerCase().includes(search.value.toLowerCase())
        || (t.vendor || '').toLowerCase().includes(search.value.toLowerCase()))
  )
)

// Annual run-rate: monthly * 12 + yearly * 1. One-time excluded.
const annualSpend = computed(() =>
  tools.value
    .filter(t => t.status === 'active')
    .reduce((sum, t) => sum + Number(t.cost) * (t.billing_cycle === 'monthly' ? 12 : t.billing_cycle === 'yearly' ? 1 : 0), 0)
)

const monthlySpend = computed(() =>
  tools.value
    .filter(t => t.status === 'active' && t.billing_cycle === 'monthly')
    .reduce((sum, t) => sum + Number(t.cost), 0)
)

const renewingThisMonth = computed(() =>
  tools.value.filter(t => {
    const d = daysUntil(t.renews_on)
    return d !== null && d >= 0 && d <= 30
  }).length
)

const categoryIcon: Record<string, string> = {
  seo: 'i-lucide-trending-up',
  design: 'i-lucide-palette',
  project: 'i-lucide-folder-kanban',
  hosting: 'i-lucide-cloud',
  docs: 'i-lucide-file-text',
  video: 'i-lucide-video',
  infra: 'i-lucide-server',
  security: 'i-lucide-shield',
  email: 'i-lucide-mail',
  finance: 'i-lucide-credit-card',
  other: 'i-lucide-toy-brick'
}
</script>

<template>
  <UDashboardPanel id="tools">
    <template #header>
      <UDashboardNavbar title="Tools">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" label="Add tool" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Spend pulse (primary surface) -->
      <UPageGrid class="lg:grid-cols-3 gap-px rounded-lg overflow-hidden ring ring-default">
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Monthly subscriptions</p>
          <p class="text-2xl font-semibold text-highlighted mt-2">{{ formatMoney(monthlySpend) }}</p>
          <p class="text-xs text-muted mt-1">Recurring this month</p>
        </div>
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Annual run-rate</p>
          <p class="text-2xl font-semibold text-highlighted mt-2">{{ formatMoney(annualSpend) }}</p>
          <p class="text-xs text-muted mt-1">All active tools</p>
        </div>
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Renewing soon</p>
          <p class="text-2xl font-semibold text-highlighted mt-2 tabular-nums">{{ renewingThisMonth }}</p>
          <p class="text-xs text-muted mt-1">Within 30 days</p>
        </div>
      </UPageGrid>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Filter by name or vendor" class="max-w-sm" />
        <USelect v-model="filterCategory" :items="categories" class="min-w-40" />
      </div>

      <!-- Card grid -->
      <UPageGrid class="md:grid-cols-2 lg:grid-cols-3 gap-3">
        <UCard
          v-for="tool in filtered"
          :key="tool.id"
          :ui="{ root: 'transition-shadow hover:ring-accented' }"
        >
          <div class="flex items-start gap-3">
            <div class="size-9 rounded-md bg-elevated flex items-center justify-center shrink-0">
              <UIcon :name="categoryIcon[tool.category] || 'i-lucide-toy-brick'" class="size-4 text-muted" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-highlighted truncate">{{ tool.name }}</p>
              <p class="text-xs text-muted truncate capitalize">{{ tool.category }} &middot; {{ tool.plan || tool.billing_cycle }}</p>
            </div>
            <UBadge
              :color="tool.status === 'active' ? 'success' : tool.status === 'trial' ? 'info' : 'error'"
              variant="subtle"
              class="capitalize"
            >
              {{ tool.status }}
            </UBadge>
          </div>

          <div class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-default">
            <div>
              <p class="text-xs text-muted">Cost</p>
              <p class="text-sm tabular-nums text-highlighted mt-0.5">
                {{ formatMoney(tool.cost, tool.currency) }}
                <span class="text-xs text-muted font-normal">/ {{ tool.billing_cycle === 'one_time' ? 'once' : tool.billing_cycle.replace('ly','') }}</span>
              </p>
            </div>
            <div>
              <p class="text-xs text-muted">Renews</p>
              <p
                class="text-sm tabular-nums mt-0.5"
                :class="(daysUntil(tool.renews_on) ?? 99) <= 7 ? 'text-warning' : 'text-highlighted'"
              >
                {{ tool.renews_on ? formatDate(tool.renews_on) : '—' }}
              </p>
              <p v-if="tool.renews_on" class="text-xs text-muted">{{ relativeDeadline(tool.renews_on) }}</p>
            </div>
          </div>
        </UCard>
      </UPageGrid>

      <p v-if="filtered.length === 0" class="text-sm text-muted text-center py-8">No tools match your filters.</p>
    </template>
  </UDashboardPanel>
</template>
