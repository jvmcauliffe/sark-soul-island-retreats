import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sarksoulretreats.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  image: {
    // AVIF first with WebP fallback is handled per-image via <Picture>
    formats: ['avif', 'webp'],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
