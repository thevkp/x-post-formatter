import { compress, type CompressionResult, type Mode } from "./compressor";
import { splitText, type SplitResult } from "./splitter";
import { xWeightedCounter } from "./counter";

export interface PipelineInput { text: string; mode: Mode; edited: string | null; limit: number; labels: boolean }
export interface PipelineOutput { compression: CompressionResult; working: string; split: SplitResult; totalCount: number }

// compress (optional) -> user may edit -> split -> measure. Pure: no UI, no network.
export function runPipeline(i: PipelineInput): PipelineOutput {
  const compression = compress(i.text, i.mode);
  const working = i.mode !== "split" && i.edited !== null ? i.edited : compression.text;
  const split = splitText(working, { limit: i.limit, labels: i.labels }, xWeightedCounter);
  return { compression, working, split, totalCount: xWeightedCounter.count(working) };
}
