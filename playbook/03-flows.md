# Flows

Four flows cover almost everything the agents do. In each one, look for where the human is — and how
few places that is.

## 1. Feature or bugfix: task → prod

```mermaid
sequenceDiagram
    autonumber
    actor H as Teammate
    participant N as Dinesh
    participant P as Preview env
    participant GH as GitHub (CI + AI review)
    participant W as Merge-watch worker
    participant G as Gilfoyle
    participant GT as Deploy gate

    H->>N: @Dinesh <task> (Slack thread)
    alt underdetermined
        N->>H: all clarifying questions, once
        H->>N: answers
    end
    N->>N: branch from origin/main, code, tests
    N->>P: bring up env for the branch
    N->>P: self-QA: scenario + smokes
    N->>GH: open PR (bot identity, AI review)
    N->>H: "PR #N — waiting for CI and AI review"
    N->>W: register merge watch (services from diff)
    loop until green + approved (bounded)
        GH-->>N: CI result, review findings
        N->>GH: fix or written rebuttal per finding
    end
    N->>H: final report: what, where, risk, how verified
    H->>GH: ✅ merge  (the human decision)
    W->>G: "PR #N merged → roll to prod: backend, frontend"
    G->>GT: gate dev → healthy?
    alt gate green
        G->>GT: gate promote → gate prod
    else gate not green
        G->>H: evidence + "approve?"
        H->>G: explicit approval
        G->>GT: gate promote → gate prod
    end
    G->>H: "on prod" (+ a regression check later)
    N->>N: tracker issue → Done
```

**Human touchpoints:** the task, answers if asked, the merge, an approval only if the gate is red.

## 2. Incident: alert → verdict (→ fix)

```mermaid
sequenceDiagram
    autonumber
    participant M as Monitoring
    participant G as Gilfoyle
    actor O as On-call / author
    participant N as Dinesh

    M->>G: alert posted to #alerts
    G->>G: recent change scan (commits, deploys, overrides)
    G->>G: read-only investigation: metrics, logs, traces, k8s, DB replica
    G->>O: what fired → evidence → cause → unknown → next (@author if a change correlates)
    alt minimal high-confidence fix
        G->>O: "fix at file:line, risk X — open a PR?"
        O->>G: explicit approval
        G->>G: open PR (never merge)
    else development-shaped
        G->>N: one self-contained task
        Note over N: continues as flow 1
    end
```

**Human touchpoints:** grading the impact, approving Gilfoyle's PR, merging.

## 3. Support ticket → bug → verdict → reply

```mermaid
sequenceDiagram
    autonumber
    actor Cu as Customer
    participant HD as Helpdesk
    participant P as Donald's poller (code)
    participant D as Donald (model)
    actor S as Support teammate
    participant G as Gilfoyle

    Cu->>HD: ticket
    P->>D: new thread in the support channel, summon
    D->>D: category, find customer, agent activity, (billing decider)
    D->>S: analysis + draft + buttons
    S->>HD: [Send] → approved reply to customer
    opt bug
        P->>G: batch in the bug channel (no customer data)
        G->>P: VERDICT block, one line per ticket
        P->>D: "not a bug" / "not enough data" → draft reply
        D->>S: new draft
        S->>HD: [Send]
    end
    opt real bug
        G->>G: investigate / hand to Dinesh (flow 1)
    end
```

**Human touchpoints:** every free-form word that reaches the customer; every money action not yet
switched on.

## 4. Delegated issue in the tracker

```mermaid
sequenceDiagram
    autonumber
    actor H as Teammate
    participant L as Tracker
    participant I as Intake worker (code)
    participant B as Dinesh or Gilfoyle

    H->>L: delegate ISSUE-123 to the bot (human stays assignee)
    I->>L: poll every few minutes
    I->>I: claim (exactly once), move to In Progress
    I->>H: announce a Slack thread for the issue
    I->>B: summon with "claimed ISSUE-123"
    B->>H: works it in the announced thread (flows 1–2)
    B->>L: Done — only after "on prod"
```

The worker owns the mechanics — announce, claim, status move — so the model never re-decides them and a
restart never double-claims. The model is summoned only when there is something to do.

## Message discipline across all flows

- **Short by default.** A verdict, not a diary. Long form goes in a collapsible or a file.
- **One progress message at most** (Dinesh's "PR #N — waiting"); everything else is the final report.
- **A dead turn is not a status update.** Resume and finish; never post "here's where I got to".
- **Words are for humans.** Bots don't thank, correct or lecture each other.
