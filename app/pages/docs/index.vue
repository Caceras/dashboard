<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

definePageMeta({
  layout: 'docs'
})

const { data: navigation } = await useAsyncData('docs-navigation', () =>
  queryCollectionNavigation('docs')
)
provide('navigation', navigation as Ref<ContentNavigationItem[] | null>)

const { data: page } = await useAsyncData('docs-landing', () =>
  queryCollection('landing').path('/docs').first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Docs landing not found', fatal: true })
}

const title = page.value.seo?.title || page.value.title || 'Works docs'
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </div>
</template>
