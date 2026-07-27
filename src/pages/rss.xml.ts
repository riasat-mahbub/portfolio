import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  );

  return rss({
    title: "Riasat Mahbub's Blog",
    description: "My journey through coding challenges and problem-solving insights.",
    site: context.site || "https://riasat-mahbub.github.io",
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
