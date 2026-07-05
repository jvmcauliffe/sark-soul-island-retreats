# SPEC: sarksoulretreats.com, Static Rebuild
## For Claude Code. Read fully before writing any code. Execute in phases, in order.

---

## 1. What this is

A complete rebuild of sarksoulretreats.com as a static Astro site, replacing Wix Classic. One operator (John), one writer's voice (Nadia, founder), one build agent (you). The site's job is to convert bookings for a luxury small-group yoga retreat on the Isle of Sark and to become the definitive search authority on Sark wellness.

Quality bar: a retreat brand featured in Condé Nast Traveller. Editorial restraint, generous whitespace, real photography, no template smell. If a design decision would look at home on a generic wellness template, make a different decision.

The site launches in October 2026, after the September retreat. Build now, hold behind a preview URL, cut over with redirects at launch. Do not touch DNS until the launch checklist in section 13.

---

## 2. Stack

- **Framework:** Astro, latest stable. Zero client-side JS by default. No React islands unless a component genuinely needs interactivity (the FAQ accordions use native `<details>`, not JS).
- **Hosting:** Cloudflare Pages, connected to a Git repo (`sark-soul-site`). Production branch `main`, preview deploys on every push.
- **Content:** Astro content collections. Pages and Journal articles are markdown with frontmatter. Copy is never hard-coded into components.
- **Fonts:** self-hosted via @fontsource. `cormorant-garamond` (400, 500, 600, italic 400) for display, `jost` (300, 400, 500) for body. No Google Fonts network request.
- **Images:** Astro's built-in image optimization, output AVIF with WebP fallback, explicit width/height on every image (zero CLS). Source photos live in `/src/assets/photos/`.
- **CSS:** vanilla CSS with custom properties, one global stylesheet plus scoped component styles. No Tailwind.

## 3. Repo structure

```
sark-soul-site/
  CLAUDE.md                  ← create this first, see section 7
  src/
    components/              Header, Footer, Hero, QRow, DarkStrip,
                             PriceCards, NadiaNote, FAQ, CTABand, Schema
    layouts/BaseLayout.astro
    content/
      pages/                 one .md per page (John supplies copy files)
      journal/               articles, added over time
    assets/photos/           real photography only
    styles/global.css
  public/
    _redirects               Cloudflare Pages redirect map
    robots.txt
    favicon assets
```

John will drop these copy files into `src/content/pages/`: `yoga-retreat-sark.md`, `digital-detox-retreat.md`, `solo-retreat-women.md`, `burnout-retreat.md`, `dark-sky-retreat.md`. Each contains build notes (slug, meta, links, image slots) followed by the page copy. Parse the build notes into frontmatter, keep the copy verbatim. Do not rewrite the copy. Remaining pages (Home, Why Sark, The Practice, Our Story, Meet the Team, Retreats/booking, FAQ, Getting to Sark guide) are migrated from the live Wix site: John will paste the live copy per page when you scaffold them.

## 4. Design system

Tokens, exactly these:

```css
--ink:#15212e;        /* dark-sky navy, headings and footer */
--ink-soft:#243443;
--sage:#6f7d63;       /* eyebrows, secondary accents */
--sage-dark:#566049;
--cream:#f6f1e7;      /* warm section backgrounds */
--cream-deep:#ece4d3; /* borders, dividers */
--clay:#b07a4f;       /* decorative accent only, never buttons */
--gold:#c2a35c;       /* accents on dark strips */
--charcoal:#2c2c28;   /* body text */
--paper:#fbf8f1;      /* page background */
--teal:#4f9fb0;       /* ALL CTAs and action buttons */
--teal-dark:#3f8494;  /* button hover */
```

Type scale: body Jost 300 at 17px, line-height 1.75. H1 Cormorant Garamond 500, clamp(38px, 6vw, 68px). H2 clamp(26px, 3.4vw, 38px). Eyebrow labels: Jost 11px, uppercase, letter-spacing 3px, sage (gold on dark strips).

Signature components, used consistently sitewide:

- **Hero:** full-bleed photo, bottom-weighted gradient scrim, eyebrow + H1 + one line + teal CTA. H1 is real text, never baked into the image.
- **Attribution strip:** directly under every hero: "Founded & hosted by **Nadia** · Yoga led by senior teacher **Monica** of YogaMorphic". Cream background, uppercase Jost 13px. Non-negotiable, every page.
- **QRow:** alternating two-column rows, question-led H2s, photo with a caption scrim. This is the site's rhythm.
- **DarkStrip:** the dark-sky section, radial navy `#27384b → #111b27`, cream headings, gold eyebrows. Every retreat page carries one; it is the brand's signature move.
- **PriceCards:** three cards, featured card gets a teal border. Amounts in Cormorant 44px.
- **NadiaNote:** cream strip, italic Cormorant quote, attribution "Nadia · Founder & Host · Sark Soul Island Retreats 🌿".
- **FAQ:** native `<details>` accordions, Cormorant summaries.
- **Footer:** ink background. Links row, then NAP line "Sark Soul Island Retreats · Isle of Sark, Channel Islands · Founded & hosted by Nadia", copyright, then the sign-off in italic gold: "Every season is a new adventure, Nadia 🌿 & the team 🪷".

