import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const cli = join(root, "memctl.js");

function run(args, env) {
  return execFileSync("node", [cli, ...args], { encoding: "utf8", env });
}

test("full lifecycle in an isolated store", () => {
  const env = { ...process.env, MEMCTL_HOME: mkdtempSync(join(tmpdir(), "memctl-")) };
  const proj = mkdtempSync(join(tmpdir(), "proj-"));

  run(["init", proj], env);
  assert.ok(existsSync(join(proj, "CLAUDE.md")), "init writes CLAUDE.md");

  writeFileSync(join(proj, "CLAUDE.md"), "# tuned\n");
  writeFileSync(join(proj, "AGENTS.md"), "rules\n");

  run(["save", "demo", proj, "a demo pack"], env);
  writeFileSync(join(proj, "CLAUDE.md"), "# annoyed\n"); // mutate after save
  run(["use", "demo", proj], env);
  assert.equal(readFileSync(join(proj, "CLAUDE.md"), "utf8"), "# tuned\n", "use restores saved copy");

  const ls = run(["ls"], env);
  assert.match(ls, /demo/, "ls lists the pack");

  run(["pack", "demo"], env);
  assert.ok(existsSync("demo.memctl.pack"), "pack exports a file");

  run(["prune", "demo"], env);
  const ls2 = run(["ls"], env);
  assert.doesNotMatch(ls2, /demo/, "prune removes the pack");
});

test("help exits clean", () => {
  const r = run(["-h"]);
  assert.match(r, /Usage:/);
});

test("init accepts a known template, rejects unknown", () => {
  const env = { ...process.env, MEMCTL_HOME: mkdtempSync(join(tmpdir(), "memctl-")) };
  const nodedir = mkdtempSync(join(tmpdir(), "node-"));
  run(["init", "--template=node", nodedir], env);
  assert.match(readFileSync(join(nodedir, "CLAUDE.md"), "utf8"), /Node\.js service/);
  const webdir = mkdtempSync(join(tmpdir(), "web-"));
  run(["init", "--template=web", webdir], env);
  assert.match(readFileSync(join(webdir, "CLAUDE.md"), "utf8"), /Web project/);
  assert.throws(() => run(["init", "--template=bogus", mkdtempSync(join(tmpdir(), "x-"))], env), (e) => /unknown template/.test(e.stderr || ""));
});