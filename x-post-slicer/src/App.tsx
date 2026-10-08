import { usePostSlicer } from "./hooks/usePostSlicer";
import { PostCard } from "./components/PostCard";
import { CopyButton } from "./components/CopyButton";
import { copyToClipboard } from "./components/clipboard";
import type { Mode } from "./core/compressor";

const MODES: [Mode, string][] = [["split", "Split only"], ["smart", "Smart compression"], ["extreme", "Extreme compression"]];

export default function App() {
  const s = usePostSlicer();
  const over = s.totalCount > s.limit;
  const n = s.split.posts.length;
  const copyNext = async () => {
    if (s.nextIndex >= 0 && (await copyToClipboard(s.split.posts[s.nextIndex].text))) s.markDone(s.nextIndex);
  };
  return (
    <main>
      <h1>X Post Slicer</h1>
      <p className="muted">Everything runs in your browser. Your text is never uploaded.</p>

      <label htmlFor="input">Your text</label>
      <textarea id="input" rows={8} value={s.text} onChange={(e) => s.setText(e.target.value)} placeholder="Paste your long text here…" />

      <div className="controls">
        <fieldset>
          <legend>Mode</legend>
          {MODES.map(([m, name]) => (
            <label key={m} className="inline"><input type="radio" name="mode" checked={s.mode === m} onChange={() => s.setMode(m)} /> {name}</label>
          ))}
        </fieldset>
        <label className="inline">Limit <input type="number" min={20} max={25000} value={s.limit} onChange={(e) => s.setLimit(Math.max(20, Number(e.target.value) || 280))} /></label>
        <label className="inline"><input type="checkbox" checked={s.labels} onChange={(e) => s.setLabels(e.target.checked)} /> Number the posts (1/3)</label>
        <button type="button" onClick={s.reset}>Reset</button>
      </div>

      <p aria-live="polite" className="status">
        {s.totalCount} / {s.limit} (approx. X count) · {s.split.posts.length} post{s.split.posts.length === 1 ? "" : "s"}{over ? " · over the limit, will be split" : ""}
      </p>

      {s.mode === "extreme" && <p role="note" className="warn">Extreme mode uses shorthand (u, ur, w/o…). It may not suit every audience, so review it.</p>}

      {s.mode !== "split" && s.text.trim() && (
        <section>
          <h2>Review changes</h2>
          <div className="cols">
            <div><h3>Original</h3><p className="box">{s.text}</p></div>
            <div>
              <label htmlFor="edit"><h3>Result (editable)</h3></label>
              <textarea id="edit" rows={8} value={s.working} onChange={(e) => s.setEdited(e.target.value)} />
            </div>
          </div>
          <details>
            <summary>{s.compression.changes.length} change{s.compression.changes.length === 1 ? "" : "s"} made</summary>
            <ul>{s.compression.changes.map((c, i) => <li key={i}>{c.rule}: “{c.before}” → “{c.after}”</li>)}</ul>
          </details>
        </section>
      )}

      {s.split.warnings.map((w, i) => <p key={i} role="alert" className="warn">⚠ {w}</p>)}

      {s.split.posts.length > 0 && (
        <section>
          <div className="row"><h2>Posts</h2><CopyButton text={s.split.posts.map((p) => p.text).join("\n\n")} label="Copy all" /></div>
          {n > 1 && (
            <div className="copybar">
              {s.nextIndex >= 0
                ? <button type="button" className="primary" onClick={copyNext}>Copy post {s.nextIndex + 1} of {n}</button>
                : <button type="button" className="primary" onClick={s.clearDone}>All copied ✓ Start over</button>}
              <span aria-live="polite" className="muted">
                {s.done.length === 0 ? "Copy a post, paste it into X, then press again for the next one." : `${s.done.length} of ${n} copied.`}
              </span>
            </div>
          )}
          <ol className="posts">
            {s.split.posts.map((p, i) => (
              <PostCard key={i} post={p} index={i} limit={s.limit} done={s.done.includes(i)} isNext={i === s.nextIndex && n > 1} onCopied={() => s.markDone(i)} />
            ))}
          </ol>
        </section>
      )}
      {!s.text.trim() && <p className="muted">Paste some text to get started.</p>}
    </main>
  );
}
