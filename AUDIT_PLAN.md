# WabMeta — Full Project Audit

**Branch:** `audit/architecture-fixes` · **Backend reference:** `c:/Users/Sameer Thakur/wabmeta-backend`

---

## Where things stand

| Metric | Start | Now |
|---|---|---|
| TypeScript errors | **153** | **0** |
| ESLint | config missing, script dead | working — 29 errors, 642 warnings |
| Production build | passed but skipped typecheck | **typecheck-gated, passing** |
| Source files | 245 | **209** |
| Source LOC | 71,004 | **65,177** |
| Orphaned files | 62 (9,525 LOC) | **11** (1,535 LOC) |
| Inbox chunk | 488 kB | **178 kB** |
| Native alert() / confirm() | 33 | **0** |
| Dark-theme markers | 2,069 | 571 (rest is valid muted text) |
| console.log in production bundle | 87 | **0** |

---

## Done

### Phase 0 — Guardrails
`eslint.config.js` created (the lint script was dead), `npm run typecheck` added, build gated
on typecheck, invalid `erasableSyntaxOnly` tsconfig option removed.

### Phase 1 — Type errors to zero
- `NodeConfigPanel` 60 errors to 0. `node.data` was untyped (`{}`), so `.map()`, `.filter()`
  and spreads could crash the chatbot builder. Fixed at the root with a real `ChatbotNodeData`
  type rather than casts.
- `types/campaign.ts` aligned to the backend's `formatCampaign()` (14 fields to 22).

### Phase 2 — Routing
- `/inbox/:conversationId` redirected to a literal `":conversationId"` — `Navigate` does not
  interpolate params. Fixed with a param-reading redirect.
- The landing page sat behind `PublicRoute`, so **a signed-in user could never see their own
  marketing page** — always bounced to `/dashboard`.
- `PageTitleUpdater` matched `/admin/*` but the routes are `/manage-wabmeta-admin/*`, so admin
  pages never got a title.
- `/chatbot` double redirect collapsed.

### Phase 3 — Auth & security
- **Token triplication removed.** The same JWT was written to `accessToken`, `token` and
  `wabmeta_token`. Now written once; the legacy keys are migrated and deleted on first read so
  existing sessions keep working. All four direct readers go through one accessor.
- **console.log stripped from production** via esbuild `pure`. 87 calls (several printing
  tokens, org ids and payloads) no longer ship. `console.error` is kept for real failures.
- **403 and 429 handling added.** A permission failure previously surfaced as a bare axios
  error and the UI showed a generic "something went wrong".
- **Verified, no change needed:** the single-flight token refresh is correctly implemented
  (`isRefreshing` guard plus queue, lock released in `finally`); admin-token separation is
  correct; 401 handling is thorough.
- **`.env` is git-tracked but is not a leak.** It holds only `VITE_`-prefixed values (VAPID
  *public* key, Meta App ID, API URL) — Vite compiles every one of those into the client
  bundle anyway. Added a note so no real secret is put there later.

### Phase 4 — API / data layer
- Frontend types aligned to the backend contract.
- **The campaigns list never showed the template name.** It read `campaign.template?.name`, but
  the list endpoint returns a flat `templateName`. Optional chaining hid the failure entirely.
- **`/api/team` does not exist on the backend.** All seven `team.*` calls in `services/api.ts`
  were 404ing. Removed; team management now points at `organizations/:id/members`.
- Added the `instagram` API object, which did not exist at all.

### Phase 5 — React correctness
- **Route-level ErrorBoundary.** Previously one page crash meant a whole-app white screen.
  `ErrorBoundary` gained a `resetKey` (without it a crashed route kept showing the error even
  after navigating away) and an inline variant that keeps the sidebar and top bar.
- **12 hand-rolled modals had no Escape, no focus trap and no scroll lock** — 10 of the 12
  lacked Escape entirely. New `hooks/useModalA11y.ts`: two lines per modal, no layout rewrite.
- **33 blocking native dialogs replaced** — 16 `alert()` to toast, 17 `confirm()` to a
  promise-based `ConfirmProvider`. Native `confirm()` blocks the page and is suppressed
  outright by some browsers, so a "delete" could silently never happen.
- The Contacts group-delete used Cancel to mean "keep the contacts" — a destructive choice
  disguised as Cancel. Now two clearly-labelled dialogs.
- `VoiceRecorder` called `stopRecording()` **inside a `setState` updater**. React can invoke an
  updater more than once, so the recording could stop twice.
- **Stale-response races fixed** on the id-driven detail pages (ContactDetails, LeadDetail,
  CreateAutomation) — navigating quickly between records could render the wrong one.
- **Verified clean:** socket listener cleanup, DOM listener cleanup, interval cleanup.

