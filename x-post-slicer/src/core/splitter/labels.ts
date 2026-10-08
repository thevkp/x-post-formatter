export const labelFor = (i: number, n: number) => ` (${i}/${n})`;
// Worst case label for a thread with up to `digits` digits, e.g. " (99/99)".
export const worstLabel = (digits: number) => labelFor(Number("9".repeat(digits)), Number("9".repeat(digits)));
