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
    ogImage: z.string().optional(),
    retreatPage: z.boolean().default(true),
    darkStrip: z
      .object({
        eyebrow: z.string().default('After dark'),
        heading: z.string(),
        body: z.string(),
      })
      .optional(),
    nadiaNote: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
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
