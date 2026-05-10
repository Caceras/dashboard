<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { SeoKeyword, SeoAudit } from '~/types'
import { formatDate } from '~/utils/format'

const UBadge = resolveComponent('UBadge')

const { data: keywords, status: kwStatus } = await useFetch<SeoKeyword[]>('/api/seo-keywords', { default: () => [] })
const { data: audits } = await useFetch<SeoAudit[]>('/api/seo-audits', { default: () => [] })

const search = ref('')
const filteredKeywords = computed(() =>
  keywords.value.filter(k =>
    !search.value
    || k.keyword.toLowerCase().includes(search.value.toLowerCase())
    || k.domain.toLowerCase().includes(search.value.toLowerCase())
  )
)

const columns: TableColumn<SeoKeyword>[] = [
  {
    accessorKey: 'keyword',
    header: 'Keyword',
    cell: ({ row }) =>
      h('div', { class: 'min-w-0' }, [
        h('p', { class: 'font-medium text-highlighted truncate' }, row.original.keyword),
        h('p', { class: 'text-xs text-muted truncate' }, row.original.domain)
      ])
  },
  {
    accessorKey: 'position',
    header: 'Rank',
    cell: ({ row }) => h('span', { class: 'tabular-nums text-highlighted' }, `#${row.original.position}`)
  },
  {
    id: 'change',
    header: 'Change',
    cell: ({ row }) => {
      const delta = row.original.previous_position - row.original.position
      const color = delta > 0 ? 'success' : delta < 0 ? 'error' : 'neutral'
      const label = delta === 0 ? '0' : `${delta > 0 ? '+' : ''}${delta}`
      return h(UBadge, { color, variant: 'subtle', class: 'tabular-nums w-14 justify-center' }, () => label)
    }
  },
  {
    accessorKey: 'search_volume',
    header: 'Volume',
    cell: ({ row }) => h('span', { class: 'tabular-nums text-muted' }, row.original.search_volume.toLocaleString())
  },
  {
    accessorKey: 'difficulty',
    header: 'Difficulty',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2 max-w-[140px]' }, [
        h('div', { class: 'flex-1 h-1.5 rounded-full bg-elevated overflow-hidden' }, [
          h('div', {
            class: 'h-full bg-primary',
            style: `width: ${row.original.difficulty}%`
          })
        ]),
        h('span', { class: 'tabular-nums text-xs text-muted w-7 text-right' }, row.original.difficulty)
      ])
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ row }) => h('span', { class: 'text-muted text-xs' }, row.original.country)
  },
  {
    accessorKey: 'checked_at',
    header: 'Checked',
    cell: ({ row }) => h('span', { class: 'text-muted text-xs' }, formatDate(row.original.checked_at))
  }
]

const pagination = ref({ pageIndex: 0, pageSize: 10 })

// Aggregate metrics
const avgScore = computed(() => {
  if (!audits.value.length) return 0
  return Math.round(audits.value.reduce((s, a) => s + a.score, 0) / audits.value.length)
})
const totalIssues = computed(() => audits.value.reduce((s, a) => s + a.issues, 0))
const risingCount = computed(() =>
  keywords.value.filter(k => k.previous_position - k.position > 0).length
)

function scoreColor(score: number) {
  if (score >= 85) return 'text-success'
  if (score >= 65) return 'text-warning'
  return 'text-error'
}
</script>

<template>
  <UDashboardPanel id="seo">
    <template #header>
      <UDashboardNavbar title="SEO">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" label="Track keyword" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Audit cards (primary surface) -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-medium text-highlighted">Site audits</h2>
          <p class="text-xs text-muted">Avg score {{ avgScore }} &middot; {{ totalIssues }} open issues</p>
        </div>

        <UPageGrid class="md:grid-cols-2 lg:grid-cols-3 gap-3">
          <UCard
            v-for="audit in audits"
            :key="audit.id"
            :ui="{ root: 'hover:ring-accented transition-shadow' }"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-medium text-highlighted truncate">{{ audit.domain }}</p>
                <p class="text-xs text-muted truncate">{{ audit.client_name || '—' }}</p>
              </div>
              <p class="text-2xl font-semibold tabular-nums" :class="scoreColor(audit.score)">
                {{ audit.score }}
              </p>
            </div>

            <div class="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-default text-center">
              <div>
                <p class="text-xs text-muted">Perf</p>
                <p class="text-sm tabular-nums text-highlighted mt-0.5">{{ audit.performance }}</p>
              </div>
              <div>
                <p class="text-xs text-muted">A11y</p>
                <p class="text-sm tabular-nums text-highlighted mt-0.5">{{ audit.accessibility }}</p>
              </div>
              <div>
                <p class="text-xs text-muted">Best</p>
                <p class="text-sm tabular-nums text-highlighted mt-0.5">{{ audit.best_practices }}</p>
              </div>
              <div>
                <p class="text-xs text-muted">SEO</p>
                <p class="text-sm tabular-nums text-highlighted mt-0.5">{{ audit.seo }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between mt-4 text-xs">
              <span class="text-muted">{{ formatDate(audit.audited_at) }}</span>
              <UBadge
                :color="audit.issues > 15 ? 'error' : audit.issues > 5 ? 'warning' : 'success'"
                variant="subtle"
              >
                {{ audit.issues }} issues
              </UBadge>
            </div>
          </UCard>
        </UPageGrid>
      </div>

      <!-- Keyword table (secondary surface) -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2 class="font-medium text-highlighted">Keywords</h2>
          <p class="text-xs text-muted">{{ risingCount }} rising &middot; {{ keywords.length }} tracked</p>
        </div>

        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Filter by keyword or domain"
          class="max-w-sm"
        />

        <UTable
          v-model:pagination="pagination"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
          :data="filteredKeywords"
          :columns="columns"
          :loading="kwStatus === 'pending'"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'h-0'
          }"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