## 5. Page inventory and URLs

Slugs are kept identical to the live Wix site wherever a page already exists, so redirects are 1:1 or unnecessary. Before finalising, fetch the live sitemap at sarksoulretreats.com/sitemap.xml and reconcile every URL. Known map:

| Page | URL | Status |
|---|---|---|
| Home | / | migrate |
| Retreats + booking | /retreats-on-sark | migrate, Event schema updated to September dates |
| Why Sark? | /why-sark | migrate |
| The Practice | /the-practice (verify slug) | migrate, add Nadia host note under Monica's bio |
| Our Story | verify slug | migrate, attribute opening quote to Nadia |
| Meet the Team | verify slug | migrate verbatim, it is the attribution source of truth |
| Retreat FAQ | /sark-island-yoga-retreat-faq | migrate |
| Getting to Sark guide page | verify slug | migrate |
| Yoga Retreat | /yoga-retreat-sark | new, copy supplied |
| Digital Detox | /digital-detox-retreat | new, copy supplied |
| Solo (women) | /solo-retreat-women | new, copy supplied |
| Burnout | /burnout-retreat | new, copy supplied |
| Dark Sky | /dark-sky-retreat | new, copy supplied |
| Journal index | /journal | new |
| Booking terms, contact | verify slugs | migrate |

Navigation (site-wide, matches the master header): Home / Our Retreats / Why Sark? / The Practice / Our Story / Meet the Team. The five intent pages are reached through internal links and a "Retreats" dropdown or footer links, not by widening the main nav.

Internal linking is part of the build, not an afterthought: all four intent pages link up to /why-sark and across to each other, every page links to /retreats-on-sark. The booking page must never again be the least-linked page on the site.

## 6. Per-page requirements

Every page: one H1, question-led H2s, unique meta title (≤60 chars) and description (≤155 chars) from the copy file's build notes, OG title/description/image, canonical URL, breadcrumbs.

Every retreat intent page additionally: attribution strip, one DarkStrip section, PriceCards (£1,495 shared early booking until 19 July 2026, £1,695 shared standard, £1,995 single early booking, dates 12 to 17 September 2026), NadiaNote, FAQ block, closing CTABand. CTA labels: "Reserve my place" linking to the booking page.

## 7. CLAUDE.md, create before anything else

Create a `CLAUDE.md` in the repo root containing the guardrails below, so every future session obeys them. These are hard rules; violating any of them is a failed build.

**Voice and attribution**
- Nadia is founder and host, named on every page (attribution strip, NadiaNote, footer, schema). Monica is a senior yoga teacher only and must never appear near founding language. This ordering exists to fix a live Google AI misattribution; do not weaken it.
- Canonical business name: "Sark Soul Island Retreats", never shortened.
- Never use em dashes or en dashes anywhere, in copy, alt text, meta, commit messages, anything. Commas, full stops, or restructure.
- Nadia signs 🌿, the team signs 🪷. The leaf is Nadia's alone. "Transformative" is Nadia's register; Monica's word is "immersion".

**Facts about Sark, non-negotiable**
- Ferry from Guernsey: around 55 minutes. Link ferry mentions to sarkshipping.gg.
- Car-free for visitors, but tractors exist. Never claim "no vehicles".
- There IS mobile signal and wifi. The digital detox is environmental, never "no signal".
- "No street lighting" is true and powers the Dark Sky story. Sark was the world's first Dark Sky Island (2011).
- Arrival is two steps: tractor-drawn toast rack from the harbour, then horse and carriage to the retreat house.
- The house is only ever "the retreat house" or "our historic farmhouse". Never publish its name.
- Pricing: £1,495 early shared (ends 19 July 2026), £1,695 standard shared, £1,995 single early. £1,495 is correct, not an error.
- Season wording ("Late Summer Retreat") is fine, never flag it.

**Imagery**
- Real photography only. No stock, no AI images, no exceptions. Until John supplies photos, use neutral gradient placeholders carrying a visible caption naming the required shot.
- Every image: descriptive alt text ending in "Sark" or "Sark, Channel Islands" where natural; filenames like `sark-milky-way-dark-sky.jpg`. Filename, alt and surrounding copy are the geo signals (CDNs strip EXIF).

