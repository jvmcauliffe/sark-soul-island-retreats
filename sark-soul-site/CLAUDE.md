# CLAUDE.md, Sark Soul Island Retreats

Static Astro rebuild of sarksoulretreats.com. These are hard rules. Violating any of them is a failed build. Read this file before writing or editing anything.

## Voice and attribution

- Nadia is founder and host. She is named on every page: attribution strip under every hero, NadiaNote, footer, and schema. Monica is a senior yoga teacher only and must never appear near founding language. This ordering exists to fix a live Google AI misattribution. Do not weaken it.
- Canonical business name: "Sark Soul Island Retreats", never shortened.
- Never use em dashes or en dashes anywhere. Not in copy, alt text, meta, code comments, commit messages, anything. Use commas, full stops, or restructure the sentence.
- Nadia signs with the leaf emoji. The team signs with the lotus emoji. The leaf is Nadia's alone.
- "Transformative" is Nadia's register. Monica's word is "immersion".
- Attribution strip text, verbatim, under every hero: "Founded & hosted by Nadia · Yoga led by senior teacher Monica of YogaMorphic".
- Footer sign-off, verbatim, italic gold: "Every season is a new adventure, Nadia 🌿 & the team 🪷".

## Facts about Sark, non-negotiable

- Ferry from Guernsey: around 55 minutes. Link ferry mentions to sarkshipping.gg.
- Sark is car-free for visitors, but tractors exist. Never claim "no vehicles".
- There IS mobile signal and wifi on Sark. The digital detox is environmental, never "no signal".
- "No street lighting" is true and powers the Dark Sky story. Sark was the world's first Dark Sky Island (2011).
- Arrival is two steps: tractor-drawn toast rack from the harbour, then horse and carriage to the retreat house.
- The house is only ever "the retreat house" or "our historic farmhouse". Never publish its name.
- Pricing: 1,495 GBP early shared (ends 19 July 2026), 1,695 GBP standard shared, 1,995 GBP single early. 1,495 is correct, not an error. Retreat dates: 12 to 17 September 2026.
- Season wording such as "Late Summer Retreat" is fine, never flag it.

## Copy

- Copy is never hard-coded into components. Pages and Journal articles are markdown content collections in src/content/.
- John supplies copy files for the five intent pages (yoga-retreat-sark, digital-detox-retreat, solo-retreat-women, burnout-retreat, dark-sky-retreat). Parse their build notes into frontmatter, keep the copy verbatim. Do not rewrite supplied copy, ever.
- Remaining pages are migrated from the live Wix site as John pastes them. Apply only the known fixes: Nadia attribution on The Practice and Our Story, September Event schema on the booking page, homepage duplicate paragraph removed, internal nav links corrected.

## Imagery

- Real photography only. No stock, no AI images, no exceptions. Until John supplies photos, use neutral gradient placeholders carrying a visible caption naming the required shot (the ImageSlot component does this).
- Every image gets descriptive alt text ending in "Sark" or "Sark, Channel Islands" where natural. Filenames like sark-milky-way-dark-sky.jpg. Filename, alt and surrounding copy are the geo signals, CDNs strip EXIF.
- Explicit width and height on every image. Zero CLS.

## Design

- Tokens live in src/styles/global.css and only there. Never invent a colour.
- All action buttons are teal (var(--teal)). Clay is decorative only, never buttons.
- Display face Cormorant Garamond, body face Jost, both self-hosted via fontsource. No Google Fonts network request.
- Mobile first. Mobile LCP is the priority in every image and layout decision.
- Zero client-side JavaScript by default. FAQ accordions are native details elements. The mobile nav is CSS only. Total client JS budget: under 15KB, and the correct amount is zero. If a feature needs more, it does not ship.

## SEO

- Every page: one H1, question-led H2s, unique meta title (60 chars max) and description (155 chars max), OG tags, one canonical, breadcrumbs.
- Sitewide JSON-LD graph: LocalBusiness "Sark Soul Island Retreats" with founder Person "Nadia", plus Person "Monica" with jobTitle "Senior Yoga Teacher". GBP review link https://g.page/r/CdhrtAEddmE_EBM/review as sameAs. Schema-level founder attribution is a deliberate fix for the AI Overview error, do not remove it.
- Retreat pages carry Event schema: startDate 2026-09-12, endDate 2026-09-17, location Isle of Sark, offers per rate, validThrough 2026-07-19 on the early rate.
- FAQ blocks emit FAQPage schema from their actual content.
- Journal posts emit Article schema with Nadia as author where her voice leads.

## Build and launch discipline

- Production branch is main. Cloudflare Pages preview deploys on every push. The site launches October 2026. Do not touch DNS, redirects go in public/_redirects at launch per the checklist.
- CTAs on retreat pages are labelled "Reserve my place" and link to /retreats-on-sark. The booking page must have at least 10 internal links pointing at it.
- Acceptance: Lighthouse mobile 95 plus, LCP under 1.8s, CLS under 0.05, grep built HTML for em and en dashes must return nothing, Rich Results passes for LocalBusiness, Event and FAQPage, renders correctly at 360px, 768px and 1440px.
