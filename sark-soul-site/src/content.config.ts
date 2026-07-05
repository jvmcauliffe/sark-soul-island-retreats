import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// pages: the five intent pages plus migrated pages. John drops copy files
// here, build notes are parsed into this frontmatter, copy stays verbatim
// in the markdown body. The filename is the slug.
const pages = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(155),
    eyebrow: z.string(),
    heroLine: z.string(),
    heroShot: z.string().default('Hero photograph, Sark'),
    ogImage: z.string().optional(),
    isRetreatPage: z.boolean().default(true),
    darkStrip: z
      .object({
        eyebrow: z.string(),
        title: z.string(),
        body: z.string(),
      })
      .optional(),
    nadiaQuote: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    ctaTitle: z.string().default('Ready to slow down?'),
    ctaLine: z.string().optional(),
  }),
});

// journal: articles from the Story Bank pipeline, newest first on the index.
const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    date: z.coerce.date(),
    author: z.string().default('Nadia'),
    heroShot: z.string().default('Article hero photograph, Sark'),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { pages, journal };
