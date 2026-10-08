import { describe, it, expect } from "vitest";
import { compress } from "../../../src/core/compressor";

describe("compress", () => {
  it("AC-3.1 rewrites and reports changes", () => {
    const r = compress("in order to  do  this", "smart");
    expect(r.text).toBe("to do this");
    expect(r.changes.length).toBeGreaterThan(0);
  });
  it("AC-3.2 protected parts untouched", () => {
    const t = 'Do not visit https://example.com/in order to @in_order_to #do not "in order to"';
    const r = compress(t, "smart");
    expect(r.text).toContain("https://example.com/in order to");
    expect(r.text).toContain("@in_order_to");
    expect(r.text).toContain('"in order to"');
  });
  it("keeps negation when contracting", () => expect(compress("I do not know", "smart").text).toBe("I don't know"));
  it("AC-3.3 never longer", () => {
    for (const t of ["", "short", "I am sure you are about to go without your people."])
      for (const m of ["smart", "extreme"] as const) expect(compress(t, m).text.length).toBeLessThanOrEqual(t.length);
  });
  it("AC-3.5 compact text unchanged", () => expect(compress("Hello there.", "smart")).toEqual({ text: "Hello there.", changes: [] }));
  it("AC-4.1 abbreviations only in extreme", () => {
    expect(compress("without you", "smart").text).toBe("without you");
    expect(compress("without you", "extreme").text).toBe("w/o u");
  });
  it("split mode does nothing", () => expect(compress("a  b", "split").text).toBe("a  b"));
});
