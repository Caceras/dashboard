import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
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
