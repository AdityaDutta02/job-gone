# Job Gone v2 — Redesign + Fixes Design Spec

Date: 2026-06-02
Supersedes relevant parts of `2026-04-01-job-gone-design.md`.

## Goal

Fix three blocking issues and modernize the app:

1. **Input relevance** — non-jobs (person names, gibberish, objects) currently return a fake risk score. Must reject with a fun message + retry.
2. **Share/save image** — the core viral feature is broken. Must produce an ultra-polished, modern share card and a reliable share/save flow.
3. **Design** — current UI looks dated and is desktop-only. Must become a modern, light "Linear-clean" SaaS aesthetic (no AI slop), mobile-designed, and fit one viewport (no scroll on desktop).

Plus a latent bug: `lib/terminal-ai.ts` calls the wrong gateway endpoint and will not work against the real Terminal AI gateway.

## Decisions (locked with user)

- **Visual direction:** Clean SaaS / Linear-structure, **Light theme only**.
- **Copy tone:** Hype-reversal (mock-motivational: upbeat words, brutal meaning).
- **Scroll:** Desktop strict (one viewport, no scroll). Mobile may have a small scroll.
- **Share UX:** Native OS share sheet with the PNG on mobile; download PNG on desktop; copy-text fallback.
- **Share card:** 3:4 vertical, **1080×1440**, server-rendered. Footer = `◆ Job Gone` wordmark only.
- **Card rendering approach:** **A — server image route** via Next `ImageResponse` (Satori). Also serves as the OG image for link unfurls.

## Architecture

```
Page /                     → client state machine: input → loading → result | error
API  POST /api/analyze     → AI call: relevance check + risk analysis (one call)
API  GET  /api/card        → server-rendered PNG share card (ImageResponse)
API  GET  /api/health      → unchanged
lib/terminal-ai.ts         → FIXED gateway client (/v1/generate, category+tier)
```

Stateless. No DB, no storage. AI via Terminal AI gateway only.

### Data flow

1. User types a job role. Client trims; blocks empty / <2 chars before any network call (saves credits).
2. Client `POST /api/analyze { jobRole, embedToken }`.
3. Server builds system prompt (relevance + research data), calls gateway `callGateway(messages, token, { category: 'chat', tier: 'quality' })`.
4. AI returns JSON. If `valid:false` → client shows error screen with `quip`. If `valid:true` → result screen.
5. On "Share your doom": client builds `/api/card?...` URL, fetches the PNG as a blob, then:
   - mobile (`navigator.canShare` with files) → OS share sheet with the image,
   - else → download the PNG,
   - if fetch/share fails → copy text summary to clipboard.

## Gateway fix — `lib/terminal-ai.ts`

Current (broken): `POST {gateway}/v1/chat/completions`, body `{ model: 'gpt-4o-mini', ... }`, parses `data.choices[0].message.content`.

Correct (per Terminal AI SDK):
- `POST {gateway}/v1/generate`
- Body: `{ messages, category, tier }` (or `{ model }` for direct selection), Bearer = embed token.
- Response: `{ content, model_used, credits_charged }` → return `content`.
- Errors: `401` → "Session expired. Please refresh." `402`/`INSUFFICIENT_CREDITS` → surface "Out of credits" (status 402). Other non-OK → throw with status + body text.

New signature:
```ts
export async function callGateway(
  messages: { role: string; content: string }[],
  embedToken: string,
  opts: { category?: string; tier?: string; model?: string; system?: string },
): Promise<string>
```
The SDK auto-retries 429; we do not add our own retry.

## Relevance + analysis — `app/api/analyze/route.ts`

Single AI call returns BOTH the relevance decision and (when valid) the analysis.

System prompt additions:
- Classify the input first. Valid = a real occupation, job role, profession, or industry (including obscure-but-real: falconer, actuary, sommelier). Ambiguous internet roles (influencer, ninja, streamer) → treat as valid roles. Invalid = person names (Steve, Taylor), gibberish (asdf, qwerty), objects, places, or non-work words.
- If invalid: return `{ "valid": false, "quip": "<one fun hype-reversal line, max ~140 chars>" }` and NOTHING else. Do not invent a score.
- If valid: return `{ "valid": true, ...full analysis... }`.

Server behavior:
- Parse JSON. If `valid === false`, respond `{ valid: false, quip }`.
- If valid, respond `{ valid: true, result }`.
- Keep the existing research data block (Anthropic Index, McKinsey, PwC, WEF) for the analysis.
- The `reasoning[]` text should be specific enough to surface on the card (name real tools/companies).

## Types — `lib/types.ts`

```ts
export interface ReasoningPoint { title: string; icon: "alert" | "trend" | "bot"; text: string }

export interface AnalysisResult {
  riskScore: number;
  timelineRange: string;
  verdict: "Low Risk" | "Moderate Risk" | "High Risk";
  reasoning: [ReasoningPoint, ReasoningPoint, ReasoningPoint];
}

// Discriminated union for the API response
export type AnalyzeResponse =
  | { valid: true; result: AnalysisResult }
  | { valid: false; quip: string }
  | { error: string };
```

## Visual system (light Linear)

