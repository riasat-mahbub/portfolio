/**
 * Shared blog utilities.
 */

/** Slugify a tag string for use in URLs. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Compute estimated reading time from raw Markdown body text.
 * Strips Markdown syntax before counting for better accuracy.
 */
export function readingTime(body: string): number {
  // Strip Markdown syntax for more accurate word counting
  const plain = body
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline + fenced code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images
    .replace(/^[>\s]*>/gm, "") // blockquotes
    .replace(/^[-*+]\s/gm, "") // unordered list markers
    .replace(/^\d+\.\s/gm, "") // ordered list markers
    .replace(/^\s*[-*_]{3,}\s*$/gm, "") // horizontal rules
    .replace(/---[\s\S]*?---/g, "") // frontmatter
    .replace(/\n+/g, " "); // newlines → spaces

  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/** Standard date formatter for consistency across the blog. */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
