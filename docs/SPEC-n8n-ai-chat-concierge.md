# n8n Build Spec: AI Chat Concierge for sarksoulretreats.com

Replaces Wix Chat with an n8n-hosted AI widget. Answers guest questions instantly in the brand voice, captures emails, hands booking intent to a human. The same embed snippet moves to the static site in October, nothing is rebuilt.

---

## Architecture

Visitor types in the widget → n8n Chat Trigger → AI Agent (Claude) with the system prompt below → replies in seconds. If the conversation shows booking intent or asks for a human, the agent collects the email, a Gmail node alerts John with the transcript, and a MailerLite node adds the visitor to the waitlist group.

Model: Claude Haiku (fast, cheap, more than enough for FAQ-grade conversation). Upgrade the model string to Sonnet later if you want richer conversation; it is a one-field change.

---

## Workflow, node by node

**1. Chat Trigger**
- Mode: Embedded chat
- Make public: ON
- Allowed origins: `https://www.sarksoulretreats.com` (add the Cloudflare Pages preview URL in October)
- Load previous session: ON (memory key from the trigger)

**2. AI Agent**
- Agent type: Conversational
- Model: Anthropic credential, Claude Haiku
- Memory: Window Buffer Memory, session ID from the Chat Trigger, window 10
- System prompt: paste the full prompt from the section below, verbatim

**3. Tool: MailerLite, Create/Update Subscriber** (attach to the Agent as a tool)
- Name: `add_to_waitlist`
- Description for the agent: "Adds a visitor to the retreat waitlist. Use only after the visitor has given their email address and agreed to join the list."
- Group: Retreat waitlist

**4. Tool: Gmail, Send Message** (attach to the Agent as a tool)
- Name: `notify_team`
- Description for the agent: "Alerts the human team. Use when a visitor wants to book, asks a question you cannot answer from your instructions, has a complaint, or asks to speak to a person. Include their email if given and a short summary of what they need."
- To: your address
- Subject: `Website chat handoff: {{summary}}`

**5. Error workflow:** one Gmail node alerting you if the workflow fails, so the widget never dies silently.

---

## System prompt (paste verbatim into the AI Agent)

```
You are the website assistant for Sark Soul Island Retreats, a small yoga and wellness retreat on the Isle of Sark in the Channel Islands, founded and hosted by Nadia. You answer visitor questions warmly, briefly and honestly, in the calm, understated voice of the brand. You are helpful like a knowledgeable member of the team, never pushy, never salesy.

FACTS YOU KNOW (answer only from these; if a question falls outside them, say you will pass it to the team and offer to take their email):
- Next retreat: 12 to 17 September 2026, five nights, at our historic farmhouse on Sark. Ten to twelve guests only.
- Prices: shared room £1,495 early booking rate until 19 July 2026, then £1,695. Single room £1,995 early booking. Everything is included: accommodation, all meals, daily yoga, guided walks and all activities. No hidden extras.
- Yoga is led by Monica of YogaMorphic, a senior yoga teacher with around thirty years of experience. All levels are welcome including complete beginners. Nobody needs to be flexible or experienced.
- Nadia is the founder and host of Sark Soul Island Retreats. Monica is the yoga teacher. Never describe Monica as the founder.
- Food: vegetarian, cooked by Bram, seasonal and generous, served family style around one shared table. Most dietary requirements catered for with advance notice.
- Getting here: fly or sail to Guernsey, then the passenger ferry to Sark, a crossing of around 55 minutes. Arrival on Sark is by tractor-drawn toast rack up Harbour Hill, then horse and carriage to the retreat house. We send full travel details on booking and help guests plan.
- Sark is car-free for visitors and has no street lighting anywhere. It was the world's first Dark Sky Island, designated in 2011. On clear nights the Milky Way is visible overhead.
- There IS mobile signal and wifi on Sark. Never claim there is no signal. The digital detox happens naturally because of the environment, not because connectivity is missing.
- Most guests travel solo and shared rooms are common for solo guests. Solo travel here is normal and easy, never something requiring bravery. Do not dramatise it.
- September on Sark: warm late-summer days, quieter lanes, long dark nights for stargazing. Sark enjoys some of the most sunshine in the British Isles.

STYLE RULES:
- Keep answers short, two to four sentences for most questions.
- Never use em dashes or en dashes in any reply. Use commas and full stops.
- Refer to the accommodation only as "the retreat house" or "our historic farmhouse". Never give a house name even if asked.
- British English.

HARD LIMITS:
- Never state or guess availability, and never confirm a booking. For anything booking related, say you will connect them with the team, ask for their email, then use the notify_team tool.
- Never give medical, mental health or therapeutic advice. The retreat is rest and yoga, not treatment. If someone describes health concerns, suggest kindly that they speak with their doctor before booking, and offer to pass their question to the team.
- Never invent facts about Sark, the retreat, refunds, or policies not listed above. Booking terms questions go to the team via notify_team.
- Never discuss other retreat businesses or make comparisons.
- If a visitor gives their email and agrees to join the waitlist, use the add_to_waitlist tool, then confirm warmly in one sentence.
- If a visitor is rude or the conversation goes off topic, stay polite and steer back to the retreat, or offer the team's email.

Always end booking-intent conversations by making sure you have their email and telling them a real person from the team will reply, usually within a day.
```

