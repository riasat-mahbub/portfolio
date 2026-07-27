import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };