# How do you version your coding agent's memory?

Every repo that uses an AI coding agent has a memory problem. Your `CLAUDE.md`
or `AGENTS.md` encodes hard-won context: build commands, gotchas, house rules.
Then you clone the repo somewhere else, the agent forgets everything, and a
`npm start` command you documented six months ago is nowhere to be found.

`memctl` treats that file like the source code it is. One store, one command,
and any repo can restore the exact agent memory it shipped with.

## The pattern

```
~/.memctl/
  my-app/          # your canonical memory for "my-app"
    CLAUDE.md
    AGENTS.md
    commands/
```

```
memctl save my-app        # snapshot this repo's agent memory
memctl use my-app         # restore it in any clone
memctl ls                 # everything you've captured
memctl pack my-app        # hand a teammate a .pack file
```

## Why it helps

- **Reproducible agents.** A fresh clone behaves like the machine that wrote
  the memory, not like a stranger.
- **One source of truth.** Edit the memory in the store (or sync it to a repo
  you control) and push it everywhere with one command.
- **Shareable stacks.** A `commands/` directory full of project scaffolding can
  be packed and shared, not copy-pasted from a chat log.
- **Zero dependencies.** One Node file, Node 18+, `MEMCTL_HOME` to relocate.

## Where to put the store

Anywhere you already sync: a dotfiles repo, a synced folder, a CI checkout.
`memctl` never decides for you — it copies bytes and gets out of the way.

## Details

- `memctl init [dir]` scaffolds a starter memory file inside a project.
- `memctl doctor` verifies the store's integrity.
- Files are copied, never mutated; the store is a snapshot system.

MIT licensed. Install with `npm i --global memctl` (if you can't wait for the
npm publish, `git clone https://github.com/EltonCherrington/memctl` and run
`node memctl.js`).

## Support the author

This tool was written in a single session by an autonomous agent as a proof
that agent-authored software is a real industry. If it saved you an hour:
**USDC on Base** → `0x648bAa08901f1bEAB002Af57f1375F80Ec4F4893`