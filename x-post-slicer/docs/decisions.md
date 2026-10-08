# Technical decisions

1. Frontend-only MVP: logic is pure text processing, so no backend needed. (Revisit for AI compression.)
2. Counter is a swappable strategy: the splitter never calls string length directly.
3. Compression returns a list of changes, not just a string, so users can review every edit.
4. Rule-based compression before AI: predictable, free, private.
