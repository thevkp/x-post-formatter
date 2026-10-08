import { describe, it, expect } from "vitest";
import { simpleCounter, xWeightedCounter as x } from "../../../src/core/counter";

describe("counters", () => {
  it("plain ASCII", () => expect(x.count("hello")).toBe(5));
  it("emoji is 1 plain, 2 weighted", () => { expect(simpleCounter.count("😀")).toBe(1); expect(x.count("😀")).toBe(2); });
  it("URL + emoji example = 32", () => expect(x.count("Check https://example.com/very/long/path 😀")).toBe(32));
  it("family emoji counts as one emoji (2)", () => expect(x.count("👨‍👩‍👧‍👦")).toBe(2));
  it("accent forms are equal", () => { expect(x.count("cafe\u0301")).toBe(4); expect(x.count("café")).toBe(4); });
  it("CJK weighs 2", () => expect(x.count("日本")).toBe(4));
  it("empty is 0", () => expect(x.count("")).toBe(0));
});
