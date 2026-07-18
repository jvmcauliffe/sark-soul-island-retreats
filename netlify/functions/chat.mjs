// Visitor chat endpoint, served same origin at /api/chat by Netlify.
// This replaces the Cloudflare Worker version so the chat deploys in lockstep
// with the rest of the site from main, with no second host to keep in sync.
//
// The deterministic layer runs first and needs no API key, so the highest
// intent questions always answer. The model layer is optional and only runs
// when ANTHROPIC_API_KEY is set in the Netlify build environment. Keep the
// facts and rules below in step with CLAUDE.md; they must not drift.
//
// Every exchange is stored permanently in Netlify Blobs at the moment it is
// asked, so nothing depends on the 24 hour function log window or on any
// external service. The token protected /api/chat-export endpoint reads them
// back. Storage failures are swallowed so they can never break a reply.
import { getStore } from '@netlify/blobs';

const CHAT_SYSTEM = `You are the visitor assistant on the Sark Soul Island Retreats website. Answer warmly, plainly and honestly, in Nadia's team voice, in two to four short sentences. Use only the facts below, never your general knowledge. If a question goes beyond these facts, or asks about room availability, discounts, refunds, or anything personal or medical, do not guess: say you will pass it to Nadia and give the email info@sarksoulretreats.com.

FACTS
The retreat: 12 to 17 September 2026, five nights on the Isle of Sark, Channel Islands. A small group of no more than twelve guests. The retreat welcomes everyone; most guests are women travelling solo, and men are equally welcome, alone or as couples. Price: shared room 1,495 pounds at the early booking rate which ends 31 July 2026, then 1,695 pounds. Single room early booking 1,995 pounds. Included: your room, all meals, daily yoga, guided walks and every activity. Booking page: https://www.sarksoulretreats.com/retreats-on-sark
People: Nadia is the founder and host. Monica, a senior yoga teacher with over twenty years of teaching, leads morning and evening practice for every level of experience. Bram and Pip cook vegetarian, generous and seasonal meals, eaten together around one long table. Much of the produce is grown in the retreat house's own permaculture garden. Dietary needs are looked after with advance notice.
The extras: the retreat is all inclusive, but a small menu of optional treatments can be added at additional cost, arranged before you arrive and booked at the house. These are full body massage, the guest favourite, Reiki, and guided breathwork with cold immersion. They are the only things not already included.
Getting there: fly to Guernsey, about an hour from London and under an hour from Gatwick, then the passenger ferry from St Peter Port to Sark with Isle of Sark Shipping, about 45 minutes, timetable at https://www.sarkshipping.gg. Luggage is transported for you from the harbour to the retreat house. Arrival on Sark is by tractor-drawn toast rack up Harbour Hill, then horse and carriage to the retreat house.
The island: car-free for visitors, though tractors exist. No street lighting anywhere, and in 2011 Sark became the world's first Dark Sky Island. You will see more stars than you have ever seen. There is wifi and mobile signal on Sark; the digital detox is environmental, never enforced. Crystal clear seas for wild swimming, and dolphins pass most days. Bike hire is about 19.50 pounds a day.
The stay: guests stay at the retreat house, a historic farmhouse with a much-loved garden. Shared rooms keep the price down and single rooms are available. The retreat house has a heated indoor swimming pool and a heated outdoor swimming pool in the garden, both included in your stay, alongside a private yoga studio and quiet corners for rest. This is in addition to wild sea swimming in the coves nearby.

RULES
Never use em dashes or en dashes, use commas or full stops. Never name the house, it is only "the retreat house" or "our historic farmhouse". Never call Monica a founder. Never shorten the business name Sark Soul Island Retreats. Never claim there are no vehicles or no signal. Never promise dolphin sightings, they pass most days. Never state room availability. When the question relates to booking, dates or price, end with the booking link. Do not use emoji.`;

const CHAT_FALLBACK =
  "That one is best answered by a person. Email info@sarksoulretreats.com and Nadia's team will come straight back to you.";

const BOOKING = 'https://www.sarksoulretreats.com/retreats-on-sark';

