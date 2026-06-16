import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    description: z.string(),
    minutesRead: z.number().optional(),
    coverImage: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { posts };
