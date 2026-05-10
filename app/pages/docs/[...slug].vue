<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs'
})

const route = useRoute()
const { toc } = useAppConfig()
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
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImageComponent('Docs', {
  headline: headline.value
})

const links = computed(() => {
  const list: Array<Record<string, unknown>> = []
  if (toc?.bottom?.edit && page.value) {
    list.push({
      icon: 'i-lucide-external-link',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page.value.stem}.${page.value.extension}`,
      target: '_blank'
    })
  }
  return [...list, ...((toc?.bottom?.links as Array<Record<string, unknown>>) || [])].filter(Boolean)
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
      <UContentToc
        :title="toc?.title"
        :links="page.body.toc.links"
      >
        <template
          v-if="links?.length"
          #bottom
        >
          <div class="hidden lg:block space-y-6">
            <USeparator type="dashed" />
            <UPageLinks
              :title="toc?.bottom?.title"
              :links="links"
            />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
