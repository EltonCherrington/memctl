# Memory pack — Node.js service
## Project
- Name: memctl
- One line:
- Node: 20+

## Commands
- Test: node --test test.mjs
- Run: node memctl.js --help

## Architecture
- Entry: src/index.js, lib/ for reusable code
- Conventions: ESM only, no callbacks, errors throw

## Rules (hard)
1. Never touch secrets.
2. ESM imports only.
