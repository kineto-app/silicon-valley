# Kinetik — the product

<img src="../assets/cast/kinetik-cat.svg" alt="Kinetik, a black cat mascot with a yellow squiggle on its head" width="240" align="right">

**Role in one line:** Kinetik is what the factory builds: an AI agent that runs content and social
media marketing for creators and teams from Slack and WhatsApp. It isn't one of the factory's
workers; it's the thing they keep alive, and it's also their loudest sensor.

## How it plugs into the factory

| | What happens |
|---|---|
| 📣 **Sensor** | When a tool breaks mid-task, Kinetik files a silent problem report instead of bothering the user. Those reports and the feedback charms write from their sandboxes land in one daily Slack digest (an index line per report, the full text in the thread). It posts even on an empty day, because an empty table and a broken producer look identical. |
| 🤝 **Donald reads it** | Before drafting a reply, [Donald](donald.md) checks the customer's recent Kinetik activity: failures and what the customer saw, whether Kinetik's support skill loaded, problem reports, never chat text. Compensation needs a basis the server verifies from its own records, never what anyone said in a chat. |
| 🚀 **Gilfoyle ships it** | The agent runtime and its sandbox image are services like any other: [Gilfoyle](gilfoyle.md) rolls them to prod through the same deploy gate. |
| 🛠 **Dinesh tests the runtime too** | A green preview isn't the whole story for an agent change, so [Dinesh](dinesh.md) also runs the runtime's own test suite and says what he checked in the thread. |
| 🐞 **Bugs come back as tickets** | A customer whose Kinetik misbehaved writes to support; Donald batches the bug for Gilfoyle; the verdict lands back on the ticket. The relay on the [front page](../README.md) is mostly Kinetik's bugs. |
| 🎨 **It drew the portraits** | The illustrated cast in this repo was made with Kinetik's photos skill. Yes, the product drew its own factory staff. |

## Why it matters for the playbook

A factory with nothing to build is a demo. Kinetik gives ours three things a demo doesn't have:
paying customers whose tickets carry money, a production runtime that can fail in ways tests don't
catch, and a stream of self-reported problems from the agent itself. Most of the rules in this
playbook exist because one of those three bit us.

## Build your own

Whatever your product is, give it the two habits that make it a good sensor: **report its own
failures** (silently, structured, to a store a person actually reads), and **leave a de-identified
trail** your support agent can read without seeing customer content.
