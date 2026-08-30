# SvelteKit Static Site — Full Performance & Refactor Audit

You are a senior SvelteKit performance engineer and static-site optimization
expert. Work only inside this project's directory. Never touch files or
folders outside the project root. Never delete a folder you don't recognize
without asking first.

## Before you start

1. Read `check-desktop.json` and `check-mobile.json` in full — treat it as the primary source of truth for
   remaining mobile performance issues.
2. Read the current `package.json`, `svelte.config.js`, and folder structure.
3. Produce a short written plan (in your normal plan/Artifact output) listing
   the exact files you intend to touch and why, **before** editing anything.
4. Stop and ask me before proceeding if you hit either of the two open
   decisions in "Known conflicts to resolve with me" below.

## Hard constraints (do not violate)

- Language: all code comments in English. All UI-facing text stays in
  Vietnamese. Technical terms, HTML/CSS/JS keywords, and package names stay
  in English (do not translate them).
- Language of implementation: plain JavaScript only. Do not introduce
  TypeScript, `.ts`/`.svelte.ts` files, or type-checking tooling.
- This is a **static site** built with `@sveltejs/adapter-static`. Do not add
  WebSockets, `socket.io`, SSE, or any realtime/polling feature.
- Keep the project on the latest stable SvelteKit + TailwindCSS versions
  available as of today. Before upgrading any dependency, run
  `pnpm outdated` and report the diff to me first if a major version bump is
  involved.
- Remove unused dependencies, dead code, unused CSS classes, and unused
  imports as you find them — don't do a separate blind sweep that risks
  breaking something you haven't touched otherwise.

## Known conflicts to resolve with me before implementing

1. **Like-button dedup logic**: you asked for localStorage + cookies +
   browser fingerprint + "IP detection when possible." On a static site
   there is no server to read a visitor's IP from. Real IP-based dedup
   requires a serverless/edge function or a third-party API — it cannot be
   done in pure client-side static code. Confirm which of these you want:
   - (a) client-side only (localStorage + cookie + a lightweight fingerprint
     hash) — easily bypassed by clearing storage/incognito, but fully static
   - (b) add one serverless function (e.g. Cloudflare Pages Function /
     Vercel Edge Function) purely for the like/view endpoints, everything
     else stays static
2. **Post view counter**: same issue — an accurate, tamper-resistant counter
   needs a backend write. Confirm (a) an approximate client-only counter
   (inflated by refreshes, not reliable) or (b) a minimal serverless
   endpoint, same as above.

Do not silently pick one — ask, then proceed with whichever I choose.

## Phase 1 — Diagnosis

- Cross-reference `check.json` against the live build output.
- List every render-blocking resource, unused JS/CSS byte count, and CLS
  source you find, with file paths and line numbers.
- Do not change any files in this phase. Output a findings report only.

## Phase 2 — Caching & static delivery

- Implement `Cache-Control` headers (immutable for hashed static assets,
  `stale-while-revalidate` for HTML pages) appropriate for the hosting
  target this project actually deploys to (check for a `vercel.json`,
  `_headers` file, or similar before inventing a new mechanism).
- Add `preload`/`prefetch` only for resources confirmed critical in Phase 1
  — do not blanket-preload everything.
- Verify `adapter-static` prerenders every route correctly; list any route
  that fails to prerender and why, rather than silently marking it
  `ssr = false`.

## Phase 3 — Fonts

- Replace `@fontsource-variable/inter` with `@fontsource/fira-mono`.
- Set `font-display: swap` (or `optional` if you can show it doesn't hurt
  perceived load), self-host, and preload only the actual weight(s) used.
- Confirm CLS impact before/after with a real measurement, not an estimate.

## Phase 4 — Like button & view counter

- Implement whichever option was confirmed in "Known conflicts" above.
- Prevent duplicate likes from the same client within the constraints of
  the chosen approach; do not claim IP-level accuracy if option (a) was
  chosen.
- Keep request volume minimal; batch or debounce view increments.

## Phase 5 — Code quality gate

Run, in order, and fix everything each one reports before moving to the
next:

```bash
pnpm lint
pnpm format
pnpm check
pnpm test
```

Do not suppress errors with disable-comments unless you explain why in a
code comment.

## Phase 6 — UI/structure pass

- Bring sidebar, post navigation, and `recentPosts` into a consistent,
  content-focused layout (clean typographic hierarchy, clear spacing
  rhythm — reference modern editorial WordPress themes for the visual
  target, not the codebase).
- Preserve existing interaction _behavior_ (what triggers what), rewritten
  in idiomatic Svelte 5 runes/SvelteKit conventions — don't port Vue-style
  patterns (e.g. options-API-like structures, watchers-as-reactive-statements)
  into the Svelte code.
- Deduplicate repeated markup/logic into shared components only where reuse
  is genuine (3+ call sites) — don't over-abstract a single usage.

## Phase 7 — Accessibility

- Follow WCAG 2.2 AA and WebAIM guidance.
- Use semantic HTML first; add ARIA only where native semantics can't
  express the required state (e.g. `aria-expanded` on a custom disclosure
  widget is fine; `role="button"` on an actual `<button>` is not).
- Run an automated check (axe or Lighthouse a11y) and report the score.

## Phase 8 — Final verification

Report all of the following, with actual numbers/output, not estimates:

- Lighthouse mobile + desktop scores (Performance, Accessibility, Best
  Practices, SEO) from a real run against the production build.
- Output of `pnpm lint`, `pnpm format --check`, `pnpm check`, `pnpm test` —
  all passing.
- Final bundle size (before/after comparison).
- List of every dependency removed and every dependency upgraded.
- Confirmation that no debug/console logs remain in production code.
- Any known remaining gap between current state and a 100 Lighthouse score,
  with a one-line reason for each (don't claim 100 if it isn't measured).

## Logging policy

Add temporary console/debug logs only around the specific logic you're
actively fixing in a given phase, and remove them before ending that phase
— don't leave a phase's debug logging in place while working on the next
phase.
