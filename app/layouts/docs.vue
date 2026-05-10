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
  <div class="min-h-svh flex flex-col bg-default">
    <AppDocsHeader />

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

    <AppDocsFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </div>
</template>
