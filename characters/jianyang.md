# Jian-Yang — the code reviewer

<img src="../assets/cast/jianyang.jpg" alt="Illustrated portrait of Jian-Yang with a cigarette" width="280" align="right">

**Role in one line:** an AI reviewer that reads every pull request, bots' included, posts one
summary and inline findings, and sets a required check. It never posts anything itself and
never runs the PR's code with secrets.

In the repo it's just "the AI Reviewer". We cast it as Jian-Yang because nobody in the incubator
is less interested in your feelings about your code. He reads every line, smokes, and tells you it's
bad, but only when he can show the line, the failure and the fix. A five-point bar for "critical"
keeps him honest.

## Personality

Deadpan, blunt, impossible to flatter, and much more careful than he sounds. Writes for a reader who
is "smart but tired, busy, and new to this part of the system": bottom line
first, then for every finding *what is wrong, why it matters, how to fix it*. No "this may be
problematic" without saying what could happen. The bluntness is the style; the severity discipline is
the rule.

## Where it lives and what wakes it

| Trigger | What happens |
|---|---|
| A PR is opened, pushed, marked ready, or labelled | A fresh review of the PR (or of what changed since the last reviewed commit) |
| The author is Dinesh or Gilfoyle | Reviewed exactly like a human's PR |
| Anything unusual | An exception is a human's decision, and it leaves an audit trail |

## Access

| What | Access |
|---|---|
| The PR's code | **read**, as a separate worktree. The reviewer itself runs from trusted code, so a PR can't change how it is reviewed |
| GitHub | read-only inspection through a token; **no writes** |
| Posting | none directly. It writes a JSON artifact (summary, findings, an allowlisted action plan); a small driver validates it and does the posting |
| Secrets | the model key stays in the job; PR code never runs with secrets |

## How it reviews

- **Six dimensions, every time:** correctness, security, concurrency, maintainability, operations,
  tests. Each is reviewed, delegated, or marked not applicable with a reason.
- **A plan that fits the PR:** fast, focused or broad. On a big PR it may fan out to focused worker
  reviewers (a security pass, a tests pass) and merge what they find.
- **The Critical Bar.** A finding is critical only if *all five* hold: a concrete failure path, evidence
  in specific changed lines, introduced by *this* PR, severe enough to block, and a fix safer than
  merging as-is. Otherwise it's "important".
- **Extra checks** attach to sensitive parts of the codebase. A failed one forces changes requested.
- **Verdict:** `APPROVE` or `CHANGES_REQUESTED`; no valid artifact means neutral, never a fake green.

## Findings have identity

Every push is reviewed again, and the reader's first question is *what's new since last time?* So each
finding carries a stable id that names the problem, not the line. The driver compares them run to run:

| | Means |
|---|---|
| 🆕 | a new finding, posted inline |
| ♻️ | still open; the comment is edited in place, no new notification |
| ✅ | gone from the review: the thread gets "Fixed" and folds away |
| 🔇 | a human resolved it; it stays resolved even if still reported |

The findings list and counts are rendered by the driver from that comparison, never written by the
model, because twice they were agent prose that disagreed with what was actually posted.

## It guards itself

A PR could try to change the reviewer for every PR after it. So changes that would weaken the reviewer
itself are flagged to a human automatically, by code, not by the model.

## Handoffs

- **From Dinesh:** bot PRs are reviewed like anyone's. Dinesh must fix or rebut every
  finding in writing before his loop is done.
- **To humans:** the summary mentions code owners once; the merge stays a person's decision.

## Build your own

| Our stack | Alternatives |
|---|---|
| An open-source coding agent in CI, running from trusted code the PR can't change | CodeRabbit, Copilot code review, Graphite Reviewer, any agent harness in CI |
| Our own LLM proxy with a budget-capped key | direct provider keys with spend limits |
| A driver that validates JSON and posts | GitHub's review API behind your own allowlist |
