export type Mode = "split" | "smart" | "extreme";
export interface Change { rule: string; before: string; after: string }
export interface CompressionResult { text: string; changes: Change[] }
