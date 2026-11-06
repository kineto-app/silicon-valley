# Operations: memory, failures, cost

Agents are services. They need the same things services need: state that survives restarts, failure
handling, and a bill someone reads.

## Memory: files, a budget, and curation

No vector store, no automatic recall. What an agent remembers at the start of a turn is exactly what the
bootstrap loaded:

| File | Holds | Rule |
|---|---|---|
| `MEMORY.md` | durable one-liners: root causes, conventions, gotchas | fixed character budget; silently truncated past it |
| `memory/YYYY-MM-DD.md` | the day's detail: evidence, recipes, observations | default write target; today's and yesterday's load at bootstrap |
| `memory/people.md` | identity resolution only (commit aliases, who owns what) | never assessments of people |
| `memory/review-queue.md` | suspect entries for a human to settle | |

Rules that keep it useful:

- **Grep before you conclude.** Nothing is recalled for you; a "new" error may be in last Tuesday's note.
- **Curate on write.** Replace a stale line; don't append a near-duplicate. A surviving contradiction will
  eventually be the line the agent acts on.
- **Third person, named actor.** "Gilfoyle found…", not "User did…" when the actor was the bot.
- **A weekly compaction job** merges `MEMORY.md` back under budget, moving detail to dated notes and
  dropping nothing outright.
- "A fat `MEMORY.md` is self-inflicted amnesia."

## Failures

- **One silent retry.** A failed tool call is an implementation detail, not a reportable event.
- **Escalate visibly, once.** A data source still down after the retry gets one line in the *final*
  reply — what's broken and what it blocks — with a mandatory mention of the tooling owner. A
  degraded verdict that silently omits what the dead tool would have shown is worse than a tagged one.
- **A dead turn is not a status update.** Resume and finish.
- **Watch the watchers.** A watchdog job regularly checks that every enabled scheduled job has actually run,
  and posts when one hasn't.

## Cost

- Each agent can answer "what did this thread / day cost?" from its **own** transcript store, priced with
  a pinned price table — not from estimates.
- Model choice per context: a faster model in high-traffic channels, a deeper one in DMs and long
  investigations. The agent says so when a human wants more depth than the channel's model gives.
- Small wrappers that return verdicts instead of raw dumps are the biggest single cost lever.

## Upgrades and migrations

We moved the dev bot from one agent harness to another while it was in use. What made it safe:

- the old contour held at zero replicas *and* its CI trigger removed in config, as the rollback;
- the switches that must flip together (chat enabled, jobs enabled, intake channels) flipped together,
  with a test that drives both states — half-flipped is neither cutover nor rollback;
- a written rollback order, and an observation window before removing the old contour.
