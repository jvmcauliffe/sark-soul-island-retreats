// Guardrail QA for the built site. Run with: npm run qa
// Enforces the CLAUDE.md guardrails and SPEC section 14 acceptance criteria
// against the HTML in dist/. Exits nonzero on any failure.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const failures = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const pages = {};
for (const file of walk(DIST).filter((f) => f.endsWith('.html'))) {
  let route = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '');
  route = route.replace(/\/$/, '') || '/';
  pages[route] = readFileSync(file, 'utf8');
}

if (Object.keys(pages).length < 10) {
  failures.push(`only ${Object.keys(pages).length} pages built, expected at least 10`);
}

// 1. Never use em dashes or en dashes anywhere in rendered output.
for (const [route, html] of Object.entries(pages)) {
  if (html.includes('–') || html.includes('—')) {
    failures.push(`${route}: em or en dash in rendered HTML`);
  }
  if (html.includes('ð') || /ð[-¿]/.test(html)) {
    failures.push(`${route}: mojibake (broken emoji encoding)`);
  }
}

// 2. Internal links resolve; booking page has at least 10 inbound links.
const existing = new Set([...Object.keys(pages), '/sitemap-index.xml', '/favicon.png', '/apple-touch-icon.png', '/robots.txt', '/404']);
let bookingLinks = 0;
for (const [route, html] of Object.entries(pages)) {
  for (const match of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const target = match[1].replace(/\/$/, '') || '/';
    if (target === '/retreats-on-sark') bookingLinks += 1;
    if (!existing.has(target) && !target.startsWith('/_astro')) {
      failures.push(`${route}: broken internal link to ${match[1]}`);
    }
  }
}
if (bookingLinks < 10) failures.push(`booking page has ${bookingLinks} inbound links, needs at least 10`);

// 3. Nadia named as founder in visible copy and schema on every page.
for (const [route, html] of Object.entries(pages)) {
  if (route === '/404') continue;
  if (!html.includes('Founded &amp; hosted by Nadia')) {
    failures.push(`${route}: attribution strip or footer NAP missing`);
  }
  if (!html.includes('"founder":{"@id":"https://sarksoulretreats.com/#nadia"}')) {
    failures.push(`${route}: founder schema missing`);
  }
  if (!html.includes('"jobTitle":"Senior Yoga Teacher"')) {
    failures.push(`${route}: Monica schema role missing`);
  }
}

// 4. Retreat intent pages carry the full battery.
const retreatPages = Object.entries(pages).filter(([, html]) => html.includes('"@type":"Event"'));
if (retreatPages.length === 0) failures.push('no pages carry Event schema');
for (const [route, html] of retreatPages) {
  if (!html.includes('"validThrough":"2026-07-19"')) failures.push(`${route}: early rate validThrough missing`);
  if (!html.includes('dark-strip')) failures.push(`${route}: DarkStrip missing`);
  if (!(html.includes('£1,495') && html.includes('£1,695') && html.includes('£1,995'))) {
    failures.push(`${route}: PriceCards amounts missing`);
  }
  if (!html.includes('\u{1F33F}')) failures.push(`${route}: NadiaNote leaf missing`);
  if (!html.includes('Reserve my place')) failures.push(`${route}: CTA missing`);
}

// 5. One H1 per page; meta title and description within limits.
for (const [route, html] of Object.entries(pages)) {
  // /styleguide is noindexed and renders every component, including the Hero
  // demo with its H1, so the one-H1 rule does not apply there.
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1 && route !== '/styleguide') failures.push(`${route}: ${h1s} h1 elements, expected 1`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
  if (title.length > 60) failures.push(`${route}: meta title ${title.length} chars, max 60`);
  const desc = html.match(/name="description" content="([^"]*)"/)?.[1] ?? '';
  if (desc.length > 155) failures.push(`${route}: meta description ${desc.length} chars, max 155`);
  if (!html.includes('rel="canonical"')) failures.push(`${route}: canonical missing`);
}

// 6. JS budget: no first party JS files shipped, at most the MailerLite loader inline.
const jsFiles = walk(DIST).filter((f) => f.endsWith('.js'));
if (jsFiles.length > 0) failures.push(`first party JS shipped: ${jsFiles.join(', ')}`);

if (failures.length) {
  console.error(`QA FAILED, ${failures.length} problem(s):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`QA PASS: ${Object.keys(pages).length} pages, ${bookingLinks} booking links, ${retreatPages.length} Event pages, zero dashes, zero JS files.`);
