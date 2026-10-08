import type { Counter } from "./types";
import { graphemes } from "./graphemes";

export const simpleCounter: Counter = {
  name: "Plain characters",
  count: (text) => graphemes(text.normalize("NFC")).length,
};
