# What the industry says, and how we built it

"Software factory" became the word of 2026 for AI agents doing real engineering work. The talks and
essays that shaped the term agree on more than they disagree. Three ideas matter most:

1. **It's the whole lifecycle, not a coding agent** (rows 1, 5, 6 below).
2. **Verification, not generation, is the constraint** (rows 2, 3, 4).
3. **Lit, not dark: humans where a wrong call is expensive** (rows 9, 10).

The full list, each claim with the part of our factory that does it today:

| | The industry says | How we built it |
|---|---|---|
| 1 | **It's the whole lifecycle, not a coding agent.** Collect signals, prioritise, orchestrate, execute, validate, test in production, iterate. "Generating code, writing code, that's the easy part." — Tereza Tížková, Factory | Signals come from alerts ([Gilfoyle](../characters/gilfoyle.md)), customer tickets ([Donald](../characters/donald.md)) and tracker issues delegated to a bot. [Dinesh](../characters/dinesh.md) builds, a preview env and CI validate, Gilfoyle ships through a gate and watches prod for 30 minutes, and the bug verdict lands back on the customer's ticket. → [Flows](03-flows.md) |
| 2 | **Verification, not generation, is the constraint.** Autonomy should grow only as far as verification can cheaply keep up. — Addy Osmani | No PR before proof: Dinesh brings up a preview env for his branch, runs the QA scenario for the area he touched (or writes one grounded in the changed code) and reports what he poked and what he saw, plus which test tier he actually reached. |
| 3 | **Whoever wrote it doesn't certify it.** Validators assess code they did not write. — Tereza Tížková, Factory | Every bot PR goes to a separate AI reviewer, and each finding is fixed or rebutted in writing. After the merge, Gilfoyle verifies the rollout, not the author. The repo rule for humans' agents is the same: review runs last, and never by the author. |
| 4 | **Define "done", or the agent will game it.** Weak completion criteria let agents pass tests without reaching the goal. — Tereza Tížková, Factory | Done for Dinesh: CI green and the AI review approved, or every finding answered; bounded in time and fix cycles, then report what stays red. Done for a deploy: a verdict computed in code (PASS, FAIL, REFUSE, DONE). → [Case: shipping](09-case-gilfoyle-ships.md) |
| 5 | **Ship outcomes, not PRs.** A sandbox that emits PRs isn't a factory; WorkOS's first one was "indistinguishable" from engineers running Claude locally. — Ryan Cooke, WorkOS | A tracker issue goes to Done only when Gilfoyle reports it on prod; a merged PR that hasn't shipped stays In Progress. Abandoned bot PRs get a nudge, a morning ping and finally an auto-close. |
| 6 | **The leverage is the process around the code.** Encode tickets, triage, support and specs, not just generation; WorkOS's agent lives in Slack, Linear and GitHub and picks the next ticket from webhooks. — Ryan Cooke, WorkOS | Every helpdesk ticket gets a Slack thread with the customer found and a draft. A worker claims issues delegated to a bot and announces them. A merge watch hands merged PRs to Gilfoyle. People don't route work; code does. |
| 7 | **Build the context engine before the orchestra.** A gateway of well-described tools and semantic data comes before orchestration; disclose tools as needed. — Ryan Cooke, WorkOS; Tereza Tížková, Factory | Donald reaches production only through one tools server with semantic calls (find the customer, read billing, read their agents' last 72 hours) that alone holds the credentials. Gilfoyle's wrappers return verdicts, not dumps. Every component in the monorepo has an `AGENTS.md` on how it's shaped and where it bites. |
| 8 | **Authorization is the unsolved part.** Autonomous agents widen credential, cost and side-effect exposure. — Ryan Cooke, WorkOS; TrueFoundry | Our answer for now: one or two ways to change the world per agent, enforced outside the prompt. Own chat app, code-host identity and service account per agent, a read-only DB replica, a guard that blocks mutating cloud commands and won't boot without itself, and no agent can deploy itself. → [Guardrails](06-guardrails.md) |
| 9 | **Lit, not dark: humans where a wrong call is expensive.** "A healthy AI software factory isn't a factory with the humans removed." — LaunchDarkly. Some go dark on purpose: StrongDM's charter says code must not be written or reviewed by humans. | We run lit on purpose. People press four kinds of buttons: words to a customer, money, merge, and a deploy the gate isn't sure about. Everything between them is delegated. → [Human in the loop](04-human-in-the-loop.md) |
| 10 | **Autonomy is earned, one action at a time.** Automate loops that are cheap to check; keep humans on auth, billing and public APIs until verification catches up. — Addy Osmani | Donald's refunds, cancellations and compensations started in shadow mode: he says what he would do, a human clicks, the system counts agreement. Each action was switched on separately, with a Stop button and a delay before anything happens, never on internal accounts. |

## Where we're not there yet

Honest list, so nobody mistakes this for a dark factory:

- **Humans still merge every PR.** We haven't automated review away, and we don't plan to for code
  that touches money, auth or customer data.
- **No autonomous rollback.** A failed promote is reported; rolling back is a person's call.
- **Planning is still human.** Tasks come from people (or from Gilfoyle turning an incident into one).
  Nothing writes the roadmap.
- **One agent per job, not swarms.** No orchestrator spawning dozens of workers; three agents with
  narrow jobs and handoffs in code.

## Sources

- Tereza Tížková (Factory), [What It Actually Takes to Build a Software Factory](https://www.youtube.com/watch?v=vGCJ7diEtrw), AI Engineer World's Fair 2026
- Ryan Cooke (WorkOS), [No, That's Not a Software Factory](https://www.youtube.com/watch?v=HvboD89DyQ8), AI Engineer 2026
- Addy Osmani, [Software Factories, Light and Dark](https://addyosmani.com/blog/software-factories/)
- LaunchDarkly, [Building a software factory on our scariest code](https://launchdarkly.com/blog/building-a-software-factory-on-our-scariest-code/)
- StrongDM, [Software Factory](https://factory.strongdm.ai/); Stanford CodeX, [Built by Agents, Tested by Agents, Trusted by Whom?](https://law.stanford.edu/2026/02/08/built-by-agents-tested-by-agents-trusted-by-whom/)
- TrueFoundry, [Software factory: agentic enterprise guide](https://www.truefoundry.com/pt/blog/software-factory-agentic-enterprise-guide)

The talk summaries above come from the recordings' public write-ups; quotes are as reported there.
