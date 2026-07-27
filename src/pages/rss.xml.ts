import rss from '@astrojs/rss';
import { getPublishedPosts, sortByDateDesc } from '@/lib/blog';

export async function GET(context: { site: URL }) {
  const posts = await getPublishedPosts();
  const sortedPosts = sortByDateDesc(posts);

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
