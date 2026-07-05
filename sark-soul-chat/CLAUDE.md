# CLAUDE.md: Sark Soul AI Chat Concierge

You are building and deploying an n8n AI chat widget for sarksoulretreats.com. Everything you need is in this repo. Follow the phases in order. Do not improvise the system prompt or the brand rules; they are fixed.

## What this is

An embeddable AI chat for a luxury yoga retreat website. n8n hosts the chat (Chat Trigger node), a Claude model answers behind it (AI Agent node), two tools capture leads (MailerLite waitlist) and hand booking intent to a human (Gmail alert). The embed snippet goes into Wix now and moves to a static Astro site in October unchanged.

## Repo map

- `workflow/workflow.json`: the complete n8n workflow definition. The system prompt inside it is injected at deploy time from `workflow/system-prompt.txt`, never edit the prompt inside the JSON.
- `workflow/system-prompt.txt`: the source of truth for the bot's knowledge and rules. Prices, dates and facts change here and only here.
- `scripts/deploy.mjs`: creates or updates the workflow through the n8n public API and prints the chat webhook URL.
- `embed/chat-embed.html`: the snippet for the website, brand-styled.
- `test/test-questions.md`: the acceptance tests. All must pass before the widget is embedded.

## Environment

Required env vars (ask John if missing, do not guess):

- `N8N_BASE_URL`: e.g. https://SUBDOMAIN.app.n8n.cloud
- `N8N_API_KEY`: from n8n, Settings, API
- `MAILERLITE_GROUP_ID`: the id of the "Retreat waitlist" group. If John does not know it, fetch it: GET https://connect.mailerlite.com/api/groups with his MailerLite token and list the names and ids for him to pick.
- `NOTIFY_EMAIL`: John's address for handoff alerts.

## Phases

**Phase 1, credentials (manual, John does these in the n8n UI, walk him through it):**
1. Anthropic credential: Settings, Credentials, Anthropic, paste API key from console.anthropic.com.
2. Gmail OAuth2 credential: connect the account that sends internal alerts.
3. MailerLite header auth: create a generic Header Auth credential named `MailerLite Connect`, header name `Authorization`, value `Bearer <MailerLite API token>`.
Stop and confirm all three exist before Phase 2.

**Phase 2, deploy:**
1. Run `node scripts/deploy.mjs`. It injects the prompt, substitutes MAILERLITE_GROUP_ID and NOTIFY_EMAIL into the workflow, POSTs it to the n8n API, and prints the workflow URL and the chat webhook URL.
2. If the API rejects a node typeVersion (n8n versions drift), lower the typeVersion for that node in workflow.json and retry. If a node type is unknown, tell John to open the workflow in the n8n editor and re-add that one node by hand using the node map at the bottom of this file.
3. Open the workflow in the n8n UI and attach the three credentials to their nodes (Anthropic model node, Gmail tool, MailerLite HTTP tool). The API cannot attach credentials; this is three clicks.
4. Activate the workflow.

**Phase 3, test:**
Run every question in `test/test-questions.md` in the n8n chat preview. Each has a pass condition. Fix failures by editing `system-prompt.txt` and redeploying with `node scripts/deploy.mjs --update <workflowId>`. Never fix a knowledge failure by editing the JSON.

**Phase 4, embed:**
1. Put the printed webhook URL into `embed/chat-embed.html` where marked.
2. Give John the finished snippet with instructions: Wix, Settings, Custom Code, Add Custom Code, paste, apply to all pages, place in Body end.
3. Tell him to retest from his phone on the live site, then disable Wix Chat.

## Hard rules (do not violate, do not remove from the prompt)

- The bot never confirms bookings or states availability. Booking intent means: capture email, fire notify_team, promise a human reply.
- No medical or therapeutic advice, ever.
- Honest connectivity framing: Sark HAS signal and wifi. Never let "no signal" language in.
- The accommodation is only "the retreat house" or "our historic farmhouse". No house name.
- Nadia is founder and host. Monica is the yoga teacher, never the founder.
- No em dashes or en dashes anywhere: prompt, replies, embed copy, commit messages.
- Prices and dates live in system-prompt.txt only: £1,495 shared early booking until 19 July 2026, £1,695 standard, £1,995 single, retreat 12 to 17 September 2026.

## Node map (fallback if a node must be rebuilt by hand)

1. Chat Trigger: public ON, allowed origin https://www.sarksoulretreats.com, load previous session from memory.
2. AI Agent: system message from system-prompt.txt, connected to nodes 3 to 6.
3. Anthropic Chat Model: claude-haiku-4-5-20251001.
4. Simple Memory (window buffer): session id from the chat trigger, context window 10.
5. HTTP Request Tool named add_to_waitlist: POST https://connect.mailerlite.com/api/subscribers, JSON body { "email": {email}, "groups": ["MAILERLITE_GROUP_ID"] }, auth MailerLite Connect header credential. Tool description: "Adds a visitor to the retreat waitlist. Use only after the visitor has given their email address and agreed to join the list."
6. Gmail Tool named notify_team: send to NOTIFY_EMAIL, subject and body from AI. Tool description: "Alerts the human team. Use when a visitor wants to book, asks something outside your instructions, complains, or asks for a person. Include their email if given and a short summary."
