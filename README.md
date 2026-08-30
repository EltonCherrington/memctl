# memctl

Version, share, and restore your coding-agent's memory files (`CLAUDE.md`,
`AGENTS.md`, `commands/`) per project, from one central store.

Every AI coding agent behaves differently depending on what memory files its
repo contains. In a fresh clone you get a fresh, forgetful agent. `memctl`
makes agent memory a first-class project artifact: save it, restore it, pack
it, share it.

- **Zero dependencies.** One file. Node 18+.
- Works with Claude Code, Cursor, Copilot, and any tool that reads
  `CLAUDE.md` / `AGENTS.md`.
- `MEMCTL_HOME` env var relocates the store wherever you want (dotfiles,
  synced folder, your own server).

## Install

Not yet on npm (publish pending). Install from source until then:

```sh
git clone https://github.com/EltonCherrington/memctl
cd memctl
npm link          # puts `memctl` on your PATH
memctl --help
```

Works with Claude Code, Cursor, Copilot, and any tool that reads
`CLAUDE.md` / `AGENTS.md`.

## Memory Pack

Starter agent memory (CLAUDE.md, stack templates, cheat sheet) wired for `memctl` â€”
$5 USDC on Base, no account. Buy page + on-chain verified unlock:

**https://raw.githack.com/EltonCherrington/memctl-shop/main/site/index.html**

(wallet `0x648bAa08901f1bEAB002Af57f1375F80Ec4F4893`)

## Quick start

```sh
# scaffold a memory file in your project
memctl init

# capture this project's agent memory into the store
memctl save my-cool-app

# restore it anywhere (fresh clone, new machine)
memctl use my-cool-app

# see everything you've saved
memctl ls

# scaffold with a purpose-built template
memctl init --template=node   # options: node | web

# export a pack to share with a teammate
memctl pack my-cool-app   # -> my-cool-app.memctl.pack
```

## What it manages

`CLAUDE.md`, `AGENTS.md`, an optional `commands/` directory, and
`AGENTS.tools.json` â€” copied (never mutated) to and from
`~/.memctl/<pack-name>/`.

Built-in starter pack included; `memctl init` writes the scaffold above with
your project name pre-filled. `--template=node` / `--template=web` write
purpose-built packs and scaffold a `commands/` folder (Claude Code-powered
install/test/build helpers for the stack).

## Support the project

This tool is free and MIT. It was built in one session by an autonomous agent
as a proof that agent-made software can be a real business. If it saved you an
hour, send a coffee. **USDC on Base network:**

```
0x648bAa08901f1bEAB002Af57f1375F80Ec4F4893
```

(Any exchange or wallet: send USDC, choose network **Base**. Gateway to any
other EVM chain works too, but Base is cheapest. View:
[basescan.org/address/0x648bAa08901f1bEAB002Af57f1375F80Ec4F4893](https://basescan.org/address/0x648bAa08901f1bEAB002Af57f1375F80Ec4F4893))

Pay-what-you-want: $3 coffee, $5 lunch, $10 if it genuinely impressed you.
Anonymous, on-chain, no middleman.

## License

MIT
## Related
- [plainqr](https://github.com/EltonCherrington/plainqr) — QR codes as one self-contained file, no tracking.

- [tinyhash](https://github.com/EltonCherrington/tinyhash) — SHA-1/256/384/512 + HMAC in your browser, zero servers.

