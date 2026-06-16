import type { CollectionEntry } from 'astro:content';

export function sortPostsByDate(posts: CollectionEntry<'posts'>[]) {
  return posts
    .filter(p => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