### Phase 6 — UI / light mode
- 653 inert `dark:` classes removed — the theme is pinned to light, so none of them ever applied.
- 21 dark screens converted to the palette the rest of the app already used (560 surfaces,
  390 text colours).
- `AdminLayout` and `InstagramLayout` were still dark navy while every page inside them had
  been converted.
- **136 Tailwind colour classes that generated no CSS at all** (`text-gray-550`, `bg-gray-105`,
  `border-gray-250`…). A past find-replace had bumped valid steps by +5/+50, so those elements
  rendered with no colour.
- **6 animation classes that did nothing.** `animate-scale-in` had keyframes but no token, so
  **every modal's entrance animation was dead**; `animate-in fade-in slide-in-from-*` is
  `tailwindcss-animate` syntax and that plugin is not installed (11 files).
- `PageSkeleton` deleted. It was a generic dashboard skeleton (fake chart, fake stat cards)
  shown on six pages that look nothing like it. Replaced by `PageLoader` — one loading visual
  for the whole app, with a 150 ms delay so fast loads show nothing at all.
- **Error states added** to ChatbotList, Automation and LeadsList. A failed fetch fell through
  to "No chatbots yet — create your first one", which reads as data loss.
- **Global keyboard focus ring.** Roughly half of 622 buttons had no focus style.

### Phase 7 — Performance
- **Inbox chunk 488 kB to 178 kB.** `emoji-picker-react` (310 kB) was statically imported into
  `ChatInput`, so every inbox load paid for it even though most sessions never open the picker.
  Now lazy-loaded. **An inbox user downloads 951 kB to 641 kB.**
- **framer-motion removed entirely (−110 kB)** — it was in the bundle for one modal's entrance
  animation that the app's own CSS already does. `react-dropzone` removed (never imported).
- Vendor `manualChunks` was tried and **reverted**: total size was unchanged, and the landing
  page — the most latency-sensitive route — would have downloaded 185 kB more.

### Phase 8 — Dead code
- 43 files deleted (~6,590 LOC) after a file-by-file review, plus `Testimonials` (fabricated
  customer quotes, confirmed not real).
- 47 unused imports removed.
- Kept and wired up rather than deleted: **Team page** (a 13-line "Coming soon" stub, now a
  working feature), **landing FAQ**, **Settings → Business Profile**, and **Instagram DM
  Automation** (mock data with a dead "Create Rule" button).

---

## Not done — and why

### Needs a backend endpoint first
- **`WebhookLogs`** — pure mock data. Wiring it would show users fabricated webhook events.
- **`CreateCommentRuleModal`** — Instagram comment rules have a Prisma model (`IgCommentRule`)
  but no API route.

### Needs a decision or genuine per-file work
- **158 inputs with no `id` or `aria-label`** — screen readers announce nothing for them. Each
  needs label text specific to its field, so this cannot be safely automated.
- **34 `exhaustive-deps` warnings** — almost all are missing *function* dependencies. Adding
  them naively causes infinite re-fetch loops. The real fix is wrapping each fetch function in
  `useCallback` across 20+ files, each needing its own test. The genuine stale-closure bugs
  (missing *state* values) are already fixed.
- **`services/api.ts` is 1,558 LOC** — worth splitting by domain, but it is a pure refactor
  with real regression risk and no user-visible gain.
- **Design system adoption** — 10 `common/` components are still unused (`Card`, `Badge`,
  `Table`, `Dropdown`, `Checkbox`, `Avatar`, `Loader`, `Toast`, `AuthLoadingScreen`,
  `WhatsAppAccountSelector`). `Modal` is now used by `ConfirmProvider`. Adopting the rest is
  the remaining fix for roughly 590 hardcoded hex colours.
- **Responsive check** at 375 px / tablet / desktop — needs a real browser, not code reading.
- **22 `no-useless-escape` lint errors** — cosmetic regex escapes with zero runtime effect.

### Performance still on the table
- `ChatbotBuilder` 233 kB (`@xyflow/react`), `Landing` 154 kB.
- Long-list virtualisation (conversations, contacts, leads).
- `React.memo` / `useMemo` on heavy re-render paths.
- **Backend response time** — with the frontend now tight, this is the remaining share of
  "takes time to load".

---

## Verification

`npm run typecheck` → 0 errors · `npm run build` → passes · `npm run lint` → 29 errors
(22 cosmetic escapes, 4 documented empty catches, 2 case-declarations, 1 prefer-const).

**Not done: a manual smoke test.** Everything above was verified by typecheck, build, lint and
reading the code — not by clicking through the running app. The light-mode conversion alone
touched about 950 lines across 21 files and deserves a real pass in the browser.
