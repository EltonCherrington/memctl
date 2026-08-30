// ONE-SHOT woknrollrbs recovery. Password passed via env WOK_PASSWORD (never stored).
// Steps: IMAP login (woknrollrbs ONLY) -> dump unseen subjects+URLs -> if a dev.to confirm
// URL exists, click it with the signup session jar and publish; print HN confirm URL if present.
import { connect } from "node:tls";
import { readFileSync, existsSync, appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

if (!process.env.WOK_PASSWORD) { console.log("NO_WOK_PASSWORD"); process.exit(2); }
const user = "woknrollrbs@gmail.com";
const pw = process.env.WOK_PASSWORD;
const q = (s) => '"' + s.replaceAll("\\", "\\\\").replaceAll('"', '\\"') + '"';
const oc = process.env.LOCALAPPDATA + "\\Temp\\opencode";
const jar = join(oc, "dtg.jar");
const article = "C:\\Users\\Dovid L\\Documents\\Default Project\\memctl\\docs\\devto-announcement.md";
const drop = join(oc, "gmail-drops-one.txt");
const note = (s) => { appendFileSync(drop, s + "\n"); console.log(s); };

const log = [];
const sock = connect({ host: "imap.gmail.com", port: 993, servername: "imap.gmail.com", rejectUnauthorized: true });
const send = (tag, line) => new Promise((resolve) => {
  let settled = false;
  const fin = (v) => { if (!settled) { settled = true; resolve(v); } };
  setTimeout(() => fin("TIMEOUT"), 45000);
  setTimeout(() => sock.write(line + "\r\n"), 700);
  const onData = (c) => {
    log.push(...c.toString("utf8").split("\r\n"));
    if (log.some((l) => l.trim().startsWith(tag + " ") || l.includes("* BYE"))) {
      sock.removeListener("data", onData); fin("OK");
    }
  };
  sock.on("data", onData);
});

await send("a1", `a1 LOGIN ${q(user)} ${q(pw)}`);
const loginLine = log.find((l) => l.trim().startsWith("a1 ") || l.includes("* BYE"));
if (!loginLine || !loginLine.includes("OK")) {
  note("[login] " + (loginLine || "no response") + " -> ABORT (do not retry: bad cred or rate-limit)");
  process.exit(3);
}
note("[login] OK");
await send("b0", 'b0 SELECT "INBOX"');
await send("c0", "c0 SEARCH ALL");
console.log("search:", log.find((l) => l.trim().startsWith("* SEARCH")) || "none");

const searchLine = log.find((l) => l.trim().startsWith("* SEARCH"));
const ids = searchLine ? searchLine.split("SEARCH")[1].trim().split(/\s+/).filter(Boolean) : [];

let devtoUrl = null; let hnUrl = null;
for (const id of ids) {
  const mk = log.length;
  await send("d0", `d0 FETCH ${id} (BODY.PEEK[HEADER.FIELDS (SUBJECT FROM DATE)])`);
  const headers = log.slice(mk).join("\n");
  const subj = (headers.match(/^Subject:\s*(.*)$/mi) || [])[1] || "";
  const from = (headers.match(/^From:\s*(.*)$/mi) || [])[1] || "";
  note(`[mail] ${from} "${subj}" seq=${id}`);
  await send("e0", `e0 FETCH ${id} (BODY.PEEK[TEXT])`);
  const bt = log.slice(mk).join("\n");
  const links = [...bt.matchAll(/https?:\/\/\S+/g)].map((m) => m[0].replace(/[)>.,'"]+$/, "")).slice(0, 12);
  for (const l of links) note("  URL " + l);
  const fromDev = /dev\.to|forem|DEV Community/i.test(from);
  if (!devtoUrl) {
    devtoUrl = links.find((l) => l.includes("dev.to")) ||
      (fromDev && links.find((l) => /confirm|code|signup|verify/i.test(l))) || null;
    if (fromDev) note("[devto] mail-match: fromDev=" + fromDev);
  }
  if (!hnUrl) hnUrl = links.find((l) => l.includes("news.ycombinator.com")) || bt.match(/https:\/\/news\.ycombinator\.com\/confirm[^\s>")]*/)?.[0] || null;
}
sock.destroy();

if (devtoUrl) {
  note("[devto] confirm URL: " + devtoUrl);
  const curl = (args) => execFileSync("curl.exe", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
  curl(["-s", "-b", jar, "-c", jar, "-A", UA, "-L", devtoUrl, "-o", join(oc, "dt-confirm.html"), "-w", "%{http_code}"]);
  const settings = curl(["-s", "-b", jar, "-c", jar, "-A", UA, "https://dev.to/settings/account"]);
  note("[devto] identity check: " + (/eltoncherrington|woknrollrbs/.test(settings) ? "LOGGED_IN" : "maybe_not"));
  const md = readFileSync(article, "utf8");
  const payload = JSON.stringify({ article: { title: "Keep your AI coding agent's memory across machines (I built a tool for this)", body_markdown: md, published: true, tags: ["programming", "devops", "ai", "opensource"] } });
  writeFileSync(join(oc, "dt-payload.json"), payload);
  const res = curl(["-s", "-b", jar, "-c", jar, "-A", UA, "-X", "POST", "-H", "Content-Type: application/json", "--data-binary", "@" + join(oc, "dt-payload.json"), "-w", "\nHTTP %{http_code}", "https://dev.to/api/articles"]);
  note("[devto] publish: " + res.slice(0, 300));
} else {
  note("[devto] NO CONFIRM URL in mailbox yet");
}
if (hnUrl) note("[hn] CONFIRM: " + hnUrl);
note("DONE");