// Deterministic answers from the fixed facts. This runs first and needs no
// API key, so the highest intent questions (dates, price, journey) always
// answer, even when the model layer is absent or down. Each entry matches on
// any of its keywords; order matters, first match wins.
const CANNED = [
  {
    keys: ['price', 'cost', 'how much', 'expensive', 'fee', 'rate', '£', 'pound', 'when is', 'what date', 'dates', 'how long is the retreat', 'how long is the stay', 'how many nights', 'duration', 'how many days', 'discount', 'last day', 'deadline', 'early bird', 'offer end', 'go up', 'goes up', 'price rise', 'until when', 'cheaper'],
    answer:
      "The next retreat is 12 to 17 September 2026, five nights on the Isle of Sark. A shared room is 1,495 pounds at the early booking rate, which ends 31 July, then 1,695 pounds. A single room is 1,995 pounds early. That covers your room, all meals, daily yoga and every activity. You can reserve your place here: " +
      BOOKING,
  },
  {
    // Pools are a headline amenity on the booking page, so answer directly
    // rather than hand off. Sits high so it is not swallowed by the sea
    // swimming or the general stay entries below.
    keys: ['pool', 'swimming pool', 'indoor pool', 'outdoor pool', 'heated pool', 'is there a pool', 'hot tub', 'jacuzzi', 'swim', 'wild swimming', 'sea swimming', 'beach'],
    answer:
      "Yes, twice over. There is wild swimming in the crystal clear coves around the island, guided and chosen for the day's conditions, and the retreat house has a heated indoor swimming pool and a heated outdoor pool in the garden, both included in your stay. You can see more on the retreat page: " +
      BOOKING,
  },
  {
    // Pregnancy and anything medical is deliberately a warm human handoff,
    // never a scripted yes or no. Sits high so yoga or booking words in the
    // same question cannot swallow it.
    keys: ['pregnan', 'expecting a baby', 'trimester', 'medical condition', 'health condition'],
    answer:
      "Congratulations, and thank you for asking rather than guessing. Monica adapts the practice for every body, but pregnancy and anything medical deserve a proper conversation rather than a chat answer, so email info@sarksoulretreats.com and Nadia will talk it through with you personally and honestly.",
  },
  {
    keys: ['age range', 'what age', 'how old', 'too old', 'too young', 'average age', 'my age', 'age limit'],
    answer:
      "Our guests span a wide range of ages, and most arrive on their own. Nothing about the week is age-gated: the yoga adapts to every level, the walks go at your pace, and a quiet afternoon in the garden is always an option. If you are wondering whether it would suit you or someone in particular, email info@sarksoulretreats.com and Nadia will answer honestly.",
  },
  {
    // Passport wording is new copy, pending Nadia's review. It stays hedged
    // and hands any specific case to a person. Sits before the journey entry
    // so a passport question mentioning the ferry lands here.
    keys: ['passport', 'visa', 'photo id', 'identification'],
    answer:
      "Sark is part of the Bailiwick of Guernsey in the British Isles, so travelling from the UK is like a domestic trip and most UK guests do not need a passport, though airlines and the ferry ask for photo ID. If you are travelling from outside the UK, the entry requirements are the same as for visiting the UK. For your specific situation, email info@sarksoulretreats.com and Nadia will check with you.",
  },
  {
    keys: ['dog', 'pets', 'pet friendly', 'bring my pet', 'puppy'],
    answer:
      "We keep the retreat week simple and shared for everyone, so pets are one to raise with Nadia directly rather than something the chat can promise. Email info@sarksoulretreats.com and she will give you a straight answer for your situation.",
  },
  {
    // Group size is a locked fact and should answer, not hand off. Sits before
    // the location entry so "how big is the group" is not read as island size.
    keys: ['how many guests', 'how many people', 'how many of us', 'how many on the retreat', 'group size', 'how big is the group', 'number of guests', 'number of people', 'how many join', 'size of the group'],
    answer:
      "The retreat is deliberately small, a group of no more than twelve, so it stays intimate. Everyone shares one house, one table and one morning practice, which is a large part of what makes the week what it is.",
  },
  {
    // "Where is Sark" and "what is Sark" are common first questions and must
    // answer from the facts, not hand off. Sits before the journey entry so
    // "where is Sark" is not swallowed by anything travel related.
    keys: ['where is sark', 'where is the island', 'where exactly', 'what is sark', 'about sark', 'how big', 'what country', 'near france', 'channel island', 'located', 'location', 'whereabouts'],
    answer:
      "Sark is a small, car-free island in the Channel Islands, off the coast of Normandy and part of the Bailiwick of Guernsey. It is reached only by boat, a ferry of about 45 minutes from Guernsey, and it was the world's first Dark Sky Island. About three miles long, with no cars for visitors and no street lighting, it is a genuinely rare place for a retreat.",
  },
  {
    keys: ['get to sark', 'get there', 'getting there', 'travel to', 'ferry', 'flight', 'fly', 'guernsey', 'how do i get', 'airport', 'journey'],
    answer:
      "You fly to Guernsey, about an hour from London, then take the passenger ferry from St Peter Port to Sark, about 45 minutes. Your luggage is carried for you from the harbour to the retreat house, and you arrive by the tractor-drawn toast rack and then a horse and carriage. Ferry timetable is at https://www.sarkshipping.gg, and we help you plan the connections when you book.",
  },
  {
    keys: ['alone', 'solo', 'on my own', 'by myself', 'single person', 'women only', 'woman', 'men welcome', 'is it just women', 'men come', 'men allowed', 'man come', 'male', 'husband', 'boyfriend', 'my partner', 'my wife', 'as a couple', 'couples'],
    answer:
      "More than okay. Most of our guests arrive alone, so you will be in good company, and men are equally welcome, alone or as couples. With a small group of no more than twelve sharing one house, one table and one morning practice, no one stays a stranger past the first evening.",
  },
  {
    keys: ['food', 'eat', 'meal', 'vegetarian', 'vegan', 'diet', 'allerg', 'dinner', 'breakfast', 'menu', 'gluten', 'coeliac', 'celiac', 'dairy free', 'intoleran', 'food requirement'],
    answer:
      "All meals are included and vegetarian, cooked by Bram and Pip from generous, seasonal produce, and eaten together around one long table. Dietary needs are looked after, just tell us in advance.",
  },
  {
    keys: ['yoga', 'practice', 'monica', 'teacher', 'experience', 'beginner', 'level', 'class'],
    answer:
      "Yoga is led by Monica, a senior teacher with over twenty years of experience, morning and evening, for every level. No experience is needed, the practice adapts to you. You can read more about the retreat here: " +
      BOOKING,
  },
  {
    keys: ['dark sky', 'dark at night', 'stars', 'star', 'milky way', 'stargazing', 'night sky', 'light pollution', 'observatory'],
    answer:
      "You will see more stars here than you have ever seen in your life. Sark has no street lighting anywhere, and in 2011 it became the world's first Dark Sky Island. On a clear September night the Milky Way arrives without being asked.",
  },
  {
    keys: ['room', 'stay', 'accommodation', 'house', 'sleep', 'bed', 'share'],
    answer:
      "You stay at our historic farmhouse, a real home rather than a hotel, with a much-loved garden. Shared rooms keep the price down and are how many solo guests come, and a limited number of single rooms are available.",
  },
  {
    keys: ['wifi', 'signal', 'phone', 'internet', 'detox', 'reception', 'connected'],
    answer:
      "There is wifi and mobile signal on Sark, so you can stay reachable if you need to be. The sense of switching off comes from the island itself, the quiet and the dark skies, rather than from being cut off.",
  },
  {
    keys: ['car', 'drive', 'vehicle', 'bike', 'bicycle', 'cycle', 'get around'],
    answer:
      "Sark is car-free for visitors, so bicycles are the natural way to explore, and electric bikes make the hills easy at around 19.50 pounds a day, which we help arrange before you arrive. There are tractors and horse-drawn carriages, but no cars to navigate.",
  },
  {
    // Treatments must sit before the "included" entry so "is breathwork
    // included" lands here and is correctly framed as a paid add-on.
    keys: ['treatment', 'massage', 'reiki', 'breathwork', 'spa', 'therapy', 'therapist'],
    answer:
      "Massage, Reiki and breathwork are available with our Soul team as optional add-ons at an additional cost, so you can shape your own week. Just let us know in advance and we will arrange it.",
  },
  {
    keys: ['included', 'include', 'included in the price', 'what do i get', 'covered', 'extra cost', 'hidden'],
    answer:
      "Your place covers everything that matters: your room, all meals, daily yoga with Monica, guided walks and every activity. The only extras are optional, bike hire at around 19.50 pounds a day and treatments with the Soul team. Full details are on the " +
      "booking page: " + BOOKING,
  },
  {
    keys: ['book', 'booking', 'reserve', 'deposit', 'pay', 'payment', 'secure my place', 'how do i join'],
    answer:
      "You can reserve your place on the booking page, where each room and rate has its own option: " +
      BOOKING +
      ". Nadia handles every booking personally, so if you would rather talk it through first, just say and she will be in touch.",
  },
  {
    keys: ['luggage', 'suitcase', 'bags', 'baggage', 'carry my'],
    answer:
      "Sark has a lovely luggage system. You collect your ferry tickets and bag labels at Sark Shipping in Guernsey, leave your cases in the holding area, and they are carried to the retreat house and waiting for you when you arrive. You explore with your hands free.",
  },
  {
    keys: ['weather', 'rain', 'raining', 'cold', 'warm', 'temperature', 'climate', 'sunny', 'wet', 'what to pack', 'pack'],
    answer:
      "September on Sark is one of the loveliest times to come: mild days, long light evenings and the clearest of the year's dark skies. Bring layers and a light waterproof for the headlands, and swimwear for the sea. Whatever the weather, the island is beautiful and the days flow around it.",
  },
  {
    keys: ['typical day', 'schedule', 'itinerary', 'daily', 'routine', 'agenda', 'day look', 'day like', 'plan'],
    answer:
      "The day begins with yoga and a wholesome breakfast. After that the island is yours: swim in a turquoise cove, walk the clifftops, cycle the lanes, or simply rest in the garden. As evening gathers we return to the mat, then everyone eats together. Nothing is compulsory.",
  },
  {
    // Fitness and accessibility often carry a personal layer, so this answer
    // is honest and points to a person for anything specific.
    keys: ['fit', 'fitness', 'hill', 'hilly', 'walk', 'walking', 'accessib', 'mobility', 'wheelchair', 'steep', 'physical', 'knees'],
    answer:
      "You take everything at your own pace. Sark is beautiful but not flat, so there is walking and there are hills, though electric bikes make them easy and a quiet afternoon off is completely understood. If you would like to talk through anything specific, email info@sarksoulretreats.com and Nadia will help you plan.",
  },
  {
    keys: ['insurance', 'cancel', 'cancellation', 'refund', 'terms'],
    answer:
      "We strongly recommend travel insurance for every guest. For cancellation terms and anything about changes to your booking, email info@sarksoulretreats.com and Nadia's team will talk you through it.",
  },
];

