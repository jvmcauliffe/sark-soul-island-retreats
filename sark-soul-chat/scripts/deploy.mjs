#!/usr/bin/env node
// Deploys the Sark Soul chat workflow to n8n via the public API.
// Usage:
//   node scripts/deploy.mjs                 create new workflow
//   node scripts/deploy.mjs --update <id>   update existing workflow
//
// Required env: N8N_BASE_URL, N8N_API_KEY, MAILERLITE_GROUP_ID, NOTIFY_EMAIL

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const need = (k) => {
  const v = process.env[k];
  if (!v) { console.error(`Missing env var ${k}`); process.exit(1); }
  return v;
};

const BASE = need("N8N_BASE_URL").replace(/\/$/, "");
const KEY = need("N8N_API_KEY");
const GROUP = need("MAILERLITE_GROUP_ID");
const NOTIFY = need("NOTIFY_EMAIL");

const prompt = readFileSync(join(here, "../workflow/system-prompt.txt"), "utf8").trim();

// Guardrail check before anything ships: no em or en dashes anywhere.
const raw = readFileSync(join(here, "../workflow/workflow.json"), "utf8");
for (const [name, text] of [["system-prompt.txt", prompt], ["workflow.json", raw]]) {
  if (/[\u2013\u2014]/.test(text)) {
    console.error(`Dash found in ${name}. Fix it before deploying. This is a brand rule.`);
    process.exit(1);
  }
}

const wf = JSON.parse(raw);

// Inject prompt and env values.
const inject = (s) => s
  .replaceAll("__MAILERLITE_GROUP_ID__", GROUP)
  .replaceAll("__NOTIFY_EMAIL__", NOTIFY);

for (const node of wf.nodes) {
  if (node.name === "AI Agent") {
    node.parameters.options.systemMessage = prompt;
  }
  node.parameters = JSON.parse(inject(JSON.stringify(node.parameters)));
}

const args = process.argv.slice(2);
const updateIdx = args.indexOf("--update");
const updateId = updateIdx !== -1 ? args[updateIdx + 1] : null;

const api = async (method, path, body) => {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    headers: { "X-N8N-API-KEY": KEY, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
};

const payload = { name: wf.name, nodes: wf.nodes, connections: wf.connections, settings: wf.settings };

try {
  let saved;
  if (updateId) {
    saved = await api("PUT", `/workflows/${updateId}`, payload);
    console.log(`Updated workflow ${saved.id}`);
  } else {
    saved = await api("POST", "/workflows", payload);
    console.log(`Created workflow ${saved.id}`);
  }

  try {
    await api("POST", `/workflows/${saved.id}/activate`);
    console.log("Workflow activated.");
  } catch (e) {
    console.log("Could not activate via API (fine on some n8n versions). Activate it in the UI.");
  }

  const trigger = (saved.nodes || wf.nodes).find((n) => n.type.endsWith("chatTrigger"));
  const hook = trigger && trigger.webhookId && trigger.webhookId !== "REPLACED_ON_CREATE"
    ? `${BASE}/webhook/${trigger.webhookId}/chat`
    : null;

  console.log("\nNext steps:");
  console.log(`1. Open ${BASE}/workflow/${saved.id} and attach credentials to: Anthropic Chat Model, add_to_waitlist (MailerLite Connect header auth), notify_team (Gmail).`);
  console.log(hook
    ? `2. Chat webhook URL for the embed snippet:\n   ${hook}`
    : "2. Open the Chat Trigger node in the UI and copy its chat URL into embed/chat-embed.html.");
  console.log("3. Run the tests in test/test-questions.md in the chat preview before embedding.");
} catch (e) {
  console.error("Deploy failed:", e.message);
  console.error("If the error names a node typeVersion, lower that typeVersion in workflow/workflow.json and rerun. If it names an unknown node type, rebuild that node in the UI using the node map in CLAUDE.md.");
  process.exit(1);
}
