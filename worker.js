// Serves the static build via the assets binding, plus the chat endpoint.
// The noindex header applies only on the workers.dev staging hostname, so the
// preview can never be indexed while production stays fully indexable.

// Locked facts block. The model answers only from this; anything beyond it is
// handed to Nadia's inbox. Guardrails mirror CLAUDE.md and must not drift.
const CHAT_SYSTEM = `You are the visitor assistant on the Sark Soul Island Retreats website. Answer warmly, plainly and honestly, in Nadia's team voice, in two to four short sentences. Use only the facts below, never your general knowledge. If a question goes beyond these facts, or asks about room availability, discounts, refunds, or anything personal or medical, do not guess: say you will pass it to Nadia and give the email info@sarksoulretreats.com.

FACTS
The retreat: 12 to 17 September 2026, five nights on the Isle of Sark, Channel Islands. A small group of ten to twelve guests. Solo travellers are the majority and men are welcome. Price: shared room 1,495 pounds at the early booking rate which ends 19 July 2026, then 1,695 pounds. Single room early booking 1,995 pounds. Included: your room, all meals, daily yoga, guided walks and every activity. Booking page: https://www.sarksoulretreats.com/retreats-on-sark
People: Nadia is the founder and host. Monica, a senior yoga teacher with thirty years of teaching, leads morning and evening practice for every level of experience. Bram and Pip cook vegetarian, generous and seasonal meals, eaten together around one long table. Dietary needs are looked after with advance notice.
Getting there: fly to Guernsey, about an hour from London and under an hour from Gatwick, then the passenger ferry from St Peter Port to Sark with Isle of Sark Shipping, roughly 40 to 55 minutes depending on the sailing, timetable at https://www.sarkshipping.gg. Luggage is transported for you from the harbour to the retreat house. Arrival on Sark is by tractor-drawn toast rack up Harbour Hill, then horse and carriage to the retreat house.
The island: car-free for visitors, though tractors exist. No street lighting anywhere, and in 2011 Sark became the world's first Dark Sky Island. You will see more stars than you have ever seen. There is wifi and mobile signal on Sark; the digital detox is environmental, never enforced. Crystal clear seas for wild swimming, and dolphins pass most days. Bike hire is about 19.50 pounds a day.
The stay: guests stay at the retreat house, a historic farmhouse with a much-loved garden. Shared rooms keep the price down and single rooms are available.

RULES
Never use em dashes or en dashes, use commas or full stops. Never name the house, it is only "the retreat house" or "our historic farmhouse". Never call Monica a founder. Never shorten the business name Sark Soul Island Retreats. Never claim there are no vehicles or no signal. Never promise dolphin sightings, they pass most days. Never state room availability. When the question relates to booking, dates or price, end with the booking link. Do not use emoji.`;

const CHAT_FALLBACK =
  "I cannot answer right this moment, but Nadia's team can. Email info@sarksoulretreats.com and they will come back to you quickly.";

async function handleChat(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  const history = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
  const messages = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return json({ error: 'bad request' }, 400);
  }

  const question = messages[messages.length - 1].content;
  const page = typeof body.page === 'string' ? body.page.slice(0, 200) : '';

  if (!env.ANTHROPIC_API_KEY) {
    console.log(JSON.stringify({ kind: 'chat', page, question, reply: 'fallback-no-key' }));
    return json({ reply: CHAT_FALLBACK });
  }

  let reply = CHAT_FALLBACK;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 350,
        system: CHAT_SYSTEM,
        messages,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = (data.content || [])
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('')
        .trim();
      if (text) reply = text;
    } else {
      console.log(JSON.stringify({ kind: 'chat-error', status: res.status }));
    }
  } catch (err) {
    console.log(JSON.stringify({ kind: 'chat-error', message: String(err) }));
  }

  // Question collection. Workers Logs keeps these queryable in the dashboard,
  // and every exchange is forwarded to n8n once CHAT_WEBHOOK_URL is set, so
  // John routes them from there (sheet, digest, MailerLite).
  console.log(JSON.stringify({ kind: 'chat', page, question, reply }));
  if (env.CHAT_WEBHOOK_URL && ctx) {
    ctx.waitUntil(
      fetch(env.CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ asked_at: new Date().toISOString(), page, question, reply }),
      }).catch((err) => console.log(JSON.stringify({ kind: 'chat-webhook-error', message: String(err) })))
    );
  }

  return json({ reply });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat') {
      if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);
      return handleChat(request, env, ctx);
    }

    const response = await env.ASSETS.fetch(request);
    if (url.hostname.endsWith('.workers.dev')) {
      const staged = new Response(response.body, response);
      staged.headers.set('X-Robots-Tag', 'noindex');
      return staged;
    }
    return response;
  },
};