- Background: `zinc-50` with a very subtle dot-grid; lots of whitespace.
- Surface cards: white, hairline `zinc-200` border, soft shadow, generous radius. Optional faint glass.
- Type: Geist sans; large tight headings, `tabular-nums` for the score.
- Accent by risk: Low = emerald, Moderate = amber, High = rose. Used for the score ring, verdict chip, and card glow. Single accent only — no rainbow gradients.
- Motion: framer-motion, restrained — fade/scale on score, light stagger on reasoning. No bounce/slop.

### No-scroll layout

- `html, body`: full height, `overflow` hidden on desktop; main is a centered flex column sized to viewport.
- Result screen desktop: score row on top, reasoning as a **3-column** row beneath, actions below — all within `100dvh`.
- Mobile: single column; score ring, then reasoning cards **stacked**; small scroll permitted. Use `dvh` units, safe-area padding.

### Screens (reference layouts)

Input: wordmark, headline "Will AI take your job? Find your number.", one large input with inline submit arrow, source line.

Result: wordmark; role label; score ring (animated count) + verdict + "gone in ~{timeline}"; 3 reasoning cards; `[ Share your doom ]` + `[ ⟳ Try another ]`.

Error: 🎉 + hype-reversal headline from `quip`; `[ Try a real one ]` to reset.

## Share card — `app/api/card/route.tsx`

- `GET /api/card?role=&score=&verdict=&timeline=&r1=&r2=&r3=` (values URL-encoded; server clamps/sanitizes lengths).
- Returns PNG via `ImageResponse`, size `1080×1440`.
- Layout (top→bottom): `◆ JOB GONE` wordmark; "CONGRATULATIONS 🎉"; role (caps); big score ring tinted by risk; hype-reversal pull-quote; "GONE IN ~{timeline} · {verdict}"; divider; 3 short numbered reasoning lines; footer `◆ Job Gone · what's your number?`.
- Light card background to match app; risk-tinted ring/glow.
- Fonts: load Geist (or a Satori-compatible fallback) via `fetch` in the route; verify Satori CSS-subset compatibility (flexbox only, no unsupported props).
- Same route is referenced by `layout.tsx` OpenGraph/Twitter meta for link unfurls (static default until per-result params exist).

## Share button — `share-button.tsx` (rewrite)

- Build card URL from current result. `fetch` → `blob`.
- `const file = new File([blob], 'job-gone.png', { type: 'image/png' })`.
- If `navigator.canShare?.({ files: [file] })` → `navigator.share({ files, text, title })`.
- Else → object URL + anchor download.
- On any failure → `navigator.clipboard.writeText(summary)` and show "Copied!".
- Remove `html2canvas` usage and dependency.

## Files touched

- `lib/terminal-ai.ts` — fix endpoint/body/parse/errors, new signature.
- `app/api/analyze/route.ts` — relevance flag, category+tier, union response.
- `lib/types.ts` — union response + (optional) `valid`/`quip`.
- `app/page.tsx` — handle union (`valid:false` → error screen with quip), keep state machine.
- `app/api/card/route.tsx` — NEW server image route.
- `components/share-button.tsx` — rewrite for fetch-PNG + share sheet.
- `components/job-input.tsx`, `result-display.tsx`, `reasoning-card.tsx`, `loading-reveal.tsx` — restyle light-Linear; min-length guard in input.
- `app/globals.css` — light tokens, dot-grid, no-scroll rules, dvh.
- `app/layout.tsx` — OG/Twitter meta pointing at `/api/card`.
- `package.json` — remove `html2canvas`.

## Error handling

- Missing embed token → existing error path (waiting-for-token message).
- 401 → "Session expired. Please refresh."
- 402 → "Out of credits." (user-facing, no fake result)
- AI returns malformed JSON → caught, generic "Analysis failed, try again."
- `valid:false` → fun quip screen (not an error toast).
- Card route failure → share falls back to copy-text; never blocks the result screen.

## Testing

- `callGateway`: unit test request shape (URL `/v1/generate`, Bearer, category/tier) and response parse incl. 401/402 branches (mock `fetch`).
- Relevance: manual matrix — `graphic designer`, `falconer`, `influencer`, `Steve`, `asdf`, `""`, `a`.
- Card route: hit `/api/card?...` locally, confirm 1080×1440 PNG renders with all fields.
- Share: verify share-sheet path (mobile UA / canShare), download path (desktop), copy fallback.
- No-scroll: desktop has no scrollbar on input/result/error at common breakpoints; mobile within reason.

## Out of scope / YAGNI

- No dark theme, no theme toggle.
- No DB/storage/persistence of results.
- No auth beyond the existing embed token.
- No automated visual regression; manual check is sufficient.
- Test suite: per user, do not add a full test harness; the single `callGateway` unit test above is the only automated test.

## Open risk

- Satori font loading + CSS-subset limits in `ImageResponse` on the Terminal AI Next 16 runtime. If `ImageResponse` proves unavailable/unreliable on the runtime, fall back to approach B (dedicated off-screen card captured client-side using hex/rgb only). Decide during implementation after a smoke test of the card route.
