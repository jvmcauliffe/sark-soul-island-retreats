import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site config for sarksoulretreats.com. Slugs match the live Wix site,
// output format 'file' keeps URLs extensionless with no trailing slash.
export default defineConfig({
  site: 'https://sarksoulretreats.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },
  image: {
    // AVIF first with WebP fallback is handled per component via <Picture>.
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
});
