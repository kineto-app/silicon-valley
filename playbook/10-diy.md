# We sell nothing. You buy nothing.

There is no product behind this playbook, and we didn't buy one either. The whole factory is open-source
agent runtimes plus glue code we wrote ourselves. For a startup in 2026 we think that's the right call,
and this page says why, and what it costs.

## What it's made of

| Part | What it is | Who runs on it |
|---|---|---|
| [OpenClaw](https://github.com/openclaw/openclaw) (MIT) | An open-source agent runtime: chat channels, memory, tools, skills, plugins | Gilfoyle, Dinesh, Donald |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) (MIT) | An open-source agent from Nous Research | Dinesh's first home. We moved him to OpenClaw with a PR, not a contract renegotiation |
| [pi](https://github.com/badlogic/pi-mono) (MIT) | An open-source coding agent and agent toolkit | Jian-Yang, the code reviewer, inside CI |
| Our glue | The deploy gate, the command guard, the merge watch, the tracker intake, the support tools server, the review driver. Small, boring, deterministic code | Everyone. This is where the guardrails live |
| What we pay for | Model API tokens. Slack, GitHub, CI and the tracker were already there | |

## Why DIY, for a startup, right now

- **The field moves monthly.** A bought platform freezes last quarter's idea of an agent. With an
  open-source runtime and your own glue, switching runtimes is a pull request. We've done it once already.
- **The valuable part isn't for sale.** Runtimes are a commodity. The gates, guardrails, handoffs and
  "who presses which button" are specific to your stack and your team. No vendor ships those, so you
  write them anyway.
- **You need to see inside.** When an agent touches prod or money, you want to read every line between
  the model and the side effect. Open source plus your own code is the only setup where you can.
- **It's cheap to start.** Runtime: free. Glue: small deterministic code you'd have to write anyway.
  Bill: tokens. Start with one read-only agent (see [Adoption](08-adoption.md)) and grow it.

## The honest price

- **You own the upgrades.** Open-source runtimes change fast; a release can break your config. Pin
  versions and upgrade through a PR with a test.
- **You own the security.** The runtime gives you hooks, not a policy. The guard, the read-only roles and
  the "fail closed" startup checks in [Guardrails](06-guardrails.md) are your job.
- **You own the on-call for your on-call bot.** When Gilfoyle is down, a human notices. Watch the
  watchers ([Operations](07-operations.md)).

## When to buy instead

Buy when the thing is a commodity and not your process: hosted models, chat, code hosting, CI,
observability. Consider a product for a single loop you don't want to own, like a hosted code-review
bot. Build the factory floor yourself: what wakes whom, who may touch what, where a human decides.
