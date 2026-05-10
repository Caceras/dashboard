<script setup lang="ts">
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import type { CalendarEvent } from '~/types'
import { formatTime } from '~/utils/format'

const { data: events } = await useFetch<CalendarEvent[]>('/api/events', { default: () => [] })

const tz = getLocalTimeZone()
const selected = ref(today(tz))

function toCalendarDate(iso: string): CalendarDate {
  const d = new Date(iso)
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

function sameDay(a: CalendarDate, b: CalendarDate) {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

const eventsForDay = computed(() =>
  events.value
    .filter(e => sameDay(toCalendarDate(e.starts_at), selected.value))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
)

// Quick stats
const eventCountThisWeek = computed(() => {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end = new Date(); end.setDate(end.getDate() + 7); end.setHours(23, 59, 59, 999)
  return events.value.filter(e => {
    const d = new Date(e.starts_at)
    return d >= start && d <= end
  }).length
})

const focusHoursThisWeek = computed(() => {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end = new Date(); end.setDate(end.getDate() + 7)
  return events.value
    .filter(e => e.kind === 'focus' && new Date(e.starts_at) >= start && new Date(e.starts_at) <= end)
    .reduce((sum, e) => sum + (new Date(e.ends_at).getTime() - new Date(e.starts_at).getTime()) / 3_600_000, 0)
})

const kindColor: Record<string, 'info' | 'warning' | 'error' | 'success' | 'neutral'> = {
  meeting: 'info',
  focus: 'success',
  deadline: 'error',
  review: 'warning',
  other: 'neutral'
}

const selectedLabel = computed(() => {
  const d = new Date(selected.value.year, selected.value.month - 1, selected.value.day)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})
</script>

<template>
  <UDashboardPanel id="calendar">
    <template #header>
      <UDashboardNavbar title="Calendar">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" label="New event" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageGrid class="lg:grid-cols-2 gap-px rounded-lg overflow-hidden ring ring-default">
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Events next 7 days</p>
          <p class="text-2xl font-semibold text-highlighted mt-2 tabular-nums">{{ eventCountThisWeek }}</p>
        </div>
        <div class="bg-default p-5">
          <p class="text-xs uppercase tracking-wide text-muted">Focus hours scheduled</p>
          <p class="text-2xl font-semibold text-highlighted mt-2 tabular-nums">{{ focusHoursThisWeek.toFixed(1) }}h</p>
        </div>
      </UPageGrid>

      <div class="grid lg:grid-cols-[auto_1fr] gap-4 sm:gap-6">
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <UCalendar v-model="selected" />
        </UCard>

        <UCard :ui="{ root: 'overflow-hidden', body: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-muted">Selected</p>
                <h2 class="font-medium text-highlighted">{{ selectedLabel }}</h2>
              </div>
              <UBadge variant="subtle" color="neutral">{{ eventsForDay.length }} events</UBadge>
            </div>
          </template>

          <div v-if="eventsForDay.length === 0" class="p-8 text-sm text-muted text-center">
            Nothing scheduled.
          </div>

          <ul v-else class="divide-y divide-default">
            <li v-for="event in eventsForDay" :key="event.id" class="flex items-start gap-3 px-5 py-3">
              <div class="text-xs text-muted w-20 shrink-0 pt-0.5 tabular-nums">
                {{ formatTime(event.starts_at) }}<br>
                <span class="text-dimmed">{{ formatTime(event.ends_at) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-highlighted font-medium truncate">{{ event.title }}</p>
                <p v-if="event.description" class="text-xs text-muted line-clamp-1">{{ event.description }}</p>
                <p class="text-xs text-muted truncate">
                  <template v-if="event.client_name">{{ event.client_name }}</template>
                  <template v-if="event.client_name && event.location"> &middot; </template>
                  <template v-if="event.location">{{ event.location }}</template>
                </p>
              </div>
              <UBadge :color="kindColor[event.kind]" variant="subtle" class="capitalize">{{ event.kind }}</UBadge>
            </li>
          </ul>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
