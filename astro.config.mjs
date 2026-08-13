// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !(
          page.startsWith("https://rmahbub.com/blog/tags/") &&
          page !== "https://rmahbub.com/blog/tags/" &&
          page !== "https://rmahbub.com/blog/tags"
        ),
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
      },
    },
  },
  site: "https://rmahbub.com/",
  base: "/",
  output: "static",
  build: {
    inlineStylesheets: "auto",
  },
  server: {
    host: true,
    port: 4321,
  },
});
