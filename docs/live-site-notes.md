# Live site capture notes, sarksoulretreats.com

Date: 5 July 2026. Captured from this Claude Code session while preparing the migration.

## Access status from this environment

Direct fetching of the live site is blocked in this cloud session, so full verbatim page copy could not be pulled automatically:

- The environment network policy is an allowlist. Requests to www.sarksoulretreats.com and archive.org are refused at the proxy ("Host not in allowlist").
- The built-in web fetch tool is disabled by the same policy (HTTP 403 on every host tested, including example.com).
- Ahrefs is connected but the plan does not include the Site Explorer or Site Audit API endpoints ("Insufficient plan").
- Semrush is connected but the plan does not include MCP access.
- Web search does work, so the fragments below come from the search index. They are paraphrased snippets, not verbatim copy. Do not treat them as copy sources.

To unblock a full automated migration, either add www.sarksoulretreats.com to the environment's network egress allowlist (Claude Code on the web, environment settings), or paste each page's copy into the chat, or upload a Wix export.

## What the search index shows about the live site

**Known live URLs so far:**

- / (title: "Sark Soul Island Retreats | Yoga, Wellness & Nature Escapes on Sark")
- /why-sark (title: "WHY SARK? - Sark Soul Island Retreats")
- /spring (title seen as "SPRING | My Site 3 - Island Retreats" in one index entry, "SPRING | Sark Soul Retreats" in another)

**Homepage themes:** 6 night yoga and wellness retreats, daily yoga, vegetarian meals, wild swimming, island walks, deep relaxation, observatory visits and stargazing, indoor and outdoor swimming pools, 15% Sark ferry discount code on booking.

**Why Sark themes:** car-free island ("with no cars and no fumes, every breath feels lighter"), first Dark Sky Island in the world, wellness and slow living, community ("find your tribe").

**Spring retreat page:** 7 day, 6 night retreat. Twice daily yoga, pranayama and meditation in a private yoga studio, all levels. Private chef, organic produce from the gardens. Optional add-ons: massage therapy, Reiki, breathwork and ice bath. £350 deposit at booking. Booking-open dates on the page are stale (November 8 and November 30).

## Issues on the live site to fix at migration, not carry over

1. **The house is named publicly.** The spring page names the farmhouse. The rebuild guardrail is absolute: only "the retreat house" or "our historic farmhouse". Do not migrate the name, and flag it for removal from the live Wix site now.
2. **Wix default site name in a title tag.** One indexed title for /spring is "SPRING | My Site 3 - Island Retreats". "My Site 3" is the Wix placeholder. Worth fixing on the live site immediately for SEO, independent of the rebuild.
3. **Retreat length mismatch.** The live site sells a 6 night spring retreat; the September 2026 retreat is five nights, 12 to 17 September. The new intent pages use the September facts. Reconcile /spring and /retreats-on-sark content at migration.
4. **Stale booking dates.** The November booking-open dates on /spring predate the current cycle.

## Facts harvested that may be useful for migrated page drafts

These are true of the current offer per the live site and can inform drafts, subject to John's confirmation: private yoga studio, indoor and outdoor pools at the house, observatory visits, 15% ferry discount code for booked guests, £350 deposit, wild swimming, add-on treatments (massage, Reiki, breathwork, ice bath).
