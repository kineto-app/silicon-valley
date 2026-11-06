# Adopting it

The order we'd do it in again, and what each step proves before the next one starts.

## Phase 1 — a read-only SRE

Start with the agent that can't break anything. Give it read access to the cluster, metrics, logs and a
DB replica; let it answer alert threads.

- **Proves:** the harness, Slack wiring, secrets, memory, the reply shape.
- **Measure:** time from alert to first useful verdict; how often a human says "wrong".
- **Tempting mistake:** giving it a write "just for restarts". Don't — not yet.

## Phase 2 — a developer that opens PRs

Add the dev bot with a workspace, its own code-host identity, preview environments and a mandatory
self-QA step. No merge rights, no deploy rights, read-only cloud behind a guard.

- **Proves:** the code → test → preview → PR loop, AI review closure, the merge watch.
- **Measure:** PRs merged vs. closed; review rounds per PR; human rework after merge.
- **Start with** a PR-opening approval gate if it makes you comfortable — and remove it once you see it
  protects nothing. Merge is the real gate.

## Phase 3 — connect them

The merge watch hands merged PRs to the SRE; the SRE runs a deterministic deploy gate. Then intake from
the tracker: issues delegated to a bot, claimed by a worker.

- **Proves:** handoffs, the "hand off once, go silent" rule, end-to-end task → prod with humans only
  at merge.

## Phase 4 — customer-facing support

The most constrained agent, last. No shell, no cloud identity, everything through a tools server that
holds the credentials. Drafts only; humans send.

- **Proves:** the style rules (every human correction becomes a rule), data handling, the bug batch to SRE.
- **Then, one action at a time:** shadow-mode billing decisions → measured agreement → switch on with a
  Stop window.

## Checklist for a new agent

- [ ] One-paragraph job and a short, explicit write surface
- [ ] `IDENTITY.md`, `AGENTS.md`, `SOUL.md` in the repo, overwritten on every start
- [ ] Own chat app, own code-host identity, own service account
- [ ] Guard plugin, fail-closed boot check, and a contract test in the shipped image
- [ ] Credentials only in wrappers / a tools server
- [ ] Deterministic workers for anything that must happen exactly once
- [ ] Handoff contract with every other agent (see [template](../templates/handoff-contract.md))
- [ ] Memory files and a compaction job
- [ ] A sentry for scheduled jobs; cost accounting
- [ ] The human decision points written down — and nowhere else

## Anti-patterns we saw or nearly built

- **The universal agent.** One bot with every permission is one prompt injection from everything.
- **Approval theatre.** Gates people click through without reading.
- **Bots supervising bots.** Two agents checking the same rollout, thanking and correcting each other.
- **Memory as a log.** Append-only notes that grow until the budget truncates the important part.
- **State in the pod.** Anything that must survive lives in the repo, the DB or the system of record.
- **The model as a scheduler.** Polling, retries and "exactly once" belong in code.
