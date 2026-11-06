# Handoff contract

Write one of these for every pair of agents that talk. Both agents' contracts reference it.

## <Sender> → <Receiver>: <what is handed off>

| Field | Value |
|---|---|
| **Trigger** | <event that causes the handoff — e.g. "PR merged" seen by the merge-watch worker> |
| **Sent by** | <the agent, or a deterministic worker on its behalf> |
| **Where** | <the origin thread / a shared channel> |
| **Message** | self-contained: <required fields, e.g. PR number, services, tracker issue> |
| **Receiver treats it as** | <e.g. "a deploy request — the merge was the decision"> |
| **Machine-readable reply** | <e.g. a fixed `VERDICT` block, one line per item — parsed by code, not by a model> |
| **Sender after handoff** | silent, except: <one sanctioned exception> |
| **Accepted senders** | <the agent's bot id; humans>. Any other bot is ignored. |
| **Failure** | <no reply in N hours → a named human, once> |

## Example: merge watch → SRE

| Field | Value |
|---|---|
| Trigger | a PR registered by the dev bot is merged |
| Sent by | the merge-watch worker |
| Where | the task's origin thread |
| Message | `PR #N merged → @SRE roll to prod: backend, frontend [ISSUE-123]` |
| Receiver treats it as | the deploy request; runs the deploy gate end to end |
| Machine-readable reply | `ISSUE-123 on prod` → the dev bot closes the issue |
| Sender after handoff | silent; answers implementation questions about the diff, once |
| Accepted senders | the dev bot's id; humans |
| Failure | gate not green → explicit approval from an authorized human |

## Example: support → SRE bug batch

| Field | Value |
|---|---|
| Trigger | on a schedule, when bugs are queued; at once for a paying customer |
| Where | a public troubleshooting channel; root has no customer data |
| Message | per ticket: symptom, time, admin links, moments found in the product logs (never chat text), earlier open items |
| Machine-readable reply | `VERDICT` block: `#ticket — join #N / not a bug / not enough data / new — reason` |
| Failure | an unreadable line, a missing ticket, or no verdict after a day → a named human |
