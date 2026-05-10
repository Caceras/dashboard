<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
import type { Client } from '~/types'
import { formatMoney, statusColor, statusLabel } from '~/utils/format'

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{ id: 'name', value: '' }])

const { data, status } = await useFetch<Client[]>('/api/clients', { lazy: true, default: () => [] })

function getRowItems(row: Row<Client>) {
  return [
    { type: 'label', label: 'Actions' },
    {
      label: 'Copy email',
      icon: 'i-lucide-copy',
      onSelect() {
        if (!row.original.email) return
        navigator.clipboard.writeText(row.original.email)
        toast.add({ title: 'Copied', description: 'Client email copied' })
      }
    },
    { type: 'separator' },
    { label: 'View projects', icon: 'i-lucide-folder-kanban' },
    { label: 'View invoices', icon: 'i-lucide-file-text' },
    { type: 'separator' },
    {
      label: 'Archive client',
      icon: 'i-lucide-archive',
      color: 'error' as const,
      onSelect() {
        toast.add({ title: 'Archived', description: `${row.original.name} moved to archive` })
      }
    }
  ]
}

const columns: TableColumn<Client>[] = [
  {
    accessorKey: 'name',
    header: 'Client',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, { src: row.original.avatar_url || undefined, alt: row.original.name, size: 'md' }),
        h('div', { class: 'min-w-0' }, [
          h('p', { class: 'font-medium text-highlighted truncate' }, row.original.name),
          h('p', { class: 'text-xs text-muted truncate' }, row.original.company || '—')
        ])
      ])
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => h('span', { class: 'text-muted text-sm' }, row.original.email || '—')
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => h('span', { class: 'text-muted text-sm' }, row.original.location || '—')
  },
  {
    accessorKey: 'hourly_rate',
    header: 'Rate',
    cell: ({ row }) =>
      h('span', { class: 'tabular-nums text-sm text-muted' },
        row.original.hourly_rate ? `${formatMoney(row.original.hourly_rate)}/h` : '—'
      )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equals',
    cell: ({ row }) =>
      h(UBadge, {
        class: 'capitalize',
        variant: 'subtle',
        color: statusColor(row.original.status)
      }, () => statusLabel(row.original.status))
  },
  {
    id: 'actions',
    cell: ({ row }) =>
      h('div', { class: 'text-right' },
        h(UDropdownMenu, { content: { align: 'end' }, items: getRowItems(row) }, () =>
          h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost', class: 'ml-auto' })
        )
      )
  }
]

const statusFilter = ref('all')

watch(() => statusFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return
  const col = table.value.tableApi.getColumn('status')
  if (!col) return
  col.setFilterValue(newVal === 'all' ? undefined : newVal)
})

const search = computed({
  get: (): string => (table.value?.tableApi?.getColumn('name')?.getFilterValue() as string) || '',
  set: (value: string) => {
    table.value?.tableApi?.getColumn('name')?.setFilterValue(value || undefined)
  }
})

const pagination = ref({ pageIndex: 0, pageSize: 10 })
</script>

<template>
  <UDashboardPanel id="clients">
    <template #header>
      <UDashboardNavbar title="Clients">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-user-plus" label="New client" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput v-model="search" class="max-w-sm" icon="i-lucide-search" placeholder="Filter clients" />

        <USelect
          v-model="statusFilter"
          :items="[
            { label: 'All statuses', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Paused', value: 'paused' },
            { label: 'Prospect', value: 'prospect' },
            { label: 'Archived', value: 'archived' }
          ]"
          :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
          placeholder="Filter status"
          class="min-w-32"
        />
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        class="shrink-0"
        :data="data"
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

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} client(s)
        </div>
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
