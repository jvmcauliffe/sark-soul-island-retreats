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

GA4: set the `PUBLIC_GA4_MEASUREMENT_ID` environment variable in Cloudflare
Pages (production only) to the web data stream's Measurement ID, it starts
with G-. Found in Google Analytics under Admin, Data streams. When unset,
no analytics code ships and the build stays at zero client JS. The GA
property is account 141587640, property 519849557.

## Status

- Phase 1 scaffold and Phase 2 components: done, see /styleguide
- Home: styled placeholder awaiting migrated Wix copy
- Five intent pages: done, copy files in src/content/pages built from the
  approved design pack in /designs
- Migrated pages: awaiting pasted live copy
- Journal: collection and index live, awaiting Story Bank articles
- MailerLite: embedded via src/components/MailerLiteForm.astro (account
  2309024). Waitlist form 191499361450984838 in the footer CTA site wide,
  Getting to Sark Guide signup 191498830146962835 in the GuideSignup band
  on Home (add to /why-sark and the guide page when they are built). The
  MailerLite script loads lazily when a form nears the viewport, nothing
  third party at first paint. NOTE: both forms currently show active:
  false in MailerLite, activate them in the dashboard before launch.
- Launch items outstanding: live sitemap reconciliation (Wix blocks
  automated fetch, export it manually), _redirects completion, PayPal per
  rate links, OG default image, real photography, MailerLite form
  activation
