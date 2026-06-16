import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: string }) {
  const posts = await getCollection('posts');
  const sorted = posts
    .filter(p => !p.data.draft)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'Zirflow Blog · 企业 AI 自动化实战',
    description: '珠三角企业 AI 自动化落地经验：案例、策略、ROI 分析',
    site: context.site,
    items: sorted.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/posts/${post.slug}/`,
    })),
    customData: '<language>zh-CN</language>',
  });
}
