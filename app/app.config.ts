export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'zinc'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
  seo: {
    siteName: 'Works'
  },
  header: {
    title: 'Works',
    to: '/docs',
    logo: {
      alt: 'Works',
      icon: 'i-lucide-shapes'
    },
    search: true,
    colorMode: true,
    links: [{
      'label': 'Dashboard',
      'icon': 'i-lucide-layout-dashboard',
      'to': '/',
      'aria-label': 'Back to dashboard'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/Caceras/dashboard',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    credits: `Built with Nuxt UI · Works © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [{
      'label': 'Dashboard',
      'icon': 'i-lucide-layout-dashboard',
      'to': '/',
      'aria-label': 'Back to dashboard'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/Caceras/dashboard',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/Caceras/dashboard/edit/main/content',
      links: [{
        icon: 'i-lucide-book-open',
        label: 'Nuxt UI docs',
        to: 'https://ui.nuxt.com',
        target: '_blank'
      }, {
        icon: 'i-lucide-star',
        label: 'Nuxt UI on GitHub',
        to: 'https://github.com/nuxt/ui',
        target: '_blank'
      }]
    }
  }
})
