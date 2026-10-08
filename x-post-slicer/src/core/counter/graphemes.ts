// Split text into what a person sees as one character (emoji sequences stay whole).
const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
export const graphemes = (t: string): string[] =>
  Array.from(seg.segment(t), (s) => s.segment);
