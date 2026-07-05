# Page copy files

John drops the five intent page copy files here:

- yoga-retreat-sark.md
- digital-detox-retreat.md
- solo-retreat-women.md
- burnout-retreat.md
- dark-sky-retreat.md

The filename is the slug. Parse each file's build notes into the frontmatter
schema in src/content.config.ts (metaTitle, metaDescription, eyebrow,
heroLine, heroShot, darkStrip, nadiaQuote, faqs, ctaTitle, ctaLine), keep the
page copy verbatim as the markdown body. Do not rewrite supplied copy.

Migrated pages (Home, Why Sark, The Practice, Our Story, Meet the Team,
Retreats and booking, FAQ, Getting to Sark guide) are built as dedicated
.astro pages when John pastes the live Wix copy, applying only the known
fixes listed in CLAUDE.md.
