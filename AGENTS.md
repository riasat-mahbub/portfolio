# Riasat Mahbub — Personal Portfolio

## Project
Astro 5 static site — personal portfolio with a blog. Tailwind CSS, TypeScript, React 19 components, MDX content. Deploys to GitHub Pages via Actions on push to `master`.

## Commands
```bash
npm run dev       # astro dev → http://localhost:4321
npm run build     # astro check && astro build → dist/
npm run preview   # astro preview (serve dist/)
npm run format    # prettier --write .
npm start         # alias for dev
```

## Architecture
```
src/
├── pages/           # File-based routing
│   ├── index.astro              # Homepage (one-pager, sections via <Components />)
│   ├── blog/[...page].astro     # Paginated blog list (pageSize=6)
│   ├── blog/[slug].astro        # Individual MDX post (SSG with getStaticPaths)
│   ├── blog/tags/[tag].astro    # Posts filtered by tag
│   ├── blog/tags/index.astro    # All tags
│   └── rss.xml.ts               # RSS feed (GET endpoint)
├── layouts/
│   ├── Layout.astro             # Main shell: <html>, meta tags, theme-toggle, global CSS
│   ├── BlogLayout.astro         # Blog shell: footer, RSS link, OG meta
│   └── BlogPost.astro           # Post wrapper: title, tags, reading time, prev/next
├── components/      # Astro components (.astro) — each is a page section or UI widget
│   ├── nav.astro, home.astro, projects.astro, skills.astro
│   ├── experience.astro, education.astro, blog-section.astro, connect.astro
│   ├── blog-card.astro, blog-nav.astro
│   ├── theme-toggle.astro, social-links.astro
├── content/
│   ├── config.ts                # Zod schema: title, description, tags, publishDate
│   └── blog/                    # MDX posts with YAML frontmatter
├── lib/              # Shared utilities
│   ├── utils.ts                 # slugify, readingTime, formatDate
│   ├── blog.ts                  # getPublishedPosts, sortByDateDesc, getRelatedPosts, etc.
│   └── social.ts                # SocialLink array (GitHub, LinkedIn, Email)
└── styles/global.css            # CSS custom properties, dark/light themes, fonts
```
Key config: `astro.config.mjs` — integrations (tailwind, react, mdx, sitemap), `@/` and `@components/` path aliases, static output, port 4321.

## Conventions
- **Astro component structure**: frontmatter (`---`) for imports + logic, template below, optional `<style>` block at bottom. Scoped by default; use `is:global` to leak styles.
- **Theming**: CSS custom properties (`--background`, `--white`, `--white-icon`, `--white-icon-tr`, `--sec`). Switch via `[data-theme="light"]` on `<html>`. Always reference colors as `var(--white)` etc., never hardcode hex values.
- **Tailwind**: utility-first. Use `var(--white-icon-tr)` for subtle borders/backgrounds. Responsive breakpoints: `md:`, `lg:`.
- **TypeScript**: interfaces for Props at the top of the frontmatter block. Path aliases `@/` and `@components/` in both `tsconfig.json` and `astro.config.mjs`.
- **Blog posts**: MDX in `src/content/blog/`. Frontmatter must match the Zod schema in `content/config.ts`. Tags are free-form strings. Use helpers from `src/lib/blog.ts` to query published posts.
- **Package manager**: npm only (single lockfile — `pnpm-lock.yaml` was removed).
- **No tests** — no test runner configured yet.

## Notes
- `tracker/` directory contains a file-based project knowledge graph (bugs, features, decisions, epics, tasks).
- Prettier available as dev dependency; no explicit config file (uses defaults). Run `npm run format` to lint.
- `.reasonix/skills/` may exist for project-local Reasonix skills.
