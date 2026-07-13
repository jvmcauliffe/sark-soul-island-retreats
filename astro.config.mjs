import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  site: 'https://www.sarksoulretreats.com',
  output: 'static',
  trailingSlash: 'never',
  markdown: {
    // External links open in a new tab so readers never leave the site,
    // per John. Internal links are untouched.
    rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener'] }]],
  },
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
    // Emit /why-sark.html rather than /why-sark/index.html. Netlify serves
    // the .html file at the extensionless URL directly, so the canonical,
    // sitemap and internal links (all trailing-slash-free) get a 200 with
    // no 301 hop. Before this, every internal click redirected.
    format: 'file',
  },
});
