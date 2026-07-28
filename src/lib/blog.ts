import { getCollection, type CollectionEntry } from 'astro:content';
import { readingTime } from './utils';

export type BlogPost = CollectionEntry<'blog'>;
export type PostWithReadingTime = { post: BlogPost; readingTime: number };

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts.filter(p => !p.data.draft);
}

export function sortByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

export function withReadingTime(posts: BlogPost[]): PostWithReadingTime[] {
  return posts.map(post => ({
    post,
    readingTime: readingTime(post.body || ''),
  }));
}

export function getLatestPosts(posts: BlogPost[], count: number = 4): BlogPost[] {
  return sortByDateDesc(posts).slice(0, count);
}

export function getRelatedPosts(
  post: BlogPost,
  allPosts: BlogPost[],
  maxCount: number = 3
): { slug: string; title: string; date: Date; sharedTags: string[] }[] {
  return allPosts
    .filter(p => p.slug !== post.slug && !p.data.draft)
    .map(p => ({
      slug: p.slug,
      title: p.data.title,
      date: p.data.publishDate,
      sharedTags: p.data.tags.filter(t => post.data.tags.includes(t)),
    }))
    .filter(p => p.sharedTags.length > 0)
    .sort((a, b) => b.sharedTags.length - a.sharedTags.length)
    .slice(0, maxCount);
}

export function getAllTags(posts: BlogPost[]): Map<string, number> {
  const tagMap = new Map<string, number>();
  const tagDisplay = new Map<string, string>();
  posts.forEach(post => {
    post.data.tags.forEach(tag => {
      const key = tag.toLowerCase();
      if (!tagDisplay.has(key)) {
        tagDisplay.set(key, tag);
      }
      const displayName = tagDisplay.get(key)!;
      tagMap.set(displayName, (tagMap.get(displayName) || 0) + 1);
    });
  });
  return tagMap;
}
