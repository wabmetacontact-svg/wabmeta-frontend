# WabMeta Backend — Audit Plan

**Repo:** `c:/Users/Sameer Thakur/wabmeta-backend` · Express + Prisma + TypeScript
**Size:** 160 files · 54,030 LOC · 22 modules · 327 registered routes

---

## Baseline (measured, not assumed)

| Check | State |
|---|---|
| `tsc --noEmit` | **clean, 0 errors** |
| ESLint | **no config, no lint script** |
| Tests | **none** — 0 test files, no test script |
| `: any` annotations | 690 |
| `console.log` in server code | **591** (+107 warn, +349 error) |
| `findMany` calls | 136 |
| Direct `process.env` reads | 28 distinct vars |
| Raw SQL (`$queryRaw`) | 17 |

### Already correct — not re-litigating these

Verified during recon, no action needed:

- `helmet` and `cors` configured in `app.ts`
- **Rate limiting is applied** on auth routes (login, register, forgot-password, etc.)
- **Webhook signature verification** — `x-hub-signature-256` checked with HMAC-SHA256
- **Admin routes are authenticated** — `router.use(authenticateAdmin)` plus `requireSuperAdmin`
- **Raw queries are safe** — all use Prisma's tagged-template form, which parameterises
- TypeScript compiles clean

---

## 🔴 Phase B1 — Security (do first)

### B1.1 `/api/instagram/*` is completely unauthenticated

`app.ts:252` mounts `instagramRoutes` with **no `authenticate` middleware**, and every
controller reads the tenant from a client-supplied header:

```ts
const orgId = req.headers['x-organization-id'] as string;
```

Every other module does `router.use(authenticate)` and reads `req.user!.organizationId`.

**Impact:** anyone on the internet can call `GET /api/instagram/automations` with any
`x-organization-id` and read that organization's data, or `POST /api/instagram/automations`
to write to it. No token required. 7 routes affected.

**Fix:** add `router.use(authenticate)` to `instagram.routes.ts` and change the six
controllers to read `req.user!.organizationId`.

- [ ] Apply and verify the Instagram pages still work end to end

### B1.2 591 `console.log` in server code

Server logs are retained and often shipped to a log aggregator. Several of these print
tokens, org ids and full API payloads. There is already a `logger` in use elsewhere.

- [ ] Replace `console.log` with the existing logger at an appropriate level
- [ ] Verify nothing logs a token, refresh token or webhook secret

### B1.3 Configuration is read ad hoc

28 distinct `process.env.X` reads scattered across modules, with no validation at boot.
A missing or misspelled variable fails at request time, in whichever code path hits it first.

- [ ] Central `config.ts` that parses and validates every env var at startup and exits loudly
      if one is missing

---

## Phase B0 — Guardrails

Same gap the frontend had: without these, later phases regress silently.

- [ ] `eslint.config.js` + `npm run lint`
- [ ] `npm run typecheck` script
- [ ] Gate `build` on typecheck

---

## Phase B2 — Frontend ↔ backend contract ✅ DONE

Wrote a checker that matches all 197 frontend API calls against all 327 backend routes.
**12 mismatches found, 10 genuinely broken** (1 was a false positive, 1 verified separately):

| Broken call | Reality |
|---|---|
| `PUT /contacts/:id` | Backend registers **PATCH** — **editing a contact silently failed** |
| `GET/PUT /settings` + 5 more | **No `/api/settings` module exists at all** |
| `POST /organizations/:id/switch` | No such route |
| `POST /inbox/media/upload-voice` | No such route |

- [x] Contacts update fixed (`PUT` → `PATCH`), plus its payload sent `null` for
      `firstName`/`lastName`, which the backend's `z.string().optional()` rejects
- [x] Dead API definitions removed from `services/api.ts`
- [x] Re-run: **197 calls, all matched**

**Keep this check in CI** so a route rename can never silently break the frontend again.

---

## Phase B3 — Tests

54,030 LOC and 327 routes with **zero tests**. This is the single biggest risk in the repo:
there is no way to change billing, wallet or campaign logic with confidence.

Not asking for full coverage — start where a bug costs money:

- [ ] Wallet: debit/credit, refund idempotency (the `$transaction` + reuse-detection path)
- [ ] Campaigns: `calculateSmartDisplay`, status transitions, retry logic
- [ ] Auth: token refresh single-flight, reuse detection, session revocation
- [ ] Webhooks: signature verification, duplicate delivery handling

---

## Phase B4 — Type safety

690 `: any`. The `CampaignStats` drift found during the frontend audit is exactly what this
costs: `getStats()` is typed `Promise<any>` and returns a shape that does not match the
declared `CampaignStats` interface, and TypeScript never noticed.

- [ ] Type every service return value; delete interfaces that no longer match reality
- [ ] Start with `campaigns`, `wallet`, `billing` — the modules where wrong data costs money

---

## Phase B5 — Data & performance

- [ ] Audit 136 `findMany` calls for missing `take` — an unbounded query on a large org
      will eventually time out
- [ ] N+1 audit: look for `findMany` followed by per-row lookups instead of `include`
- [ ] Verify Prisma indexes match actual query patterns (the schema has many `@@index`
      declarations — confirm they are the ones being used)
- [ ] Check `campaigns.service.ts` (4,711 LOC) and `webhook.service.ts` for hot paths

---

## Phase B6 — Error handling & consistency

- [ ] Confirm every route returns the same error envelope the frontend expects
      (`{ success, message, code }`)
- [ ] Audit `catch` blocks that swallow errors or return 200 on failure
- [ ] `campaigns.types.ts` `CampaignStats` interface is **stale** — declares 16 fields,
      `getStats()` returns 6. Fix or delete it before someone trusts it.

---

## Phase B7 — Verification

- [ ] `tsc --noEmit` clean · `lint` clean · contract checker clean
- [ ] Smoke test each major flow against the running server
- [ ] Before/after report

---

## Suggested order

`B1 (security) → B0 (guardrails) → B3 (tests on money paths) → B6 → B4 → B5`

Security first because B1.1 is live. Guardrails next so the rest does not regress. Tests
before the type and performance refactors, because those refactors are exactly what needs
a safety net.
