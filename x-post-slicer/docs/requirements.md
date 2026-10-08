# Requirements: X Post Slicer

Status: DRAFT. Edit anything that doesn't match what you want.

## 1. Purpose

Free X accounts limit a post to 280 weighted characters. This app lets a user paste long text and either **split** it into a numbered thread or **compress** it first, then split. Everything runs in the browser. No text is sent to a server.

## 2. Scope

### MVP (v1)
- Split Only mode with a configurable character limit (default 280)
- X-style character counting (approximate, labelled as such in the UI)
- Optional sequence labels, e.g. `(2/5)`, counted in the budget
- Per-post character count and a fits / doesn't-fit indicator
- Copy button per post, plus copy-all
- Smart Compression with a change list the user can review and edit
- Reset button, clear warnings and error messages

### Stretch (if time allows)
- Extreme Compression (opt-in only, abbreviation dictionary)
- Original vs compressed comparison view with per-change accept/reject

### Out of scope for now
- AI-powered compression
- Accounts, saved history, or any database
- Posting directly to X
- Premium-tier limits (25,000 characters)

## 3. Functional requirements and acceptance criteria

### FR-1: Splitting
The splitter cuts text only. It never rewrites, adds, removes, or reorders words. The only thing it may change is whitespace (see AC-1.8).

**Fill rule (greedy):** fill each post as close to the limit as possible. Never cut mid-sentence. If the next sentence does not fit, move that whole sentence to the next post.

**Cut priority when something does not fit:** paragraph break, then sentence end, then word gap, then a hard cut inside a word (last resort, with a warning).

**Acceptance criteria**
- AC-1.1: Given three paragraphs of about 233 characters each and a limit of 280, the result is exactly 3 posts, one paragraph per post, and none measures more than 280.
- AC-1.2: Joining the posts back together (with labels removed) gives the same words in the same order as the input. Only whitespace may differ.
- AC-1.3: Given text that already fits the limit, the result is 1 post, identical to the input, with no label added.
- AC-1.4: Labels go at the **end** of a post, e.g. `... text (2/5)`. With labels on, every post *including its label* fits the limit. The budget for the label is reserved before splitting (worst case, e.g. `(10/10)` costs more than `(1/3)`).
- AC-1.5: A word longer than the available budget is hard-cut, and a visible warning is shown.
- AC-1.6: Empty or whitespace-only input produces zero posts and a friendly message, not an error.
- AC-1.7 (optional, stretch): A "balance posts" option rebalances neighbours so the last post is not a tiny fragment (e.g. 280 / 280 / 40 becomes about 200 / 200 / 200). Off by default, because greedy fill gives fewer posts.
- AC-1.8: Whitespace normalisation. A blank line is a paragraph break and is kept. A single newline inside a paragraph becomes a single space. Repeated spaces collapse to one. Lines that look like list items (`-`, `*`, `1.`) or code blocks keep their newlines.

### FR-2: Character counting
Counting is a swappable strategy. The splitter asks the counter for lengths and never uses `.length`.

**Weights (from X's published rules, verify before release):** most characters = 1, emoji = 2, CJK and characters outside the common ranges = 2, every URL = 23 regardless of length.

**Acceptance criteria**
- AC-2.1: `Check https://example.com/very/long/path 😀` measures **32** (6 + 23 + 1 + 2).
- AC-2.2: A multi-part emoji (e.g. a family emoji joined with zero-width joiners) measures 2, not the number of code points.
- AC-2.3: `café` measures 4 whether typed as one accented character or as `e` plus a combining accent.
- AC-2.4: Swapping the counter implementation changes counts without any change to splitter code.
- AC-2.5: The UI labels the count as an approximation of X's own count.

### FR-3: Smart Compression
Smart mode applies only a whitelist of safe rewrites. It cannot understand meaning, so it refuses to touch the risky parts.

**Safe rewrites:** collapse repeated spaces, `in order to` to `to`, `do not` to `don't`, remove doubled words like `very very`, remove listed filler words.

**Protected (never changed):** URLs, @mentions, #hashtags, numbers, negations ("not", "no", "never"), quoted text, code blocks.

**Acceptance criteria**
- AC-3.1: `in order to  do  this` becomes `to do this`, and the change list shows each edit with its rule name.
- AC-3.2: Text containing a URL, a number, a quote, or the word "not" has those parts unchanged in the output.
- AC-3.3: The output is never longer than the input.
- AC-3.4: The user can see the original and the result, and can edit the result before splitting.
- AC-3.5: Compressing already-compact text returns it unchanged with "no changes found".

### FR-4: Extreme Compression (stretch)
- AC-4.1: Abbreviations (`you` to `u`, `without` to `w/o`) apply only when the user explicitly picks this mode.
- AC-4.2: Every change is reviewable, and the UI warns that shorthand may not suit every audience.

### FR-5: Copy and reset
- AC-5.1: Each post has its own copy button. Copy-all joins posts in order, separated by a blank line.
- AC-5.2: Copying gives clear feedback ("Copied") and does not alter the text.
- AC-5.3: Reset clears the input, results and warnings.

## 4. Non-functional requirements

- **Privacy:** no user text leaves the browser. No analytics on text content. No storage by default.
- **Performance:** results for 10,000 characters appear without visible lag, and counts update in real time as the user types.
- **Accessibility:** works with keyboard only, visible focus, labelled controls, status changes announced to screen readers, sufficient colour contrast, and pass/fail never shown by colour alone.
- **Responsiveness:** usable on a phone-width screen.
- **Maintainability:** core logic is pure functions with no UI imports, and has automated tests.
- **Reliability:** no input crashes the app. Bad input produces a message.

## 5. Known limitations (be honest in the README)

- The counter approximates X's real count. The only authority is X itself.
- Sentence detection is imperfect (abbreviations like "Dr." and "e.g.").
- Two sentences that depend on each other may land in different posts.
- Compression is rule-based and cannot verify meaning. The user must review.
- A single sentence longer than the limit must be cut at a word boundary.

## 6. Decisions made

1. Sequence labels go at the end of a post.
2. A single newline becomes a space. A blank line stays a paragraph break. List items and code keep their line breaks.
3. Default limit is 280 (free tier). No other presets in v1, though the limit stays configurable.
4. Posts are filled greedily up to the limit, and a sentence that does not fit moves whole to the next post.
