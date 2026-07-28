import rss from "@astrojs/rss";
import { getPublishedPosts, sortByDateDesc } from "@/lib/blog";

export async function GET(context: { site: URL }) {
  const posts = await getPublishedPosts();
  const sortedPosts = sortByDateDesc(posts);
  const feedUrl = new URL("/rss.xml", context.site).href;

  return rss({
    title: "Riasat Mahbub's Blog",
    description:
      "My journey through coding challenges and problem-solving insights.",
    site: context.site || "https://riasat-mahbub.github.io",
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/blog/${post.slug}/`,
      author: "riasat1998@gmail.com (Riasat Mahbub)",
    })),
    customData: [
      `<language>en-ca</language>`,
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
      `<copyright>Copyright ${new Date().getFullYear()}, Riasat Mahbub</copyright>`,
    ].join(""),
  });
}
