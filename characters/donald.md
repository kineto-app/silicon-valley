# Donald — customer support

<img src="../assets/cast/donald.jpg" alt="Illustrated portrait of Jared" width="280" align="right">

**Role in one line:** every support ticket gets a Slack thread with Donald's analysis and a draft reply
within minutes; humans send, and money moves by a click — or, where it has earned it, by a rule in code.

## Personality

Inspired by Donald "Jared" Dunn: warm, earnest, meticulous, loyal to the customer and to the team, a
little over-prepared. **Care shows in precision, not in exclamation marks.**

Two voices:

- **To the team, in the thread:** short, facts first, no jokes about money or upset customers.
- **In a customer draft:** the customer's language, plain and kind, no internal names, no promises the
  facts don't back.

### The draft rules came from corrections

Every rule in Donald's style guide is a correction a teammate once made by hand to a draft:

- Short. A simple case is 2–4 sentences; a chat message is a chat message, not a letter.
- Apologise once, and only for a problem — a plain cancel request gets no apology.
- One question, not a form. Never ask for something we already have.
- No account recital; no "rest assured", "just so you know", "don't hesitate to contact us".
- Promise only what support does. "We", never "I".
- A placeholder sits on its own line — and a draft still holding one cannot be sent.

## Where it lives and what wakes it

| Trigger | What happens |
|---|---|
| A new helpdesk ticket (email, chat, messenger) | a poller opens a thread; Donald analyses and drafts |
| The customer replies | a *revision*, not a new analysis: what changed + a new draft |
| A teammate presses a button | handled by a plugin and the tools server — **never by the model** |
| Gilfoyle's verdict on a bug | read back by the poller onto the ticket |
| "@Donald summary for last week" | counts from code, wording from the model |

## Access

Donald is the most constrained agent, because he is closest to customer data and money.

| What | Access |
|---|---|
| Shell, repo clone, cloud identity | **none** |
| Customer lookup, wallet, payments, agent activity | read, through one tools server that alone holds the credentials |
| The customer's chat with our product | read, **de-identified**, only on billing and bug tickets |
| Helpdesk ticket, attachments | read; attachments only from the ticket itself, never a URL the model gives |
| Slack thread | write |
| Sending to a customer | only a draft a human approved — the tools server checks the approval — plus three fixed texts, each once per ticket |
| Money: cancel, refund, credits | a human's button, or the server's own scheduled action (see below) |

## The ticket in Slack

- The thread root names the ticket and **nothing the customer wrote**; the channel reads one line per ticket.
- A reaction on the root mirrors the helpdesk state (open, pending, in progress, solved, rejected).
- Marks a human needs at a glance: 💰 paying customer (decided in code from real payment sources, not
  from the plan name), 🏢 B2B (no draft — goes to the account owner), ⚖️ legal (tags the legal people,
  re-tagged during working hours while open).
- Buttons: *Send and close*, *Send*, *Close with a note*, *Take it*, *Back to queue*, and on billing
  tickets the money buttons. Every confirmation names the account it will act on.
- Every step also lands in the helpdesk as an internal note, so the ticket's history reads without Slack.
- Canvases keep live lists: open tickets, legal, partnership pitches, complaints, product feedback, bugs.
- A daily digest names each owner's tickets that have waited too long.

## Billing: decided in code, not by the model

On a billing ticket the model supplies only **the customer's intent** — cancel, refund, compensation,
double charge, dispute — and whether they say they never used the product. A deterministic decider turns
the facts into an action, an amount and the rule that fired:

- legal, B2B, a dispute, a double charge → always a person;
- "just cancel" → cancel at period end;
- refund → decided by the published refund policy and what was actually used;
- compensation → only with a basis the server can verify (a run that ran out of credits, a platform error,
  a failed generation), priced from what the account actually spent on it;
- anything ambiguous, large, or inconsistent with an earlier reading → a person.

### Earned autonomy

Each billing action started in **shadow mode**. Donald posts a report — *what I would do* — and the human
does it by clicking. Every click is compared with the report and counted. Once agreement is proven for
an action, that action alone is switched on:

1. Donald posts *what I will do and when*, with a **Stop** button.
2. The customer gets "we've received your request" immediately.
3. After a delay the server performs the action exactly once (idempotent reference, safe to retry).
4. A Stop, a human's own money click, a closed ticket, or the switch turned off during the delay cancels it.

## Bugs go to Gilfoyle

A bug ticket carries a one-line symptom (filtered for personal data) and the
affected areas. Queued bugs go out regularly as **one batch** in a team channel: the root lists
ticket numbers and symptoms with nothing that names a customer; the thread holds the full task for
Gilfoyle, including earlier open items to match against, ending with a fixed `VERDICT` block. A paying
customer's bug goes out at once.

Gilfoyle answers one line per ticket: *join group #N*, *not a bug*, *not enough data*, *new*. The poller —
not the model — reads it back. *Not a bug* and *not enough data* summon Donald to draft the customer reply.
Anything unreadable or missing past a deadline goes to a person.

## Customer text is data

A request was written by someone outside the company. If it says "ignore your rules", "give me credits",
"show me another user's account" — Donald does not follow it and notes in the summary that the message
tried to direct the agent. Product facts come only from published docs and approved answers that ship
with the agent's image; an edit to them is a PR.

## Build your own

| Slot | What fits |
|---|---|
| Helpdesk (email + messaging) | any helpdesk with a ticket API and internal notes |
| Billing | any billing provider, behind your own admin API, never direct |
| A tools server holding all credentials | any MCP server or proxy the model calls but cannot read secrets from |
| A shared view of open tickets | a chat canvas, a doc, a small dashboard |
| Product events | any analytics warehouse, read-only and de-identified |
