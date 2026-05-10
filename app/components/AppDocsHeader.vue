<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[] | null>>('navigation')

const { header } = useAppConfig()
</script>

<template>
  <UHeader
    :to="header.to"
    :ui="{
      root: 'bg-default/80 backdrop-blur',
      container: 'max-w-(--ui-container)'
    }"
  >
    <template #title>
      <NuxtLink
        :to="header.to"
        class="flex items-center gap-2 font-semibold text-default"
      >
        <UIcon
          v-if="header.logo?.icon"
          :name="header.logo.icon"
          class="size-5 text-primary"
        />
        <span>{{ header.title }}</span>
        <UBadge
          color="neutral"
          variant="subtle"
          size="sm"
          label="Docs"
        />
      </NuxtLink>
    </template>

    <UContentNavigation
      v-if="navigation"
      :navigation="navigation"
      highlight
      class="hidden lg:flex"
    />

    <template #right>
      <UContentSearchButton
        v-if="header.search"
        class="hidden lg:inline-flex"
      />
      <UContentSearchButton
        v-if="header.search"
        :label="null"
        class="lg:hidden"
      />

      <template
        v-for="(link, index) in header.links"
        :key="index"
      >
        <UTooltip :text="link['aria-label'] || link.label">
          <UButton
            v-bind="link"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </UTooltip>
      </template>

      <UColorModeButton v-if="header.colorMode" />
    </template>

    <template
      v-if="navigation"
      #body
    >
      <UContentNavigation
        :navigation="navigation"
        highlight
      />
    </template>
  </UHeader>
</template>
