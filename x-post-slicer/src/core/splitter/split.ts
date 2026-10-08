import type { Counter } from "../counter";
import type { SplitOptions, SplitResult, Post } from "./types";
import { toUnits, type Unit } from "./boundaries";
import { labelFor, worstLabel } from "./labels";
import { graphemes } from "../counter/graphemes";

// Greedy fill: put as much as fits; a sentence that doesn't fit moves whole to the next post.
function pack(units: Unit[], budget: number, c: Counter, warnings: string[]): string[] {
  const posts: string[] = [];
  let cur = "";
  let warnedSentence = false;
  const flush = () => { if (cur) posts.push(cur); cur = ""; };

  for (const u of units) {
    const joined = cur ? cur + u.sep + u.text : u.text;
    if (c.count(joined) <= budget) { cur = joined; continue; }
    flush();
    if (c.count(u.text) <= budget) { cur = u.text; continue; }

    if (!warnedSentence) { warnings.push("A sentence longer than the limit was split at word boundaries."); warnedSentence = true; }
    for (const w of u.text.split(" ")) {
      const next = cur ? cur + " " + w : w;
      if (c.count(next) <= budget) { cur = next; continue; }
      flush();
      if (c.count(w) <= budget) { cur = w; continue; }
      warnings.push(`A very long word was cut in pieces: "${w.slice(0, 20)}…"`);
      let chunk = "";
      for (const g of graphemes(w)) {
        if (chunk && c.count(chunk + g) > budget) { posts.push(chunk); chunk = g; } else chunk += g;
      }
      cur = chunk;
    }
  }
  flush();
  return posts;
}

export function splitText(text: string, opts: SplitOptions, c: Counter): SplitResult {
  const units = toUnits(text);
  if (!units.length) return { posts: [], warnings: [] };

  const build = (texts: string[]): Post[] =>
    texts.map((t) => { const length = c.count(t); return { text: t, length, fits: length <= opts.limit }; });

  const warnings: string[] = [];
  const plain = pack(units, opts.limit, c, warnings);
  if (plain.length === 1 || !opts.labels) return { posts: build(plain), warnings };

  // Labels need the total post count, which depends on the split: reserve worst-case label space.
  for (let d = 1; d <= 6; d++) {
    const budget = opts.limit - c.count(worstLabel(d));
    if (budget <= 0) return { posts: build(plain), warnings: [...warnings, "Limit too small for numbered labels."] };
    const w: string[] = [];
    const posts = pack(units, budget, c, w);
    if (String(posts.length).length <= d) {
      return { posts: build(posts.map((t, i) => t + labelFor(i + 1, posts.length))), warnings: w };
    }
  }
  return { posts: build(plain), warnings };
}
