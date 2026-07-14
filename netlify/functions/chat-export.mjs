// Reads back the chat questions stored by chat.mjs in Netlify Blobs.
// Protected by a token so only the owner can pull the archive. Set
// CHAT_EXPORT_TOKEN in the Netlify environment to a long random string, then
// fetch:
//   /api/chat-export?token=YOURTOKEN                 all questions, JSON
//   /api/chat-export?token=YOURTOKEN&format=csv      all questions, CSV
//   /api/chat-export?token=YOURTOKEN&since=2026-07-14 from that day onward
//
// There is no daily job to miss: every question was already saved the moment
// it was asked, so this endpoint simply returns whatever has accumulated.
import { getStore } from '@netlify/blobs';

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'x-robots-tag': 'noindex' },
  });
}

function csvCell(value) {
  const s = value == null ? '' : String(value);
  return '"' + s.replace(/"/g, '""') + '"';
}

function toCsv(rows) {
  const cols = ['asked_at', 'page', 'source', 'question', 'reply'];
  const lines = [cols.join(',')];
  for (const r of rows) {
    lines.push(cols.map((c) => csvCell(r[c])).join(','));
  }
  return lines.join('\n');
}

export default async (request) => {
  const env = process.env;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!env.CHAT_EXPORT_TOKEN || token !== env.CHAT_EXPORT_TOKEN) {
    return json({ error: 'unauthorized' }, 401);
  }

  const since = url.searchParams.get('since');
  const format = url.searchParams.get('format') || 'json';

  let keys = [];
  try {
    const store = getStore('chat-questions');
    const listed = await store.list();
    keys = (listed.blobs || []).map((b) => b.key);

    // Keys start with the YYYY-MM-DD day, so a string compare filters by date.
    if (since) keys = keys.filter((k) => k.slice(0, 10) >= since);
    keys.sort();

    const rows = [];
    for (const key of keys) {
      const item = await store.get(key, { type: 'json' });
      if (item) rows.push(item);
    }

    if (format === 'csv') {
      return new Response(toCsv(rows), {
        status: 200,
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="sark-chat-questions.csv"',
          'x-robots-tag': 'noindex',
        },
      });
    }

    return json({ count: rows.length, questions: rows });
  } catch (err) {
    return json({ error: 'store unavailable', message: String(err) }, 500);
  }
};

export const config = { path: '/api/chat-export' };
