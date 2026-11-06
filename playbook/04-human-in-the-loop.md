# Human in the loop

The question isn't "is there a human in the loop?" but "**which** decisions are the human's, and is every
other step genuinely delegated?" A human who has to babysit every step is not in the loop — they are the loop.

## What stays with people

| Decision | Why it stays human | How the agent makes it cheap |
|---|---|---|
| **Merge to `main`** | it is the decision to ship | PR arrives tested, QA'd on a preview env, CI green, AI review answered |
| **Approve a fix PR from the SRE bot** | an SRE bot writing code is outside its normal job | the proposal names file:line, the change and the risk |
| **Deploy when the gate is not green** | the gate's evidence is ambiguous by definition | the evidence is in the thread; approval is one explicit message |
| **Free-form words to a customer** | it's our voice and our promise | a draft that follows the team's style rules, one click to send |
| **Money not yet automated** | irreversible, customer-facing | the decider's suggestion and amount are on the button |
| **Stopping an automated money action** | the delay between decision and action is the human's | a Stop button on the report |
| **Grading incident impact / escalation** | judgement about users and business | measured evidence, no adjectives |
| **Legal, B2B, disputes** | always people | tagged, listed on their own canvas, re-pinged while open |
| **Changing an agent's runtime** | prompts and tools are code | goes through a PR like any code |

## RACI

R = does it · A = accountable · C = consulted · I = informed

| Activity | Gilfoyle | Dinesh | Donald | Jian-Yang | Human |
|---|---|---|---|---|---|
| Alert investigation | **R** | | | | A, I |
| Minimal fix PR from an incident | R | | | | **A** (approve) |
| Feature / bugfix implementation | C | **R** | | | A (merge) |
| Self-QA on preview env | | **R** | | | I |
| Code review | | R (answers) | | **R** | A (merge) |
| Dev verification after merge | **R** | C (impl. questions) | | | I |
| Prod promote, gate green | **R** | | | | A (merged it) |
| Prod promote, gate red | R | | | | **A** (approve) |
| Ticket triage and customer lookup | | | **R** | | I |
| Customer reply | | | R (draft) | | **A** (send) |
| Billing action (shadow) | | | R (suggest) | | **A** (click) |
| Billing action (earned) | | | **R** | | A (Stop button) |
| Bug verdict for a ticket | **R** | | C | | I |
| Tracker status: In Progress | intake worker | intake worker | | | I |
| Tracker status: Done | | **R** (after prod) | | | I |

## Signs the line is in the wrong place

- People approve things without reading them → the gate protects nothing; move it or remove it (that's
  how the PR-opening gate went).
- People redo the agent's work → the step is not delegated, it's duplicated; fix the agent or take it back.
- An agent asks for permission for something reversible → it's a missing rule in its contract.
- Nobody notices an agent's mistake for days → the irreversible step has no human, or the human has no
  evidence in front of them.
