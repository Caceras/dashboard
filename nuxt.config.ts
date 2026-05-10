// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/image',
    'nuxt-og-image',
    'nuxt-llms',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    }
  },

  experimental: {
    asyncContext: true
  },

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  nitro: {
    prerender: {
      routes: ['/docs'],
      crawlLinks: true,
      autoSubfolderIndex: false
    }
  },

  icon: {
    provider: 'iconify'
  },

  llms: {
    domain: 'https://works.local/',
    title: 'Works — operations cockpit',
    description: 'Operator manual for running SEO, clients, projects, tools, expenses, and the calendar from one surface.',
    full: {
      title: 'Works — full documentation',
      description: 'Complete reference for the Works operations cockpit.'
    },
    sections: [
      { title: 'Getting started', contentCollection: 'docs', contentFilters: [{ field: 'path', operator: 'LIKE', value: '/docs/getting-started%' }] },
      { title: 'Clients', contentCollection: 'docs', contentFilters: [{ field: 'path', operator: 'LIKE', value: '/docs/clients%' }] },
      { title: 'Projects', contentCollection: 'docs', contentFilters: [{ field: 'path', operator: 'LIKE', value: '/docs/projects%' }] },
      { title: 'SEO', contentCollection: 'docs', contentFilters: [{ field: 'path', operator: 'LIKE', value: '/docs/seo%' }] },
      { title: 'Expenses', contentCollection: 'docs', contentFilters: [{ field: 'path', operator: 'LIKE', value: '/docs/expenses%' }] },
      { title: 'Tools', contentCollection: 'docs', contentFilters: [{ field: 'path', operator: 'LIKE', value: '/docs/tools%' }] }
    ]
  },

  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
