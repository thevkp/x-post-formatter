import type { Change, CompressionResult, Mode } from "./types";
import { mapUnprotected } from "./protect";
import { cleanWhitespace } from "./whitespace";
import { contractions } from "./dictionaries/contractions";
import { fillers } from "./dictionaries/fillers";
import { abbreviations } from "./dictionaries/abbreviations";

export type { Change, CompressionResult, Mode } from "./types";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const matchCase = (orig: string, repl: string) =>
  /^[A-Z]/.test(orig) ? repl.charAt(0).toUpperCase() + repl.slice(1) : repl;

function applyRules(text: string, rules: [string, string][], label: string, changes: Change[]): string {
  return mapUnprotected(text, (seg) => {
    for (const [from, to] of rules) {
      seg = seg.replace(new RegExp(`(?<![\\w'])${escapeRe(from)}(?![\\w'])`, "gi"), (m) => {
        const after = matchCase(m, to);
        changes.push({ rule: label, before: m, after });
        return after;
      });
    }
    return seg;
  });
}

export function compress(text: string, mode: Mode): CompressionResult {
  if (mode === "split") return { text, changes: [] };
  const changes: Change[] = [];
  let out = cleanWhitespace(text);
  if (out !== text) changes.push({ rule: "whitespace", before: "repeated spaces/blank lines", after: "tidied" });
  out = applyRules(out, fillers, "wordy phrase", changes);
  out = applyRules(out, contractions, "contraction", changes);
  if (mode === "extreme") out = applyRules(out, abbreviations, "abbreviation", changes);
  if (out.length > text.length) return { text, changes: [] }; // never make it longer
  return { text: out, changes };
}
