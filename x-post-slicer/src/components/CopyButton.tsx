import { useState } from "react";
import { copyToClipboard } from "./clipboard";

export function CopyButton({ text, label = "Copy", onCopied }: { text: string; label?: string; onCopied?: () => void }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    if (!(await copyToClipboard(text))) return;
    setDone(true); onCopied?.(); setTimeout(() => setDone(false), 1500);
  };
  return <button type="button" onClick={copy}>{done ? "Copied ✓" : label}</button>;
}
