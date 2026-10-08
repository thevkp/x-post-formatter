// CONTRACT: every counting strategy implements this. The splitter depends ONLY on this.
export interface Counter {
  name: string;
  count(text: string): number; // weighted length of the WHOLE text
}
