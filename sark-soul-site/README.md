# Sark Soul Island Retreats, static site

Astro rebuild of sarksoulretreats.com, replacing Wix Classic. Launches
October 2026 behind a Cloudflare Pages preview until cutover. Read CLAUDE.md
before changing anything, its rules are hard rules.

## Commands

- `npm install`
- `npm run dev` local dev server
- `npm run build` static build to dist/
- `npm run preview` serve the build locally

## Deployment

Cloudflare Pages, production branch `main`, preview deploys on every push.
Build command `npm run build`, output directory `dist`. Do not touch DNS
until the launch checklist is executed in October 2026.

## Status

- Phase 1 scaffold and Phase 2 components: done, see /styleguide
- Home: styled placeholder awaiting migrated Wix copy
- Five intent pages: done, copy files in src/content/pages built from the
  approved design pack in /designs
- Migrated pages: awaiting pasted live copy
- Journal: collection and index live, awaiting Story Bank articles
- Launch items outstanding: live sitemap reconciliation (Wix blocks
  automated fetch, export it manually), _redirects completion, MailerLite
  embed snippets, PayPal per rate links, GA4 include, OG default image,
  real photography
