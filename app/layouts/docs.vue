<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const { data: navigation } = await useAsyncData('docs-navigation', () =>
  queryCollectionNavigation('docs')
)

const { data: files } = useLazyAsyncData('docs-search', () =>
  queryCollectionSearchSections('docs'), {
  server: false
})

provide('navigation', navigation as Ref<ContentNavigationItem[] | null>)
</script>

<template>
  <div class="min-h-svh bg-default">
    <UHeader
      :ui="{
        root: 'bg-default/80 backdrop-blur',
        container: 'max-w-(--ui-container)'
      }"
    >
      <template #title>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-semibold text-default"
        >
          <UIcon
            name="i-lucide-shapes"
            class="size-5 text-primary"
          />
          <span>Works</span>
          <span class="text-muted">/</span>
          <span class="text-muted">Docs</span>
        </NuxtLink>
      </template>

      <template #right>
        <UContentSearchButton class="hidden lg:inline-flex" />
        <UContentSearchButton
          :label="null"
          class="lg:hidden"
        />
        <UTooltip
          text="Back to dashboard"
          :kbd="['G', 'H']"
        >
          <UButton
            to="/"
            icon="i-lucide-layout-dashboard"
            color="neutral"
            variant="ghost"
          />
        </UTooltip>
        <UColorModeButton />
      </template>

      <template #body>
        <UContentNavigation
          highlight
          :navigation="navigation"
        />
      </template>
    </UHeader>

    <UMain>
      <UContainer>
        <UPage>
          <template #left>
            <UPageAside>
              <UContentNavigation
                highlight
                :navigation="navigation"
              />
            </UPageAside>
          </template>

          <slot />
        </UPage>
      </UContainer>
    </UMain>

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </div>
</template>
