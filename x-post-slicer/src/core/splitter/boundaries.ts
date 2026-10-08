// Turns raw text into "units" (sentences / list lines) that can be packed into posts.
export interface Unit { text: string; sep: string } // sep = what goes before it when joined to the previous unit

const LIST_LINE = /^\s*([-*•]|\d+[.)])\s/;
const ABBR = /\b(Dr|Mr|Mrs|Ms|Prof|Sr|Jr|vs|etc|St|e\.g|i\.e)\.$/i;

// Blank line = paragraph break. Single newline -> space, unless the paragraph is a list or code.
export function toParagraphs(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => {
      const lines = p.split("\n");
      const keep = lines.some((l) => LIST_LINE.test(l)) || p.includes("```");
      return keep
        ? lines.map((l) => l.trimEnd()).filter((l) => l.trim()).join("\n")
        : lines.join(" ").replace(/[ \t]+/g, " ").trim();
    })
    .filter(Boolean);
}

export function splitSentences(p: string): string[] {
  const parts = p.split(/(?<=[.!?…]["'”’)\]]?)\s+/);
  const out: string[] = [];
  for (const part of parts) {
    if (out.length && ABBR.test(out[out.length - 1])) out[out.length - 1] += " " + part;
    else out.push(part);
  }
  return out;
}

export function toUnits(text: string): Unit[] {
  const units: Unit[] = [];
  toParagraphs(text).forEach((p, pi) => {
    const first = pi === 0 ? "" : "\n\n";
    const pieces = p.includes("\n") ? p.split("\n") : splitSentences(p);
    const glue = p.includes("\n") ? "\n" : " ";
    pieces.forEach((t, i) => units.push({ text: t, sep: i === 0 ? first : glue }));
  });
  return units;
}
