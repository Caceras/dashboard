import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'docs/index.md'
    }),
    docs: defineCollection({
      type: 'page',
      source: {
        include: 'docs/**',
        exclude: ['docs/index.md']
      },
      schema: z.object({
        section: z.string().optional(),
        links: z.array(z.object({
          label: z.string(),
          icon: z.string().optional(),
          to: z.string(),
          target: z.string().optional()
        })).optional()
      })
    })
  }
})
