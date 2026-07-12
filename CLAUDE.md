# Sark Soul Island Retreats, build guardrails

These are hard rules for every session working in this repository. Violating any of them is a failed build.

## Voice and attribution

- Nadia is founder and host. She is named on every page: attribution strip, NadiaNote, footer, and schema.
- Monica is a senior yoga teacher only. She must never appear near founding language. This ordering exists to fix a live Google AI misattribution; do not weaken it.
- Canonical business name: "Sark Soul Island Retreats", never shortened.
- Never use em dashes or en dashes anywhere: copy, alt text, meta, commit messages, code comments, anything. Use commas, full stops, or restructure the sentence.
- Nadia signs 🌿, the team signs 🪷. The leaf is Nadia's alone.
- "Transformative" is Nadia's register; Monica's word is "immersion".

## Facts about Sark, non-negotiable

- Ferry from Guernsey: about 45 minutes. Link ferry mentions to sarkshipping.gg. Never publish a specific last-ferry time, sailings change by season.
- Car-free for visitors, but tractors exist. Never claim "no vehicles".
- There IS mobile signal and wifi on Sark. The digital detox is environmental, never "no signal".
- "No street lighting" is true and powers the Dark Sky story.
- Sark was the world's first Dark Sky Island (2011).
- Arrival is two steps: tractor-drawn toast rack from the harbour, then horse and carriage to the retreat house.
- The house is only ever "the retreat house" or "our historic farmhouse". Never publish its name.
- Pricing: £1,495 early shared (ends 31 July 2026), £1,695 standard shared, £1,995 single early. £1,495 is correct, not an error.
- Season wording ("Late Summer Retreat") is fine, never flag it.
- Retreat dates: 12 to 17 September 2026.

## Imagery

- Real photography only. No stock, no AI images, no exceptions.
- Until John supplies photos, use neutral gradient placeholders carrying a visible caption naming the required shot (the ImageSlot component does this).
- Every image: descriptive alt text ending in "Sark" or "Sark, Channel Islands" where natural.
- Filenames like sark-milky-way-dark-sky.jpg. Filename, alt and surrounding copy are the geo signals (CDNs strip EXIF).

## Design

- All buttons teal #4f9fb0, with one exception: the Send me the guide button (and the submit inside its MailerLite form, slug 9SoA2F) uses earth clay #b07a4f, per John, 5 July 2026. Clay is never used on any other button.
- Mobile first. Mobile already outranks desktop dramatically; mobile LCP is the priority in every image and layout decision.
- Zero client-side JS by default. The FAQ accordions use native details elements, not JS. Total client JS budget: under 15KB; if a feature needs more, it does not ship.
- Copy is never hard-coded into components. Pages and Journal articles are markdown content collections.
- Do not rewrite supplied copy. Parse build notes into frontmatter, keep the copy verbatim.

## Structure

- Framework: Astro, static output, hosted on Cloudflare Pages (production branch main, previews on every push).
- Fonts: self-hosted via @fontsource, cormorant-garamond for display, jost for body. No Google Fonts network request.
- CTAs: "Reserve my place" linking to /retreats-on-sark.
- Every retreat intent page carries: attribution strip, one DarkStrip, PriceCards, NadiaNote, FAQ block, closing CTABand.
- Internal linking: all intent pages link up to /why-sark and across to each other; every page links to /retreats-on-sark. The booking page must never be the least-linked page on the site.
- Do not touch DNS or launch steps. Launch is a separate, deliberate step (October 2026, post-retreat).
- Booking: one payment link per room and rate on /retreats-on-sark, never a shared PayPal link across different prices. Until John supplies per-rate PayPal links, the room buttons open a pre-filled email to info@sarksoulretreats.com.
- Analytics: GA4 ships only when PUBLIC_GA4_ID is set in the Cloudflare Pages build environment. Without it, zero analytics JS is emitted.
- Run `npm run qa` after every change. It builds the site and enforces these guardrails against the built HTML (dashes, links, attribution, schema, meta lengths, JS budget). A change is not done until it passes.
