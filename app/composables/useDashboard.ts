import { createSharedComposable } from '@vueuse/core'

const _useDashboard = () => {
  const route = useRoute()
  const router = useRouter()
  const isNotificationsSlideoverOpen = ref(false)

  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-s': () => router.push('/seo'),
    'g-c': () => router.push('/clients'),
    'g-p': () => router.push('/projects'),
    'g-t': () => router.push('/tools'),
    'g-e': () => router.push('/expenses'),
    'g-k': () => router.push('/calendar'),
    'g-d': () => router.push('/docs'),
    'g-,': () => router.push('/settings'),
    'n': () => isNotificationsSlideoverOpen.value = !isNotificationsSlideoverOpen.value
  })

  watch(() => route.fullPath, () => {
    isNotificationsSlideoverOpen.value = false
  })

  return {
    isNotificationsSlideoverOpen
  }
}

export const useDashboard = createSharedComposable(_useDashboard)
