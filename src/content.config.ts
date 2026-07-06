import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Pages: one .md per page. John's copy files carry build notes that are
// parsed into this frontmatter; the copy itself stays verbatim in the body.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
    title: z.string(),
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(155),
    slug: z.string().optional(),
    heroEyebrow: z.string().default('Sark Soul Island Retreats'),
    heroTitle: z.string().optional(),
    heroLine: z.string().default('A luxury small-group retreat on the Isle of Sark'),
    heroImage: image().optional(),
    heroImageAlt: z.string().default('Coastal clifftop at golden hour on Sark, Channel Islands'),
    heroShot: z.string().default('Hero photograph for this page'),
    heroBanner: z.string().optional(),
    heroFocus: z.string().optional(),
    heroTall: z.boolean().default(false),
    heroPlain: z.boolean().default(false),
    darkStripInline: z.boolean().default(false),
    heroBannerTop: z.boolean().default(false),
    heroCentered: z.boolean().default(false),
    heroCta: z.boolean().default(true),
    heroSub: z.string().optional(),
    heroNote: z.string().optional(),
    ogImage: z.string().optional(),
    retreatPage: z.boolean().default(true),
    guideForm: z.boolean().default(false),
    practiceBand: z.boolean().default(false),
    // Cross-link band rendered after the guide panel with page-supplied
    // copy, like the "Come join us" band on Why Sark.
    joinBand: z
      .object({
        eyebrow: z.string(),
        heading: z.string(),
        cards: z.array(
          z.object({
            eyebrow: z.string(),
            heading: z.string(),
            line: z.string(),
            label: z.string(),
            href: z.string(),
          })
        ),
      })
      .optional(),
    centerBody: z.boolean().default(false),
    darkStrip: z
      .object({
        eyebrow: z.string().default('After dark'),
        heading: z.string(),
        body: z.string(),
      })
      .optional(),
    nadiaNote: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    // Structured booking-page sections, used by /retreats-on-sark. Room and
    // feature copy lives here in frontmatter, never inside components.
    rooms: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          occupancy: z.string(),
          description: z.string(),
          rates: z.array(
            z.object({
              label: z.string(),
              price: z.string(),
              status: z.enum(['available', 'soldout']).default('available'),
              note: z.string().optional(),
              href: z.string().optional(),
              cta: z.string().optional(),
            })
          ),
          images: z
            .array(
              z.object({
                src: image().optional(),
                alt: z.string(),
                shot: z.string().optional(),
              })
            )
            .default([]),
        })
      )
      .default([]),
    includes: z
      .object({
        heading: z.string(),
        items: z.array(z.object({ icon: z.string().default(''), text: z.string() })),
      })
      .optional(),
    addOns: z
      .object({
        heading: z.string(),
        items: z.array(z.object({ icon: z.string().default(''), text: z.string() })),
        images: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      })
      .optional(),
    features: z
      .array(
        z.object({
          heading: z.string(),
          body: z.string(),
          image: image().optional(),
          alt: z.string().default(''),
          shot: z.string().default(''),
        })
      )
      .default([]),
    travel: z
      .array(
        z.object({
          heading: z.string(),
          html: z.string(),
          teal: z.boolean().default(false),
        })
      )
      .default([]),
    // Per room-and-rate booking pages, mirroring the live site's individual
    // reservation pages. No paypal link means the rate is sold out.
    booking: z
      .object({
        intro: z.string().optional(),
        rateLine: z.string(),
        deposit: z.string().default('Deposit due: £300'),
        balance: z.string().default('Balance due 45 days before arrival'),
        paypal: z.string().optional(),
        note: z.string().optional(),
        includes: z.array(z.string()),
        images: z
          .array(z.object({ src: image(), alt: z.string() }))
          .default([]),
      })
      .optional(),
  }),
});

// Journal: articles arrive over time from the Story Bank pipeline.
const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    date: z.coerce.date(),
    author: z.string().default('Nadia'),
    heroImageAlt: z.string().optional(),
    heroShot: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { pages, journal };
