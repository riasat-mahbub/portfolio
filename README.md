# Riasat Mahbub - Portfolio

![Deploy Status](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?style=flat&logo=githubpages)

---

Personal portfolio website showcasing my work as a Software Developer with expertise in web development and artificial intelligence.

## **Tech Stack**

### **Frontend**

![Astro](https://img.shields.io/badge/Astro-FF5D01?logo=astro&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)

### **Features**

- 🌙 Dark/Light mode toggle (persisted via localStorage)
- 📱 Fully responsive design
- 📝 Blog with MDX content, pagination, tags, RSS, reading time, and related posts
- 🧭 File-based project tracking (bugs, features, tasks, ADRs)
- ⚡ SSG via Astro 5 with optimized images and inline stylesheets

## **Project Structure**

```
public/          → Static assets (images, SVGs, robots.txt)
src/
├── components/  → Astro/React components (each is a page section or UI widget)
│   ├── blog-card.astro
│   ├── blog-nav.astro
│   ├── blog-section.astro
│   ├── connect.astro
│   ├── education.astro
│   ├── experience.astro
│   ├── home.astro
│   ├── nav.astro
│   ├── projects.astro
│   ├── skills.astro
│   ├── social-links.astro
│   └── theme-toggle.astro
├── content/     → Content collections (MDX blog posts + Zod schema)
│   ├── config.ts
│   └── blog/    → Individual MDX posts with YAML frontmatter
├── layouts/     → Page shells (Layout, BlogLayout, BlogPost)
├── lib/         → Shared utilities (slugify, readingTime, formatDate)
├── pages/       → File-based routing
│   ├── index.astro
│   ├── rss.xml.ts
│   └── blog/    → Blog list (paginated), single post, tags
└── styles/      → Global CSS with CSS custom properties for theming
```

## **Getting Started**

1. Clone the repository:

```bash
git clone https://github.com/riasat-mahbub/portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:4321](http://localhost:4321) in your browser

## **Commands**

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start dev server on port 4321   |
| `npm run build`   | Type-check + build to `dist/`   |
| `npm run preview` | Preview built site from `dist/` |
| `npm run format`  | Format source with Prettier     |

## **Contact**

- 📧 Email: [riasat1998@gmail.com](mailto:riasat1998@gmail.com)
- 💼 LinkedIn: [riasat-m-70682b115](https://www.linkedin.com/in/riasat-m-70682b115/)
- 🐙 GitHub: [riasat-mahbub](https://github.com/riasat-mahbub)
- 📍 Location: Halifax, Canada
