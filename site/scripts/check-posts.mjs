#!/usr/bin/env node
/**
 * Fails the build on markdown that renders wrong instead of erroring.
 *
 * Currently checks:
 *  - currency written as a bare `$`, which remark-math reads as inline math.
 *    Two amounts on one line silently swallow every word between them:
 *    "led $10M), Greenoaks (led $40M" renders the middle as italic math.
 *  - unbalanced code fences, which swallow the rest of the document
 *  - `\$` in frontmatter, where YAML has no markdown escapes
 *
 * Detection is positive on CURRENCY rather than on math, because real inline
 * math here is things like $q$, $d = 32$ and $2N+1$ — short, no LaTeX command
 * needed. A span is currency when it opens on a digit, carries no LaTeX
 * syntax, and reads like prose or a formatted amount.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const POSTS = "src/content/posts";
const FENCE = /^\s*(```|~~~)/;
const LATEXY = /[\\^_{}]/;
// prose or an amount: "1.2B, 7AI about", "100,000 to", "443 billion"
const CURRENCYISH = /,\d{3}|\b(?:million|billion|trillion|thousand)\b|\d\s?[MBK]\b|\b(?:to|per|a)\b|[a-zA-Z]{3,}/;

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name.startsWith("_") ? [] : walk(p);
    return /\.mdx?$/.test(name) ? [p] : [];
  });
}

const problems = [];

for (const file of walk(POSTS)) {
  const raw = readFileSync(file, "utf8");
  const fm = raw.match(/^---\n.*?\n---\n/s)?.[0] ?? "";
  const body = raw.slice(fm.length);
  const lines = body.split("\n");

  let inFence = false;
  let fenceCount = 0;

  lines.forEach((line, i) => {
    if (FENCE.test(line)) {
      inFence = !inFence;
      fenceCount++;
      return;
    }
    if (inFence) return;

    // drop inline code spans before looking for math
    const text = line.replace(/`[^`]*`/g, "");
    const spans = text.match(/(?<!\\)\$[^$\n]*?(?<!\\)\$/g) ?? [];
    for (const span of spans) {
      const inner = span.slice(1, -1);
      if (!inner.trim()) continue; // $$ display delimiters
      if (LATEXY.test(inner)) continue; // real LaTeX
      if (!/^\s?\d/.test(inner)) continue; // math variables: $q$, $d = 32$
      if (!CURRENCYISH.test(inner)) continue; // bare numbers: $0.5$, $2N+1$
      problems.push(
        `${file}:${i + 1}  currency read as math: ${span.slice(0, 60)}` +
          `\n    fix: escape both dollar signs as \\$`
      );
    }
  });

  if (fenceCount % 2 !== 0) {
    problems.push(`${file}  unbalanced code fences (${fenceCount})`);
  }
  if (/\\\$/.test(fm)) {
    problems.push(
      `${file}  frontmatter contains \\$ — YAML is not markdown, use a bare $`
    );
  }
}

if (problems.length) {
  console.error(`\n✗ check-posts found ${problems.length} problem(s):\n`);
  for (const p of problems) console.error("  " + p);
  console.error("");
  process.exit(1);
}
console.log("✓ check-posts: markdown renders cleanly");