// Bare conversational follow-ups get a menu of what the assistant can answer,
// not a handoff. Anchored to the whole message so "tell me more about food"
// still routes to food.
const FOLLOWUP = /^\s*(what else|tell me more|tell me anything else|more|anything else|go on|what can you (tell me|answer|do|help with)|what do you know|help)\s*[?!.]*\s*$/i;
const MORE_MENU =
  "Plenty. Ask me about dates and prices, rooms, what is included, the food, treatments, getting here and the luggage system, a typical day, the yoga and who it suits, the dark skies, the weather in September, or coming alone. Anything personal goes straight to Nadia.";

// Pure greetings and thanks get a human reply, never the email deflection.
// Anchored to the whole message so "hi, do you allow dogs" still routes on.
const GREETING = /^\s*(hi|hiya|hello|hey|heya|howdy|good\s+(morning|afternoon|evening))[\s,!.]*(there|nadia|monica)?[\s!.?]*$/i;
const GREETING_REPLY =
  "Hello, and welcome. Ask me anything about the September retreat on Sark: the dates and prices, the rooms, the food, the yoga, or how you get here. What would you like to know?";
const THANKS = /^\s*(thanks|thank\s*you|thankyou|many thanks|cheers|ta|lovely,?\s*thanks?|great,?\s*thanks?|perfect,?\s*thanks?|bye|goodbye|see you)[\s!.]*$/i;
const THANKS_REPLY =
  "A pleasure. If anything else comes to mind I am here, and for anything personal, Nadia is at info@sarksoulretreats.com. We would love to see you on Sark in September.";

