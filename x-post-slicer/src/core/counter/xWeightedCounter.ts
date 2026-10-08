import type { Counter } from "./types";
import { graphemes } from "./graphemes";

// Approximation of X's rules: URL = 23, emoji = 2, most Latin/Greek/Cyrillic = 1, CJK etc. = 2.
const URL_RE = /https?:\/\/[^\s]+/g;
const EMOJI_RE = /\p{Emoji_Presentation}|\p{Regional_Indicator}|\uFE0F|\u20E3|[\u{1F000}-\u{1FAFF}]/u;

function codePointWeight(cp: number): number {
  const light =
    cp <= 4351 || (cp >= 8192 && cp <= 8205) || (cp >= 8208 && cp <= 8223) || (cp >= 8242 && cp <= 8247);
  return light ? 1 : 2;
}

function plainWeight(text: string): number {
  let total = 0;
  for (const g of graphemes(text)) {
    if (EMOJI_RE.test(g)) total += 2;
    else for (const ch of g) total += codePointWeight(ch.codePointAt(0)!);
  }
  return total;
}

export const xWeightedCounter: Counter = {
  name: "X weighted (approximate)",
  count(raw) {
    const text = raw.normalize("NFC");
    let total = 0;
    let last = 0;
    for (const m of text.matchAll(URL_RE)) {
      const url = m[0].replace(/[.,!?;:)\]]+$/, ""); // trailing punctuation isn't part of the link
      total += plainWeight(text.slice(last, m.index)) + 23;
      last = m.index! + url.length;
    }
    return total + plainWeight(text.slice(last));
  },
};
