<script setup lang="ts">
const { footer } = useAppConfig()
</script>

<template>
  <UFooter
    :ui="{ container: 'max-w-(--ui-container)' }"
  >
    <template #left>
      <span>{{ footer.credits }}</span>
    </template>

    <template #right>
      <UColorModeButton v-if="footer.colorMode" />

      <template
        v-for="(link, index) in footer.links"
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
    </template>
  </UFooter>
</template>
