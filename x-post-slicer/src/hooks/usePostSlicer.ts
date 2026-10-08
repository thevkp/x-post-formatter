import { useMemo, useState } from "react";
import { runPipeline } from "../core/pipeline";
import type { Mode } from "../core/compressor";

export function usePostSlicer() {
  const [text, setTextRaw] = useState("");
  const [limit, setLimit] = useState(280);
  const [mode, setModeRaw] = useState<Mode>("split");
  const [labels, setLabels] = useState(true);
  const [edited, setEdited] = useState<string | null>(null);

  // Changing the input or mode discards manual edits of the compressed text.
  const setText = (t: string) => { setTextRaw(t); setEdited(null); };
  const setMode = (m: Mode) => { setModeRaw(m); setEdited(null); };
  const reset = () => { setTextRaw(""); setEdited(null); setLimit(280); setModeRaw("split"); setLabels(true); };

  const out = useMemo(() => runPipeline({ text, mode, edited, limit, labels }), [text, mode, edited, limit, labels]);
  // Which posts have been copied. Tied to the current posts, so any change to them starts fresh.
  const sig = out.split.posts.map((p) => p.text).join("\u0000");
  const [doneState, setDoneState] = useState<{ sig: string; done: number[] }>({ sig: "", done: [] });
  const done = doneState.sig === sig ? doneState.done : [];
  const markDone = (i: number) => setDoneState({ sig, done: done.includes(i) ? done : [...done, i] });
  const clearDone = () => setDoneState({ sig, done: [] });
  const nextIndex = out.split.posts.findIndex((_, i) => !done.includes(i)); // -1 when all copied

  return { done, markDone, clearDone, nextIndex, text, setText, limit, setLimit, mode, setMode, labels, setLabels, edited, setEdited, reset, ...out };
}
