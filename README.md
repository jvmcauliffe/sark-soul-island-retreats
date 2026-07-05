# Sark Soul Island Retreats

Umbrella repository for the Sark Soul Island Retreats web presence: the September 2026 retreat (12 to 17 September, Isle of Sark).

## Repository layout

| Directory | What it is |
|---|---|
| `sark-soul-site/` | The static Astro rebuild of sarksoulretreats.com (replaces Wix, launches October 2026). See its README and CLAUDE.md. |
| `sark-soul-chat/` | The n8n AI chat concierge: workflow, system prompt, deploy script and embed snippet. |
| `designs/` | The original five landing page design mockups (HTML, with toggleable Wix build notes). Copy source for the site's intent pages. |
| `docs/` | Specs and working notes, including the static site spec, the chat concierge spec, and live-site capture notes. |

## Design pack

Five retreat landing pages designed as self-contained HTML mockups, now also implemented as content pages in `sark-soul-site/`.

## Pages

| File | Target Wix URL | Page |
|---|---|---|
| [designs/yoga-retreat-sark.html](designs/yoga-retreat-sark.html) | `/yoga-retreat-sark` | Yoga Retreat on Sark |
| [designs/digital-detox-retreat.html](designs/digital-detox-retreat.html) | `/digital-detox-retreat` | Digital Detox Retreat |
| [designs/solo-retreat-women.html](designs/solo-retreat-women.html) | `/solo-retreat-women` | Solo Retreat for Women |
| [designs/burnout-retreat.html](designs/burnout-retreat.html) | `/burnout-retreat` | Burnout Retreat |
| [designs/dark-sky-retreat.html](designs/dark-sky-retreat.html) | `/dark-sky-retreat` | Dark Sky Island Retreat |

Open [designs/index.html](designs/index.html) in a browser to navigate the pack.

## Build notes

Every page has a "◆ Show Wix build notes" toggle (bottom right) that reveals per-section annotations: strip backgrounds, fonts and sizes, image alt text, internal link targets, and content rules (founder attribution, honesty positioning, no medical claims, etc.). The notes are hidden by default so each mockup previews as the finished page.

Key sitewide rules baked into the designs:

- **Founder attribution**: Nadia is Founder & Host everywhere (attribution strip under every hero, founder quote block, footer). Monica of YogaMorphic is the senior yoga teacher only — never near founding language.
- **Pricing**: shared room £1,495 early booking (until 19 July) / £1,695 standard; single room £1,995 early booking.
- **Ferry crossing**: Guernsey to Sark is ~55 minutes, sitewide.
- **Dark sky hero rule**: the Dark Sky page publishes only once a real Milky Way photo exists — the image is the page.

## Shared design system

All pages use the same palette (ink `#15212E`, cream `#F6F1E7`, sage `#6F7D63`, clay `#B07A4F`, gold `#C2A35C`, teal CTA `#4F9FB0`), Cormorant Garamond for headings and Jost for body text.
