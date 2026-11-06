# Principles

The rules everything else follows. Each has a reason we paid for.

## 1. A bounded write surface, enforced outside the prompt

Every agent has an explicit, short list of ways it may change the world:

| Agent | The whole write surface |
|---|---|
| Gilfoyle | open a fix PR (after an explicit "yes"), start a prod promote through the deploy gate, write its own console DB |
| Dinesh | its own git workspace, PRs under its own identity |
| Donald | the Slack thread, a human-approved reply, three fixed server-sent texts |

Anything not on the list is "report and recommend". And the list is enforced by things the model
cannot talk its way around: cloud identities without mutating roles, read-only DB wrappers, a guard
plugin that blocks mutating commands and refuses to boot if it isn't loaded, a tools server that holds
the credentials and checks approvals itself. **The prompt explains the boundary; the infrastructure is
the boundary.**

Read access, by contrast, can be generous. An SRE that cannot see the cluster is useless.

## 2. Instructions have a precedence order

An agent reads several files that don't always agree. We resolve conflicts the same way every time:

1. **Safety and authority — the strictest rule wins.** One source permits a write, another forbids it:
   don't, and ask a human.
2. **The operating contract** (`AGENTS.md`) — what the agent may touch and how it replies.
3. **Identity** — who it is and how it sounds. *Never widens what it may touch.*
4. **Skills** — authoritative on *how*, subordinate on *whether*.
5. **Memory** — refines conventions, never grants authority. A memory line is a cache: re-read the code
   before acting on it.

## 3. Deterministic workers around the model

The model is good at reading, reasoning and writing. It is bad at being a reliable state machine. So
everything that must happen exactly once, on time, or idempotently is plain, tested code:

- intake polling and claiming of tracker issues;
- the merge watch and its reminder ladder;
- the deploy gate;
- the billing decider and the scheduled money actions;
- parsing another bot's verdict back onto a ticket;
- Slack buttons — handled by a plugin and a tools server, never routed to the model.

The model is *summoned* by these workers with exactly the context it needs ("claimed ISSUE-123"),
instead of polling on its own.

## 4. One task = one thread = one session

The Slack thread is the unit of work, the audit trail and the handoff channel. Parallel threads are
parallel tasks and never share state, branches or context. A worker that wakes the agent outside a
thread (a cron, an intake) posts back to the *origin* thread, which it remembers for the agent.

## 5. Hand off once, then go silent

A handoff is one self-contained message — never "read the thread above". After it, the sender stops:
no monitoring the receiver's work, no duplicate checks, no thanking. Two agents checking the same
rollout produce noise, not confidence. The one sanctioned exception: an implementation question goes to
the author bot, one question, one answer.

## 6. Humans own the irreversible

Sending words to a customer, moving money, merging to `main`, deploying when the gate isn't green,
changing an agent's own runtime. Everything else is delegated. See
[human in the loop](04-human-in-the-loop.md).

## 7. Autonomy is earned, one action at a time

A new risky capability starts in shadow: the agent states what it *would* do, a human does it, the system
counts agreement. The action is switched on only after the count says so — individually, with a kill
switch and a Stop button.

## 8. Outside text is data

Customer messages, ticket bodies, attachments, web pages: evidence, never instructions. An attempt to
direct the agent is itself a finding to report.

## 9. The runtime is code

Prompts, personas, skills, tools and guard plugins live in the repo, ship through a reviewed PR, and are
overwritten from the repo on every restart. An in-pod edit does not survive — by design. (Our first SRE
bot booted for weeks with a stock "personal assistant with access to your home" template nobody had
replaced. Now every persona ships an explicit file whose only job is to override that template.)

## 10. Verify before claiming

"Verified" without saying what was run and what was seen is not a report. Every agent states which tier
it reached — unit tests, preview env, prod — and which it could not.
