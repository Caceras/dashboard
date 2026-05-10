<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs'
})

const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[] | null>>('navigation')

const { data: page } = await useAsyncData(`docs:${route.path}`, () =>
  queryCollection('docs').path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`docs:${route.path}:surround`, () =>
  queryCollectionItemSurroundings('docs', route.path, {
    fields: ['description']
  })
)

const headline = computed(() =>
  navigation?.value ? findPageHeadline(navigation.value, page.value?.path) : undefined
)

const title = computed(() => page.value?.title)
const description = computed(() => page.value?.description)

useSeoMeta({
  title: () => title.value ? `${title.value} — Works docs` : 'Works docs',
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      :headline="headline"
    >
      <template
        v-if="page.links?.length"
        #links
      >
        <UButton
          v-for="(link, index) in page.links"
          :key="index"
          v-bind="link"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer :value="page" />

      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround" />
    </UPageBody>

    <template
      v-if="page.body?.toc?.links?.length"
      #right
    >
      <UContentToc :links="page.body.toc.links" />
    </template>
  </UPage>
</template>
