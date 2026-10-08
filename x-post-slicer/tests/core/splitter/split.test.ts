import { describe, it, expect } from "vitest";
import { splitText } from "../../../src/core/splitter";
import { xWeightedCounter as c } from "../../../src/core/counter";

const sentence = "This is a short sentence about testing.";
const para = Array(6).fill(sentence).join(" ");
const strip = (t: string) => t.replace(/ \(\d+\/\d+\)$/, "");

describe("splitText", () => {
  it("AC-1.1 three paragraphs -> 3 posts, all fit", () => {
    const r = splitText([para, para, para].join("\n\n"), { limit: 280, labels: true }, c);
    expect(r.posts).toHaveLength(3);
    expect(r.posts.every((p) => p.length <= 280)).toBe(true);
  });
  it("AC-1.2 same words in same order", () => {
    const text = Array(20).fill(sentence).join(" ");
    const r = splitText(text, { limit: 280, labels: false }, c);
    expect(r.posts.map((p) => p.text).join(" ").split(/\s+/)).toEqual(text.split(/\s+/));
  });
  it("AC-1.3 short text -> one post, no label", () => {
    const r = splitText("Hello world.", { limit: 280, labels: true }, c);
    expect(r.posts.map((p) => p.text)).toEqual(["Hello world."]);
  });
  it("AC-1.4 labels at the end and everything fits", () => {
    const r = splitText(Array(60).fill(sentence).join(" "), { limit: 100, labels: true }, c);
    const n = r.posts.length;
    expect(r.posts.every((p) => p.length <= 100)).toBe(true);
    expect(r.posts[n - 1].text.endsWith(`(${n}/${n})`)).toBe(true);
  });
  it("sentences are never cut when they fit", () => {
    const r = splitText(Array(10).fill(sentence).join(" "), { limit: 100, labels: false }, c);
    expect(r.posts.every((p) => p.text.endsWith("testing."))).toBe(true);
  });
  it("AC-1.5 long word is cut with a warning", () => {
    const r = splitText("a".repeat(500), { limit: 100, labels: false }, c);
    expect(r.posts.every((p) => p.length <= 100)).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
  it("AC-1.6 empty input -> no posts", () => expect(splitText("  \n ", { limit: 280, labels: true }, c).posts).toEqual([]));
  it("AC-1.8 single newline -> space, blank line kept, list kept", () => {
    expect(splitText("one\ntwo", { limit: 280, labels: false }, c).posts[0].text).toBe("one two");
    expect(splitText("a\n\nb", { limit: 280, labels: false }, c).posts[0].text).toBe("a\n\nb");
    expect(splitText("- x\n- y", { limit: 280, labels: false }, c).posts[0].text).toBe("- x\n- y");
  });
  it("abbreviations don't end sentences", () => {
    const r = splitText("Ask Dr. Smith today. Then go home.", { limit: 25, labels: false }, c);
    expect(r.posts[0].text).toBe("Ask Dr. Smith today.");
  });
  it("URLs count as 23 when packing", () => {
    const r = splitText("Read https://example.com/a/really/long/path/that/goes/on/and/on now.", { limit: 40, labels: false }, c);
    expect(r.posts).toHaveLength(1);
  });
});
