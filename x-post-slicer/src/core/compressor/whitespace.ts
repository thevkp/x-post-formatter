export const cleanWhitespace = (t: string) => t.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
