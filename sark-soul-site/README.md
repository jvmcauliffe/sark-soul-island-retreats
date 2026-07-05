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
- Home: migrated from the live Wix homepage, including guest testimonials
- Five intent pages: done, copy files in src/content/pages built from the
  approved design pack in /designs
- Migrated pages: done. Live copy captured 5 July 2026 into
  docs/live-copy (source of truth for the migration) and built as content
  pages: retreats-on-sark, why-sark, the-practice, our-story,
  meet-the-team, sark-island-yoga-retreat-faq,
  visiting-sark-for-a-wellness-retreat, terms-conditions, contact. Known
  fixes applied: Nadia attribution on The Practice and Our Story,
  September Event schema on the booking page, ferry wording fixed to
  around 55 minutes sitewide, no house name anywhere, internal links
  corrected.
- Redirects: public/_redirects reconciled against the live sitemap
  (12 URLs). Only /blog to /journal and retired /spring needed mapping,
  all other slugs are 1:1.
- Journal: collection and index live, awaiting Story Bank articles (the
  live /journal and /blog pages are empty)
- MailerLite: embedded via src/components/MailerLiteForm.astro (account
  2309024). Waitlist form 191499361450984838 in the footer CTA site wide,
  Getting to Sark Guide signup 191498830146962835 in the GuideSignup band
  on Home, /why-sark, /retreats-on-sark and the guide page. The
  MailerLite script loads lazily when a form nears the viewport, nothing
  third party at first paint. NOTE: both forms currently show active:
  false in MailerLite, activate them in the dashboard before launch.
- GA4: wired, set PUBLIC_GA4_MEASUREMENT_ID in Cloudflare Pages
- QA: npm run qa checks the built HTML against the CLAUDE.md guardrails
- Launch items outstanding: PayPal per rate links, OG default image,
  real photography, MailerLite form activation, final sitemap re-export
  at launch freeze