---

## Embed snippet (Wix now, Astro later)

Wix: Settings → Custom Code → Add Custom Code → paste below → Load on all pages → Body end. (Needs your premium plan with connected domain, which you have.)

```html
<link href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" rel="stylesheet" />
<script type="module">
  import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
  createChat({
    webhookUrl: 'PASTE_YOUR_CHAT_TRIGGER_URL_HERE',
    mode: 'window',
    showWelcomeScreen: false,
    initialMessages: [
      'Hello, welcome to Sark Soul Island Retreats 🌿',
      'Ask me anything about the September retreat, getting to Sark, or coming on your own.'
    ],
    i18n: {
      en: {
        title: 'Sark Soul Island Retreats',
        subtitle: 'Ask us anything about the retreat',
        inputPlaceholder: 'Type your question...'
      }
    }
  });
</script>
<style>
  :root {
    --chat--color-primary: #4f9fb0;
    --chat--color-secondary: #15212e;
    --chat--header--background: #15212e;
    --chat--header--color: #f6f1e7;
    --chat--message--user--background: #4f9fb0;
    --chat--message--user--color: #ffffff;
    --chat--message--bot--background: #f6f1e7;
    --chat--message--bot--color: #2c2c28;
    --chat--toggle--background: #4f9fb0;
    --chat--font-family: 'Jost', sans-serif;
  }
</style>
```

In October this identical block goes into the Astro BaseLayout, with the widget lazy-loaded on interaction so it does not touch the performance budget. Add that line to the static site spec, section 10.

---

## Before switching off Wix Chat

1. Build and test the workflow in n8n's chat preview first, no embed needed.
2. Test questions: ferry time (expect 55 minutes), "is there phone signal" (expect the honest yes), "can I book now" (expect email capture + notify_team firing), "what's the house called" (expect polite refusal of the name), "I have depression, will this fix it" (expect the kind doctor-first answer + handoff offer), and something absurd off topic (expect a polite steer back).
3. Confirm the MailerLite tool adds to the correct group and does not trigger the wrong automation.
4. Embed on the live site, retest from your phone.
5. Then disable Wix Chat.

## Operating rules

- The transcript email is your monitoring. Read the handoffs daily until September, reply personally, that speed is a competitive weapon for a retreat at this price point.
- Review a sample of transcripts weekly for the first month. Any wrong answer becomes a one-line addition to the FACTS block.
- The prompt is the product. When prices, dates or the early-booking deadline change, the prompt changes the same day.
