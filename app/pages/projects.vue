<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Project } from '~/types'
import { formatMoney, formatDate, relativeDeadline, daysUntil, statusColor, statusLabel } from '~/utils/format'

const UBadge = resolveComponent('UBadge')

const { data, status } = await useFetch<Project[]>('/api/projects', { default: () => [] })

const tab = ref<'all' | 'active' | 'planned' | 'done'>('active')

const filtered = computed(() => {
  if (tab.value === 'active') {
    return data.value.filter(p => p.status === 'in_progress' || p.status === 'review' || p.status === 'blocked')
  }
  if (tab.value === 'planned') return data.value.filter(p => p.status === 'planned')
  if (tab.value === 'done')    return data.value.filter(p => p.status === 'done')
  return data.value
})

const columns: TableColumn<Project>[] = [
  {
    accessorKey: 'name',
    header: 'Project',
    cell: ({ row }) =>
      h('div', { class: 'min-w-0' }, [
        h('p', { class: 'font-medium text-highlighted truncate' }, row.original.name),
        h('p', { class: 'text-xs text-muted truncate' }, row.original.client_name || 'Internal')
      ])
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(UBadge, {
        class: 'capitalize',
        variant: 'subtle',
        color: statusColor(row.original.status)
      }, () => statusLabel(row.original.status))
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) =>
      h(UBadge, {
        class: 'capitalize',
        variant: 'soft',
        color: row.original.priority === 'high' ? 'error' : row.original.priority === 'medium' ? 'warning' : 'neutral'
      }, () => row.original.priority)
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2 max-w-[160px]' }, [
        h('div', { class: 'flex-1 h-1.5 rounded-full bg-elevated overflow-hidden' }, [
          h('div', {
            class: row.original.status === 'done' ? 'h-full bg-success' : 'h-full bg-primary',
            style: `width: ${row.original.progress}%`
          })
        ]),
        h('span', { class: 'tabular-nums text-xs text-muted w-9 text-right' }, `${row.original.progress}%`)
      ])
  },
  {
    accessorKey: 'budget',
    header: 'Budget',
    cell: ({ row }) => h('span', { class: 'tabular-nums text-muted text-sm' }, formatMoney(row.original.budget))
  },
  {
    accessorKey: 'deadline',
    header: 'Deadline',
    cell: ({ row }) => {
      const overdue = (daysUntil(row.original.deadline) ?? 99) < 0 && row.original.status !== 'done'
      return h('div', undefined, [
        h('p', { class: 'text-sm tabular-nums', style: overdue ? 'color: var(--ui-error)' : '' }, formatDate(row.original.deadline)),
        h('p', { class: 'text-xs text-muted' }, relativeDeadline(row.original.deadline))
      ])
    }
  }
]

const pagination = ref({ pageIndex: 0, pageSize: 12 })

const counts = computed(() => ({
  all:     data.value.length,
  active:  data.value.filter(p => p.status === 'in_progress' || p.status === 'review' || p.status === 'blocked').length,
  planned: data.value.filter(p => p.status === 'planned').length,
  done:    data.value.filter(p => p.status === 'done').length
}))
</script>

<template>
  <UDashboardPanel id="projects">
    <template #header>
      <UDashboardNavbar title="Projects">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" label="New project" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTabs
        v-model="tab"
        :items="[
          { label: `All (${counts.all})`, value: 'all' },
          { label: `Active (${counts.active})`, value: 'active' },
          { label: `Planned (${counts.planned})`, value: 'planned' },
          { label: `Done (${counts.done})`, value: 'done' }
        ]"
        :content="false"
        size="sm"
        class="self-start"
      />

      <UTable
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="filtered"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      />
    </template>
  </UDashboardPanel>
</template>
