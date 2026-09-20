#!/usr/bin/env node
/**
 * Rewrites post dates from the local file's own timestamps instead of
 * hand-typed ones.
 *
 *   pubDatetime  <- the file's creation time (birthtime)
 *   modDatetime  <- its last modification time (omitted when unchanged)
 *
 * Posts with no pubDatetime are skipped: drafts stay undated until they ship.
 *
 * Run locally: the values are written into the frontmatter on disk, so what
 * ships is the committed text, not whatever timestamps the build machine's
 * checkout happens to have.
 *
 * Run with --check to report drift without writing (useful in a pre-commit
 * hook); run with no arguments to rewrite in place.
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  utimesSync,
} from "node:fs";
import { join } from "node:path";

const POSTS = "src/content/posts";
const CHECK = process.argv.includes("--check");
/** A rewrite this small is noise, not an edit worth recording. */
const MOD_THRESHOLD_MS = 60 * 1000;

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name.startsWith("_") ? [] : walk(p);
    return /\.mdx?$/.test(name) ? [p] : [];
  });
}

const iso = d => d.toISOString().replace(/\.\d{3}Z$/, ".000Z");

let changed = 0;
for (const file of walk(POSTS)) {
  const src = readFileSync(file, "utf8");
  const fm = src.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;

  // An undated post is an unpublished one: it gets a date when it ships,
  // not from whenever its file happened to be created.
  if (!/^pubDatetime:/m.test(fm[1])) continue;

  const st = statSync(file);
  const pub = st.birthtime;
  const mod = st.mtime;
  const showMod = mod.getTime() - pub.getTime() > MOD_THRESHOLD_MS;

  let body = fm[1];
  const before = body;
  body = body.replace(/^pubDatetime:.*$/m, `pubDatetime: ${iso(pub)}`);
  if (showMod) {
    body = /^modDatetime:/m.test(body)
      ? body.replace(/^modDatetime:.*$/m, `modDatetime: ${iso(mod)}`)
      : body.replace(/^pubDatetime:.*$/m, l => `${l}\nmodDatetime: ${iso(mod)}`);
  } else {
    body = body.replace(/^modDatetime:.*\n?/m, "");
  }
  if (body === before) continue;

  changed++;
  console.log(`${CHECK ? "drift" : "stamp"}  ${file}  ${iso(pub)}${showMod ? ` (mod ${iso(mod)})` : ""}`);
  if (CHECK) continue;
  writeFileSync(file, src.replace(fm[1], body));
  // Stamping is bookkeeping, not an edit: keep the timestamps it reads from,
  // or every run would record itself as the file's last modification.
  utimesSync(file, st.atime, st.mtime);
}

if (!changed) console.log("post dates already match file timestamps");
if (CHECK && changed) process.exit(1);