**Design**
- All action buttons teal #4f9fb0. Clay is decorative only.
- Mobile first. Mobile already outranks desktop dramatically; mobile LCP is the priority in every image and layout decision.

## 8. SEO and schema

- **Sitewide JSON-LD:** `LocalBusiness` (Sark Soul Island Retreats, Isle of Sark, Channel Islands, URL, GBP review link https://g.page/r/CdhrtAEddmE_EBM/review as sameAs, `founder` → Person "Nadia"). Add a `Person` node for Nadia (founder) and one for Monica with `jobTitle: "Senior Yoga Teacher"`. Schema-level founder attribution is a deliberate fix for the AI Overview error.
- **Retreat pages:** `Event` schema, startDate 2026-09-12, endDate 2026-09-17, location Isle of Sark, offers for each rate with `validThrough` 2026-07-19 on the early rate.
- **FAQ blocks:** `FAQPage` schema generated from the FAQ component's content, per page.
- **Journal posts:** `Article` schema with Nadia as author where her voice leads.
- `sitemap.xml` and `robots.txt` generated at build. One canonical per page.

## 9. Performance budget (hard limits)

- Lighthouse mobile: 95+ across the board.
- LCP under 1.8s on mobile, CLS under 0.05, zero render-blocking third-party requests.
- Hero images: responsive srcset, priority-loaded; everything below the fold lazy.
- Total JS shipped to the client: under 15KB. If a feature needs more, it does not ship.
- Fonts: preloaded, `font-display: swap`, subsetted latin.

## 10. Integrations

- **MailerLite:** the official embedded form snippet now works (the Wix iframe restriction is gone). Embed the "Guide downloads" form on /why-sark, Home and the guide page; the waitlist form site-wide in the footer CTA where marked. Sends and automations stay entirely inside MailerLite.
- **Booking:** teal CTAs link to /retreats-on-sark; PayPal links per room rate, one per price. Flag any page where a single shared PayPal link serves multiple prices.
- **Analytics:** GA4 via a lightweight direct gtag include or server-side later; do not port the full GTM container unless John says so. Nothing that violates the JS budget on first paint.

## 11. Journal

Content collection at `/journal/[slug]`. Frontmatter: title, description, date, author (default Nadia), hero image, tags. Index page lists newest first, editorial card layout consistent with the design system. Seed with empty structure; articles arrive from the Story Bank pipeline (windmill history, Dark Sky, coastal walks, occupation history are the planned first four).

## 12. Build phases

1. **Scaffold:** repo, CLAUDE.md, Astro config, tokens, BaseLayout, Header, Footer, deploy pipeline to Cloudflare Pages preview. Stop and show John the preview URL with a styled placeholder home page.
2. **Components:** Hero, attribution strip, QRow, DarkStrip, PriceCards, NadiaNote, FAQ, CTABand, Schema component. Build a `/styleguide` page rendering all of them for John's sign-off.
3. **The five intent pages** from the supplied copy files, pixel-faithful to the component system.
4. **Migrated pages** as John pastes live copy, with the known fixes applied: Nadia attribution on The Practice and Our Story, September Event schema on the booking page, homepage duplicate paragraph removed, internal nav links corrected.
5. **SEO layer:** schema, sitemap, redirects file, OG images, meta audit.
6. **QA against section 14.** Then stop. Launch is a separate, deliberate step.

## 13. Launch checklist (October, post-retreat)

1. Freeze Wix. Export the final live sitemap, reconcile every URL against the new site, complete `_redirects` (301s, old slug → new, no chains).
2. Point DNS to Cloudflare Pages. Keep Wix live but unlinked for 30 days as fallback.
3. Search Console: verify the property is unaffected (same domain), submit the new sitemap, request indexing on the five intent pages first.
4. Confirm GBP website link, MailerLite forms, PayPal links, and the review link all resolve on the new site.
5. Watch Search Console daily for two weeks; any 404 in the coverage report gets a redirect same day.

## 14. Acceptance criteria

- Every page passes the section 7 guardrails on manual review, zero em or en dashes in rendered output (grep the built HTML).
- Nadia named as founder in visible copy, footer and schema on every page; Monica never adjacent to founding language.
- Lighthouse mobile 95+ on Home, /yoga-retreat-sark and /retreats-on-sark.
- All internal links resolve, booking page has ≥10 internal links pointing at it.
- Rich Results test passes for LocalBusiness, Event and FAQPage.
- Site renders correctly at 360px, 768px and 1440px.
