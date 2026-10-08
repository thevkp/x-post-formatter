// Parts that must never be rewritten: URLs, @mentions, #hashtags, "quotes", `code`.
const PROTECTED = /(https?:\/\/\S+|[@#]\w+|"[^"\n]*"|“[^”\n]*”|`[^`\n]*`)/;

// split() with a capture group puts protected pieces at odd indexes.
export function mapUnprotected(text: string, fn: (segment: string) => string): string {
  return text.split(PROTECTED).map((seg, i) => (i % 2 === 1 ? seg : fn(seg))).join("");
}