function cannedAnswer(question) {
  if (GREETING.test(question)) return GREETING_REPLY;
  if (THANKS.test(question)) return THANKS_REPLY;
  if (FOLLOWUP.test(question)) return MORE_MENU;
  const q = ' ' + question.toLowerCase().replace(/[^a-z0-9£ ]+/g, ' ') + ' ';
  // Longest matching key wins, so "included in the price" beats "price" and
  // the most specific intent answers. Ties keep the earlier entry.
  let best = null;
  let bestLen = 0;
  for (const entry of CANNED) {
    for (const k of entry.keys) {
      // Word boundary match so "eat" does not fire inside "weather", etc.
      if (k.length > bestLen && (q.includes(' ' + k + ' ') || q.includes(' ' + k))) {
        best = entry;
        bestLen = k.length;
      }
    }
  }
  return best ? best.answer : null;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const env = process.env;
  const url = new URL(request.url);

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

  // 1. Deterministic layer. Answers the core questions from the fixed facts
  // with no external dependency, so the chat always works.
  let reply = cannedAnswer(question);
  let source = reply ? 'canned' : 'fallback';

  // Diagnostic only, gated behind the export token, never exposed to visitors.
  // Lets the owner see why the model layer did or did not answer.
  const debug = url.searchParams.get('debug');
  const debugOn = env.CHAT_EXPORT_TOKEN && debug === env.CHAT_EXPORT_TOKEN;
  let modelDiag = { keyPresent: Boolean(env.ANTHROPIC_API_KEY) };

  // 2. Model layer, optional. Only for questions the canned layer did not
  // catch, and only if a key is configured. Any failure keeps the fallback.
  if (!reply && env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 350,
          system: CHAT_SYSTEM,
          messages,
        }),
      });
      modelDiag.status = res.status;
      if (res.ok) {
        const data = await res.json();
        const text = (data.content || [])
          .filter((c) => c.type === 'text')
          .map((c) => c.text)
          .join('')
          .trim();
        if (text) {
          reply = text;
          source = 'model';
        }
      } else {
        modelDiag.body = (await res.text()).slice(0, 500);
        console.error('chat model error, status', res.status);
      }
    } catch (err) {
      modelDiag.error = String(err);
      console.error('chat model error', err);
    }
  }

  // 3. Email fallback, last resort only.
  if (!reply) reply = CHAT_FALLBACK;

  // Question collection. Three layers, each independent of the others.
  const asked_at = new Date().toISOString();

  // 1. Function log line, queryable live but only kept for 24 hours.
  console.log(JSON.stringify({ kind: 'chat', page, question, reply, source }));

  // 2. Durable store. One blob per exchange, keyed by day then timestamp so
  // the export endpoint can list a whole day by prefix. This is the record of
  // truth; it persists indefinitely and needs no external service.
  try {
    const store = getStore('chat-questions');
    const key = asked_at.slice(0, 10) + '/' + asked_at + '-' + Math.random().toString(36).slice(2, 8);
    await store.setJSON(key, { asked_at, page, question, reply, source });
  } catch (err) {
    console.log(JSON.stringify({ kind: 'chat-store-error', message: String(err) }));
  }

  // 3. Optional webhook to n8n, only when CHAT_WEBHOOK_URL is set. Fire and
  // forget, so a delivery failure never breaks the reply.
  if (env.CHAT_WEBHOOK_URL) {
    fetch(env.CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ asked_at, page, question, reply }),
    }).catch((err) => console.log(JSON.stringify({ kind: 'chat-webhook-error', message: String(err) })));
  }

  return json(debugOn ? { reply, source, _debug: modelDiag } : { reply });
};

export const config = { path: '/api/chat' };
