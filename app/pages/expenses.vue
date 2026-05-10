<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Expense } from '~/types'
import { formatMoney, formatDate } from '~/utils/format'

const UBadge = resolveComponent('UBadge')

const { data, status } = await useFetch<Expense[]>('/api/expenses', { default: () => [] })

// MTD pulse
const mtdStart = computed(() => {
  const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0)
  return d
})

const mtdTotal = computed(() =>
  data.value.filter(e => new Date(e.occurred_on) >= mtdStart.value)
    .reduce((sum, e) => sum + Number(e.amount), 0)
)
const mtdBillable = computed(() =>
  data.value
    .filter(e => new Date(e.occurred_on) >= mtdStart.value && e.billable)
    .reduce((sum, e) => sum + Number(e.amount), 0)
)
const mtdReimbursable = computed(() =>
  data.value
    .filter(e => new Date(e.occurred_on) >= mtdStart.value && e.billable && !e.reimbursed)
    .reduce((sum, e) => sum + Number(e.amount), 0)
)

const columns: TableColumn<Expense>[] = [
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) =>
      h('div', { class: 'min-w-0' }, [
        h('p', { class: 'font-medium text-highlighted truncate' }, row.original.description),
        h('p', { class: 'text-xs text-muted truncate' },
          [row.original.vendor, row.original.project_name].filter(Boolean).join(' · ') || '—'
        )
      ])
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => h('span', { class: 'capitalize text-sm text-muted' }, row.original.category)
  },
  {
    accessorKey: 'client_name',
    header: 'Client',
    cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, row.original.client_name || '—')
  },
  {
    accessorKey: 'occurred_on',
    header: 'Date',
    cell: ({ row }) => h('span', { class: 'text-sm text-muted tabular-nums' }, formatDate(row.original.occurred_on))
  },
  {
    id: 'flags',
    header: 'Flags',
    cell: ({ row }) => {
      const out = []
      if (row.original.billable) {
        out.push(h(UBadge, { variant: 'subtle', color: 'info' }, () => 'Billable'))
      }
      if (row.original.reimbursed) {
        out.push(h(UBadge, { variant: 'subtle', color: 'success' }, () => 'Reimbursed'))
      }
      return h('div', { class: 'flex gap-1' }, out.length ? out : [h('span', { class: 'text-xs text-muted' }, '—')])
    }
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) =>
      h('span', { class: 'font-medium tabular-nums text-highlighted' },
        formatMoney(row.original.amount, row.original.currency)
      )
  }
]

const pagination = ref({ pageIndex: 0, pageSize: 12 })

const search = ref('')
const filtered = computed(() =>
  data.value.filter(e =>
    !search.value
    || e.description.toLowerCase().includes(search.value.toLowerCase())
    || (e.vendor || '').toLowerCase().includes(search.value.toLowerCase())
    || (e.client_name || '').toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>

<template>
  <UDashboardPanel id="expenses">
    <template #header>
      <UDashboardNavbar title="Expenses">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" label="Log expense" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- MTD pulse -->
      <UPageGrid class="lg:grid-cols-3 gap-px rounded-lg overflow-hidden ring ring-default">
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Spent this month</p>
          <p class="text-2xl font-semibold text-highlighted mt-2">{{ formatMoney(mtdTotal) }}</p>
          <p class="text-xs text-muted mt-1">All categories</p>
        </div>
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Billable</p>
          <p class="text-2xl font-semibold text-highlighted mt-2">{{ formatMoney(mtdBillable) }}</p>
          <p class="text-xs text-muted mt-1">Pass-through to clients</p>
        </div>
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Awaiting reimbursement</p>
          <p class="text-2xl font-semibold text-highlighted mt-2">{{ formatMoney(mtdReimbursable) }}</p>
          <p class="text-xs text-muted mt-1">Not yet collected</p>
        </div>
      </UPageGrid>

      <UInput v-model="search" icon="i-lucide-search" placeholder="Filter by description, vendor, or client" class="max-w-sm" />

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
