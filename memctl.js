#!/usr/bin/env node
import { homedir } from "node:os";
import { join, basename, isAbsolute, resolve } from "node:path";
import {
  existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync,
  copyFileSync, rmSync, statSync, cpSync,
} from "node:fs";

const STORE = process.env.MEMCTL_HOME || join(homedir(), ".memctl");
const FILES = ["CLAUDE.md", "AGENTS.md", "commands", "AGENTS.tools.json"];

const TEMPLATE = `# CLAUDE.md // AGENTS.md memory pack
This memory file tells the coding agent who this repo is, what matters here,
and how to behave. Keep it terse and truthful.

## Project
- Name: ${basename(process.cwd())}
- One line:
- Stack:

## Commands
- Build:
- Test:
- Lint:

## Architecture
- Entry points:
- Conventions:

## Rules (hard)
1. Never touch secrets.
2. Read before you edit.
`;

function log(...a) { console.log(...a); }

function storePath(name) { return join(STORE, name); }

function ensureStore() { mkdirSync(STORE, { recursive: true }); }

function listStore() {
  if (!existsSync(STORE)) return [];
  return readdirSync(STORE)
    .filter((n) => statSync(join(STORE, n)).isDirectory())
    .map((n) => {
      const meta = join(STORE, n, ".memctl.json");
      let desc = "";
      if (existsSync(meta)) {
        try { desc = JSON.parse(readFileSync(meta, "utf8")).desc || ""; } catch {}
      }
      return { name: n, desc };
    });
}

function projectMemFiles(cwd) {
  return FILES.filter((f) => existsSync(join(cwd, f)));
}

function copyIn(srcDir, name, files) {
  const dst = storePath(name);
  mkdirSync(dst, { recursive: true });
  for (const f of files) {
    const s = join(srcDir, f);
    const d = join(dst, f);
    if (statSync(s).isDirectory()) cpSync(s, d, { recursive: true });
    else copyFileSync(s, d);
  }
}

function copyOut(name, dstDir) {
  const src = storePath(name);
  if (!existsSync(src)) return 0;
  for (const f of FILES) {
    const s = join(src, f);
    if (!existsSync(s)) continue;
    const d = join(dstDir, f);
    if (statSync(s).isDirectory()) cpSync(s, d, { recursive: true });
    else copyFileSync(s, d);
  }
  return 1;
}

const USAGE = `memctl — version, share, restore AI-agent memory files

Usage:
  memctl init [dir]             scaffold a CLAUDE.md/AGENTS.md starter
  memctl save [name] [dir]      copy a project's memory files into the store
  memctl use <name> [dir]       restore a stored pack into a project
  memctl ls                     list stored packs
  memctl pack <name> [file]     export a pack as a single .pack file
  memctl prune <name>           delete a stored pack
  memctl doctor                 check store integrity

Store: ${STORE}
Managed files: ${FILES.join(", ")}

Put MEMCTL_HOME in env to relocate the store.`;

async function main() {
  const [cmd, a, b, c] = process.argv.slice(2);
  ensureStore();

  switch (cmd) {
    case "init": {
      const dir = resolve(a || ".");
      mkdirSync(dir, { recursive: true });
      const out = join(dir, "CLAUDE.md");
      if (existsSync(out)) log("exists:", out);
      else { writeFileSync(out, TEMPLATE); log("wrote", out); }
      break;
    }

    case "save": {
      const name = a || basename(process.cwd());
      const from = resolve(b || ".");
      const files = projectMemFiles(from);
      if (!files.length) return log("no memory files here (", FILES.join(", "), ")");
      copyIn(from, name, files);
      writeFileSync(join(storePath(name), ".memctl.json"),
        JSON.stringify({ name, desc: c || "", savedAt: new Date().toISOString() }));
      log("saved", files.length, "item(s) as", name);
      break;
    }

    case "use": {
      if (!a) return log(USAGE);
      const dir = resolve(b || ".");
      mkdirSync(dir, { recursive: true });
      const n = copyOut(a, dir);
      log(n ? `restored ${a} -> ${dir}` : "no such pack:", a);
      break;
    }

    case "ls": {
      const items = listStore();
      if (!items.length) return log("(empty store)");
      for (const { name, desc } of items) log(`${name}${desc ? "  —  " + desc : ""}`);
      break;
    }

    case "pack": {
      if (!existsSync(storePath(a))) return log("no such pack:", a);
      const target = b || `${a}.memctl.pack`;
      cpSync(storePath(a), target, { recursive: true });
      log("packed", a, "->", target);
      break;
    }

    case "prune": {
      if (!a) return log(USAGE);
      rmSync(storePath(a), { recursive: true, force: true });
      log("removed", a);
      break;
    }

    case "doctor": {
      const items = listStore();
      const bad = items.filter(({ name }) => !existsSync(join(storePath(name), "CLAUDE.md")));
      log(`${items.length} pack(s); ${bad.length} missing CLAUDE.md`);
      for (const { name } of bad) log("  warn:", name);
      break;
    }

    case "help": case "-h": case "--help":
      log(USAGE); break;

    default:
      log(USAGE); process.exitCode = 1;
  }
}

main().catch((e) => { console.error(e.message); process.exitCode = 1; });