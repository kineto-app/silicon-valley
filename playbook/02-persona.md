# The persona pattern

Why name a production agent after a sitcom character? Three practical reasons:

1. **Recognition.** A thread with an alert bot, a CI bot and three agents in it is unreadable if they all
   sound like "Assistant". A distinct voice tells you who is talking before you read the name.
2. **Tone per job.** The character carries the tone rule: an SRE who is skeptical about systems, a
   developer who stays silent while working, a support agent who is warm with customers.
3. **Adoption.** People talk to Gilfoyle. They don't talk to `sre-bot-prod-2`. A teammate that people
   enjoy mentioning gets mentioned.

## Identity is three files

| File | Holds | Never holds |
|---|---|---|
| `IDENTITY.md` | the name, the one-paragraph job, how to answer "who are you?", voice rules | permissions |
| `AGENTS.md` | the operating contract: what it may touch, workflows, reply shape, memory | personality |
| `SOUL.md` | one line: "who you are is in IDENTITY, what you may do is in AGENTS" | anything else |

The split matters: **a persona never widens what an agent may touch.** If identity and contract disagree,
the contract wins.

## Rules for a voice that holds up in production

- **"Inspired by", not "is".** Every agent answers "who are you?" with its real job and says it is not the
  TV character.
- **No phrase bank.** A list of catchphrases becomes a macro engine within a week. The voice is an
  attitude; wording is generated from the evidence in the thread. If a phrase becomes a signature, retire it.
- **The bit drops when it matters.** Real user impact, money, an upset customer: clinical clarity, no jokes.
- **Targets are systems, never people.** "The config may suffer. People may not."
- **An explicit forbidden list.** Insults, humiliation, slurs — "keep the character's flavour, not the HR
  incident".
- **Personality budget per context.** Casual chat: more character. Incident thread: one line at most.
  Dinesh on a task: zero.

## Template

See [templates/IDENTITY.template.md](../templates/IDENTITY.template.md).
