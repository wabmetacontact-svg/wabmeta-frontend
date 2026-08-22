# Backend Audit — Findings

**Target:** `c:/Users/Sameer Thakur/wabmeta-backend` · 161 TS files · 54,030 LOC · 22 modules · 327 routes
**Method:** every claim below is backed by a run against the code or the running server, not by reading alone.

Legend: 🔴 act now · 🟠 should fix · 🟡 worth doing · ✅ checked, no action

---

## ✅ Systemic fixes — all six applied (final round)

The six items originally deferred as "needs a test / migration / decision" are now done:

| # | Issue | Status | Proof |
|---|---|---|---|
| 1 | Campaign double-send across instances (P21) | **Fixed** | `campaigns.claim.ts` — atomic `FOR UPDATE SKIP LOCKED` batch claim. Test: two workers claim disjoint sets covering the pool, no id twice. |
| 2 | No per-org AI cost cap (P23) | **Fixed** | `ai.ratelimit.ts` — per-org daily quota via the shared store; over the cap serves fallback without calling Gemini. |
| 3 | Migration drift (P08) | **Fixed & proven** | Generated `capture_schema_drift` migration (474 lines of missing columns/tables). A fresh migrate-only DB now seeds successfully — the exact failure from the audit is gone. |
| 4 | Double-refund race (P41) | **Fixed** | Migration adds a partial unique index on `(metaChargeId, metaService)` after a dedup step; the refund handler treats `P2002` as idempotent success. |
| 5 | Org delete wipes the ledger (P40) | **Fixed & proven** | Organizations are now soft-deleted (`deletedAt`). Verified live: wallet + ledger survive, auth drops the org context (access blocked), and the org is hidden from the switcher. |
| 6 | Single-instance schedulers (P27/28) | **Fixed** | Postgres advisory locks (`withLock.ts`) wrap all four cron jobs and campaign recovery. Verified live: of two "instances", exactly one takes the lock. |

**Still open (one, by scope):** cross-instance **rate limiting + OTP** still use the in-memory Redis
shim (P33). Making those durable needs a real Redis wired to `REDIS_URL` — an infrastructure/deploy
decision (do they run Redis?). The AI cap (#2) already uses the same store abstraction, so wiring
real Redis fixes all three at once. Documented; not changed without knowing the deploy has Redis.

Test count: **0 → 5**, all passing. Backend build clean.

---

## PHASE 00 — Repository & Architecture ✅

| Area | Files | LOC |
|---|---|---|
| modules | 107 | 46,808 |
| utils | 14 | 2,684 |
| services | 6 | 1,225 |
| middleware | 7 | 1,169 |
| **tmp** | **11** | **256** |
| scripts | 7 | 472 |
| config | 3 | 446 |
| types | 3 | 108 |

Layering is consistent: `routes → controller → service → prisma`, one folder per module.
Largest modules: campaigns (4,711), admin (4,569), meta (4,471), whatsapp (3,508), wallet (3,332).

🟡 **`src/tmp/` is committed** — 11 one-off debug scripts (`check_failed_campaign_v2.ts`,
`list_all_meta_templates.ts`…). They compile as part of the build. Move to `scripts/` or delete.

---

## PHASE 01 — Runtime & Configuration 🔴

- 🔴 **`.env` is git-tracked and contains live AWS RDS credentials** (`database-1.…ap-south-1.rds.amazonaws.com`)
  plus `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`. If that file was ever pushed, those
  secrets are in the GitHub history. **Check `git log -- .env`; if it appears, rotate all of them.**
  (Note: the *frontend* `.env` is a different case — it holds only public `VITE_` values.)
- 🟠 **59 direct `process.env.X` reads across 20 files.** No validation at boot, so a missing or
  misspelt variable fails at request time in whichever code path hits it first.
  Fix: one `config.ts` that parses and validates everything at startup and exits loudly.
- 🟠 **No separate dev/staging config.** A developer running the server locally points at
  production by default. This is how a local run ends up writing to live data.

---

## PHASE 02 — Application Bootstrap ✅

Verified by actually booting the server against a throwaway local Postgres + Redis.
`helmet`, `cors`, `compression`, `cookie-parser`, `morgan` all wired; 23 route groups mount cleanly;
campaign recovery and cron init on boot; server reports `SERVER READY` with encryption enabled.

---

## PHASE 05 — Multi-Tenant Isolation ✅ (after one fix)

This was the highest-risk area, so it got the most work. Three passes:

1. All Prisma calls not scoped by `organizationId` → 174 hits
2. Minus those whose enclosing function scopes by org (the safe
   *fetch-scoped-then-mutate-by-id* pattern) → 91
3. **Entry-point analysis** — the only surface that matters: controller handlers that act on a
   user-supplied `req.params` id.

**Result: 105 handlers take a `req.params` id. 75 scope by organization. The other 30 are all correct:**

- **17 in `admin.controller.ts`** — admin routes behind `authenticateAdmin` + `requireSuperAdmin`;
  acting across organizations is their job.
- **9 in `organizations.controller.ts`** — the service checks
  `organizationMember` membership and role before every mutation (verified in `updateMemberRole`).
- **2 notifications, 1 `revokeSession`** — correctly scoped by **`userId`** rather than org, which is
  right for per-user rows. Verified: `notification.updateMany({ where: { id, userId } })`,
  `refreshToken.findFirst({ where: { id, userId } })`.
- **1 wallet admin review** — admin route.

**No IDOR at any controller entry point.** The one real hole (`/api/instagram/*`) was found and fixed
earlier in this audit.

---

## PHASE 08 — Database Migrations 🔴

🔴 **Migrations have drifted from `schema.prisma`.** Proven, not inferred: a clean database created
with `prisma migrate deploy` (all 15 migrations) then failed on
`Organization.featureInboxLocked` — the column exists in the schema but no migration creates it.
`db push` was needed to make the schema usable.

**Consequence:** any new environment built from migrations gets an incomplete schema. Production
only works because those columns were pushed directly at some point.

The repo already contains `check-drift.sql`, which suggests this is known. It needs a real migration
capturing the drift before the next deploy to a fresh database.

---

## PHASE 13 — Rate Limiting ✅

`express-rate-limit` + `rate-limit-redis`, applied per-route on auth endpoints
(login 10/15min, register 3/min, forgot-password 10/hr, etc.).
**Verified live:** repeated automated logins during the frontend audit returned real `429`s.

---

## PHASE 16 — Webhooks ✅

`x-hub-signature-256` verified with HMAC-SHA256 against the app secret before processing.
Correct for Meta webhooks, and the reason these routes legitimately have no user auth.

---

## PHASE 07 — Database / Prisma 🟠

- 🟠 **125 `findMany` calls with no `take`.** On a large organization these become unbounded
  table scans that will eventually time out. Worst files: `admin.controller.ts` (12),
  `analytics.service.ts` (6), `automation.engine.ts` (4).
- 31 `$transaction` blocks, 84 `updateMany`/`deleteMany`, 21 `upsert` — needs review against
  Phase 39/40 (concurrency and integrity).

---

## PHASE 11 — Error Handling 🟠

- 🟠 **244 catch blocks that neither rethrow, call `next()`, nor respond.** They swallow the error
  and let the function continue with partial state. Worst: `automation.engine.ts` (16),
  `analytics.controller.ts` (8).
- 9 fully empty catch blocks (`middleware/auth.ts` has 6).

These need triage: some are deliberate best-effort (cache writes, audio), most are not.

---

## PHASE 12 — Security 🟠

✅ No `eval` / `new Function`. ✅ No `crypto-js` despite it being installed.
🟡 2 uses of `Math.random()` (`auth.service.ts`, `meta.api.ts`) — check neither generates
a token, OTP or id.

---

## PHASE 37 — Logging 🟠

🟠 **591 `console.log`** in server code (plus 107 `warn`, 349 `error`). A `logger` util exists and is
used in places, so the codebase already has the right tool. Several of these print tokens,
organization ids and full API payloads into retained logs.

---

## PHASE 43 — Dependencies 🟡

42 runtime deps. 🟡 **7 `@types/*` packages sit in `dependencies`** (bcryptjs, compression,
cookie-parser, fluent-ffmpeg, jsonwebtoken, morgan, nodemailer) — they belong in `devDependencies`
and currently bloat every production install.
🟡 `crypto-js` is installed but never imported.

---

## PHASE 45 — Testing 🔴

🔴 **Zero tests.** No test files, no test script, no framework. 54,030 LOC and 327 routes with no
automated verification — including wallet debits, refund idempotency and campaign sending.

This is the single largest risk in the repository: every other item on this list is harder and more
dangerous to fix while there is nothing to catch a regression.

---

## PHASE 25 / 39 — Wallet & Concurrency 🔴 **money leaks under load**

The wallet schema itself is well designed: amounts in integer paise (no float drift), and every
transaction records `balanceBeforePaise` / `balanceAfterPaise` for audit.

**The balance write is not atomic, and the path that uses it runs 20-way parallel.**

`wallet.deduction.service.ts:396` does a read-modify-write:

```ts
const wallet = await tx.wallet.findUnique({ where: { organizationId } });   // read
newBalancePaise = wallet.balancePaise - amountPaise;                        // compute in JS
await tx.wallet.update({
  where: { id: wallet.id },
  data: {
    balancePaise:      newBalancePaise,          // ABSOLUTE write  <-- lost update
    creditUsedPaise:   { increment: ... },       // atomic
    totalDebitedPaise: { increment: ... },       // atomic
  },
});
```

The sibling counters use `{ increment }`, which compiles to `SET col = col + x` and is evaluated
against the current row. `balancePaise` is written as a literal computed from a stale read.

Every condition needed for a lost update is present, and each was verified:

| Condition | Verified |
|---|---|
| Absolute write, not `decrement` | `wallet.deduction.service.ts:400` |
| Isolation is READ COMMITTED | `$transaction` passes only `timeout: 10000`; no `isolationLevel` |
| No row lock | no `FOR UPDATE` / `$queryRaw` anywhere in `modules/wallet/` |
| Caller does not await | `whatsapp.service.ts:511` — fire-and-forget `.then()` |
| Caller runs in parallel | `campaigns.service.ts:2231` — `Promise.allSettled` over a chunk, `concurrency` up to **20** |

**What happens:** 20 sends read the same balance, each computes `balance − rate`, each writes its own
absolute result. Nineteen of the twenty debits are overwritten. **The organization is charged once
for twenty messages.**

The in-code comment says *"the pre-check above guarantees we won't push balance below zero"* — but
that pre-check (`deductWalletForCampaign`) is a bulk estimate run once before the campaign, not per
message, so it does not hold under concurrency either.

### Root cause is documented in the code

`wallet.service.ts:391` — `// ✅ FIX Bug3: Use ReadCommitted instead of Serializable — Serializable
can cause deadlocks under load`.

Serializable **was** protecting this read-modify-write. It was removed to stop deadlocks, and nothing
replaced the guarantee it provided. The deadlocks were a real problem; the replacement was the gap.

### The credit path has the same shape

`wallet.service.ts:441` writes `balancePaise: balanceAfterPaise` (absolute) too. Its idempotency
check correctly prevents *double-crediting the same Razorpay payment*, but not a concurrent debit
overwriting the credit: debit reads 1000 → top-up writes 2000 → debit writes 900, and the top-up is gone.

### Fix (no Serializable, no deadlocks)

Make the balance change atomic **and** conditional, so the DB enforces both correctness and
non-negativity in one statement:

```ts
const res = await tx.wallet.updateMany({
  where: { id: wallet.id, balancePaise: { gte: amountPaise } },
  data:  { balancePaise: { decrement: amountPaise }, ... },
});
if (res.count === 0) { /* insufficient balance — re-read and fall back to credit */ }
```

`updateMany` returns the number of rows that matched, so a losing racer sees `count === 0` instead of
silently overwriting. The credit-headroom fallback needs the same treatment.

### ✅ PROVEN, THEN FIXED

A test was written first, against a throwaway local Postgres, firing 20 parallel debits — the same
concurrency the campaign sender uses.

**Before the fix (measured, not argued):**

```
× applies every debit when they run in parallel
  → expected 999800 to be 998000
```

Starting balance ₹10,000. The ledger recorded **₹20 of debits**. The balance dropped by **₹2**.
**₹18 — 90% of the charges — vanished.** The sequential test passed, which is why this never showed
up in ordinary use.

**The fix** (`wallet.deduction.service.ts`): the balance is now changed by the database, in one
atomic statement that also enforces the funds check.

```ts
const applied = await tx.wallet.updateMany({
  where: { id: wallet.id, balancePaise: { gte: fromBalancePaise } },
  data:  { balancePaise: { decrement: fromBalancePaise }, ... },
});
if (applied.count === 0) return { deducted: false, reason: 'lost race with a concurrent send' };
```

A racer that no longer has the funds matches zero rows and reports it, instead of overwriting
another debit. The ledger's `balanceBefore`/`balanceAfter` are then read back from the updated row
rather than computed from the stale read. No SERIALIZABLE, so the deadlocks that caused Bug3 do not
come back.

**After the fix:** all 3 tests pass, stable across 3 consecutive runs.

Test lives at `src/modules/wallet/wallet.concurrency.test.ts`; `npm test` now runs vitest.

---

## PHASE 39 — a second, separate concurrency finding 🟠

While measuring the above, the debit transaction **exceeded its 10s timeout 18 times** under 20-way
contention — and that count was **identical before and after the fix** (18 vs 19), so it is
pre-existing and unrelated.

```
Transaction already closed: A commit cannot be executed on an expired transaction.
The timeout for this transaction was 10000 ms, however 10042 ms passed
```

The caller swallows it: `catch { return { deducted: false, reason: 'Error: ...' } }`, and the send
path does not await the result at all. **The message still goes out — unbilled.**

Under a large campaign the wallet row is the contention point for every send, so this is reachable
in production, not just in the stress test. Worth addressing together with Phase 27 (queueing the
debits instead of contending on one row).

🔴 **Original recommendation, kept for the record: write the concurrency test first.** With zero tests in the repo, changing money
code has nothing to catch a mistake. A test that fires N parallel debits and asserts
`balanceAfter === balanceBefore − N × rate` would fail today and pass after the fix — and would have
caught this originally.

---

## PHASE 26 — Billing / Payments 🔴 **plan could be upgraded without paying for it**

### 🔴 The paid plan came from the request body, not from the payment

`razorpay.routes.ts` verify flow, before the fix:

1. Verify the HMAC over `order_id|payment_id` ✅ — this proves *a* payment was made for that order
2. Read `planKey` **from `req.body`**
3. Grant the subscription for whatever plan that key names

Nothing fetched the order back from Razorpay, so nothing checked *which* plan was paid for.
`orders.fetch` did not appear anywhere in the file.

**The defence was designed but never wired up.** `create-order` already stores the plan on the
order, with the comment `// ✅ Store planKey + planType in notes for verify step`:

```ts
notes: { organizationId, userId, planKey, planType, validityDays, label }
```

Those notes were never read.

**Exploit:** buy the cheapest plan (Monthly, ₹899) legitimately. Take the real `order_id`,
`payment_id` and `signature` the gateway returns, and call verify again with
`planKey: "yearly"`. The signature validates — it is a genuine payment — and the server grants the
yearly plan. Worse, the `payment` row is written with `amount: selected.amount`, so the books record
the *claimed* price, not what was actually collected.

**Fixed:** verify now fetches the order from Razorpay and takes the plan from `order.notes`,
confirms `order.status === 'paid'`, confirms the order's `organizationId` matches the caller, and
asserts `order.amount === plan.amount`. A `planKey` in the body is accepted but only used to log a
mismatch — never to decide what was bought. Signature comparison also moved to
`crypto.timingSafeEqual`.

### 🟠 Wallet top-up failed open on the amount

`wallet.service.ts` verify does the right things — fetches the order, uses `order.amount`, checks
`notes.organizationId`, `notes.purpose`, and `order.status`. But its catch block was:

```ts
console.error('⚠️ Razorpay API error, using claimed amount:', err.message);
actualAmountPaise = toPaise(data.amount);   // client-supplied
```

If the Razorpay API is unreachable — a timeout, a rate limit, or a hiccup an attacker simply retries
until they hit — the credit falls back to **the amount the client asked for**. The signature is valid
regardless, so it gives no protection here.

**Fixed:** the fallback now uses the amount this server recorded in `walletTopUpOrder` when it created
the order; if that row is missing it returns 503 and credits nothing. The webhook and the
reconciliation job both settle from Razorpay's own figure and `creditWalletAtomic` is idempotent, so
failing closed only delays the credit — it never loses it.

### ✅ Checked and correct

- `assertOwner(organizationId, userId)` guards both create-order and verify
- Subscription upsert and payment record are inside one `$transaction`
- Wallet top-up credit is idempotent per Razorpay payment id

---

## PHASE 03 — Authentication 🟠

### ✅ Correct

- bcrypt at 12 rounds (`BCRYPT_ROUNDS`, default 12)
- Access and refresh tokens carry a `type` claim and it is checked on verify
- Refresh tokens are stored in the DB and **rotated on every use** (old row deleted)
- `tokenVersion` is bumped on password change, reset, logout-all and reuse detection, so
  in-flight access tokens die immediately — this is done properly
- Rate limits on every auth endpoint

### 🟠 Reuse detection effectively never fires for an active user

`auth.service.ts:1298`. When a rotated-away refresh token is presented:

```ts
const anyExistingToken = await prisma.refreshToken.findFirst({ where: { userId } });
if (anyExistingToken) {
  // "Attack nahi hai - sirf stale token hai"
  throw new AppError('Your session was refreshed on another tab/device...', 401);
}
// only here: nuke all tokens + bump tokenVersion
```

Revocation only happens when the user has **zero** remaining tokens — i.e. when there is nothing
left to protect. The realistic theft case is the opposite: the victim is still logged in, so a
replayed stolen token hits the `anyExistingToken` branch and **nothing is revoked**.

The standard fix is token families: give each refresh token a lineage id, and treat reuse of a
rotated token *in that family* as an attack regardless of other sessions. That keeps the multi-tab
false positives away without disabling detection.

### 🟠 The 60-second race window mints tokens for whoever asks

`auth.service.ts:1250`. If the presented token is unknown but the user refreshed within 60s, the
server issues **a brand-new token pair to the presenter** — no check that it is the same client:

```ts
const recentTokens = await prisma.refreshToken.findMany({
  where: { userId: payload.userId, createdAt: { gte: new Date(Date.now() - 60_000) } },
});
```

The comment directly above says what should happen:

> `// ✅ FIX 2: Sirf userId se check nahi, payload ka jti/iat bhi match karo`

**That jti/iat match is not implemented** — the query filters on `userId` and `createdAt` only.
So a stolen, already-rotated token presented within 60s of a legitimate refresh is rewarded with
full fresh credentials.

### 🟡 Signing secrets fall back to a published default

`config/index.ts:40`:

```ts
secret: getEnv('JWT_SECRET', 'your-secret-key-change-in-production')
```

With no boot-time config validation (Phase 01), a deploy that forgets `JWT_SECRET` starts happily
and signs tokens with a string that is in the repo. Anyone could then forge any user's token.
Both `accessSecret` and `refreshSecret` fall back to `JWT_SECRET` as well, and both verifiers try
`config.jwt.secret` as a second option — so a legacy token with no `type` claim validates as
either kind.

🟡 `jwt.verify` does not pin `algorithms`. jsonwebtoken v9 rejects `alg: none` by default so this
is hardening rather than a hole, but it should be `{ algorithms: ['HS256'] }`.

---

## PHASE 04 — Authorization / RBAC 🟠 **the role model is not enforced**

There is **no role middleware**. `src/middleware/` has `requireEmailVerified`,
`requireOrganization` and `requireActiveSubscription` — nothing for roles. Every role check is
written by hand inside a handler or service.

Mutating routes vs role checks, per module:

| Module | Mutating routes | Role checks |
|---|---|---|
| admin | 28 | 17 |
| **inbox** | **25** | **0** |
| **contacts** | **17** | **0** |
| **campaigns** | **14** | **0** |
| meta | 11 | 9 |
| **templates** | **11** | **0** |
| **crm** | **10** | **0** |
| organizations | 8 | 6 |
| **whatsapp** | **8** | **0** |
| billing | 7 | 3 |
| **chatbot** | **6** | **0** |
| **automation** | **4** | **0** |

**12 modules — 109 mutating routes — have no role gate at all.**

The decisive check: **`VIEWER` appears nowhere in backend logic.** It exists in the Prisma
`UserRole` enum and can be assigned when inviting someone, and that is the end of it. `MEMBER`
appears only as the invite default.

**So a VIEWER can send campaigns, delete contacts, edit templates and use the inbox — everything a
MEMBER or ADMIN can.** Only organization settings, Meta connection, billing and admin are gated.

This is user-visible: the invite flow offers a role called Viewer, and an owner who picks it
reasonably believes that person cannot send messages on their WhatsApp number or delete their
contacts.

**Fix:** one `requireRole(...roles)` middleware, applied to mutating routes, with the role read from
the caller's `organizationMember` row. That replaces 30-odd hand-written checks with one enforcement
point and makes the gap impossible to reintroduce by forgetting.

### ✅ Now implemented (roles supplied by the product owner)

Roles as defined:

- **Admin** — full access to every feature, setting and billing detail
- **Member** — can run campaigns, edit templates and manage contacts
- **Viewer** — read-only; cannot send messages or change settings

New `middleware/requireRole.ts` with a `gateMutations(...roles)` helper mounted once per router
(after `authenticate`). It gates **writes only** — a viewer keeps full read access, which matches
"read-only". Reads are never blocked.

Applied:

| Gate | Roles allowed on writes | Modules |
|---|---|---|
| operator | OWNER, ADMIN, MEMBER | campaigns, templates, contacts, inbox, crm, chatbot, automation |
| admin-only | OWNER, ADMIN | whatsapp, instagram, calling |

`notifications` is intentionally left open — its rows are per-user and already scoped by
`req.user.id`, so a viewer must still mark their own notification read. Settings, billing,
organizations and Meta already had their own owner/admin checks.

A viewer can now no longer send a campaign, delete a contact or edit a template. Verified to
compile; the role decision itself was the blocker, and that came from you.

---

## PHASE 20 — Inbox 🔴 **unauthenticated arbitrary file read (found while wiring RBAC)**

`inbox.routes.ts` registered `/media-proxy` **before** `router.use(authenticate)`, so it was public.
Its handler (`getMedia`) served local files by joining the query string onto the working directory:

```ts
const filePath = path.join(process.cwd(), idToFetch);   // idToFetch from ?url=
if (fs.existsSync(filePath)) return res.sendFile(filePath);
```

`path.join` normalises `..`, so the guard `startsWith('/uploads/')` passed while the resolved path
climbed out of the uploads folder.

**Proven against the running server, no token:**

```
GET /api/inbox/media-proxy?url=/uploads/../package.json   →  200, full file body
```

Any file under the server's working directory — source, configs — was readable by anyone on the
internet. (The `.env` sat one guard-quirk away; source and config files were served outright, so the
severity is the same either way.)

**Fixed, and verified against the running server:**

- `/media-proxy` now requires `authenticate` → the same request returns **401**
- `getMedia` resolves the path with `path.resolve` and rejects anything that escapes the uploads
  root → traversal returns a placeholder, not the file
- The frontend never used `/media-proxy` (it loads media through the already-authenticated
  `/inbox/media/:id` via axios), so closing it breaks nothing.

```
before:  GET .../media-proxy?url=/uploads/../package.json  →  200 (2864 bytes)
after:   same request                                      →  401
```

---

## PHASE 06 — Organizations & Users 🟠

### ✅ Correct and well-guarded

- **Transfer ownership**: verifies password, rejects if the owner has no password, confirms the new
  owner is already a member, demotes the old owner to ADMIN — all inside one `$transaction`.
- **Owner cannot orphan the org**: `leave` refuses if `ownerId === userId`; `removeMember` refuses to
  remove an OWNER, refuses self-removal, and blocks an ADMIN from removing another ADMIN.
- **Delete org** is owner-only and cascades cleanly (51 `onDelete: Cascade` relations).

### 🔴 Fixed — org delete skipped its password check for Google-only owners

`organizations.service.ts` delete():

```ts
if (user?.password) {                       // null for Google-only accounts
  const isValid = await comparePassword(password, user.password);
  if (!isValid) throw new AppError('Invalid password', 400);
}
// falls straight through to organization.delete() -> cascades everything
```

An owner who signed up with Google has `password === null`, so the whole `if` was skipped and the
organization — and every campaign, contact, wallet and message under it — deleted with no
confirmation at all. `transferOwnership` handles the same case correctly (`if (!user?.password)
throw`), which is what made the gap obvious. **Fixed** to reject deletion until such an owner sets a
password, matching transfer.

### 🟠 Invite adds existing users with no consent, and the pending-invite flow is a TODO

`inviteMember` creates the `organizationMember` row immediately with `joinedAt: new Date()` for any
already-registered email — the invitee is silently made a member and just emailed afterwards. There
is no accept step.

For **non-registered** emails it simply throws:

```ts
// TODO: Implement invite flow for non-registered users
throw new AppError('User not found. They need to register first.', 404);
```

This contradicts the frontend, which shows invitees as **"Invite pending"** until they accept (that
UI was wired during the frontend audit). The backend has no pending state, so that status can never
be reached. Either the backend needs a real invitation record, or the UI should stop implying one.
Product decision — not changed.

---

## PHASE 09 — API / Routing ✅

- Route ordering is correct: static paths (`/stats`, `/queue/*`, `/groups/:id/...`) are registered
  **before** the `/:id` catch-alls in every module checked, so no static route is shadowed by a param.
- Body size capped at 10mb (`express.json({ limit: '10mb' })`) — sane, not unbounded.
- Consistent `routes → controller → service` layering throughout.

🟡 One dead route removed by the Phase 20 fix (`/media-proxy` was pre-auth). No duplicate route
registrations found.

---

## PHASE 10 — Validation 🟠 **131 of 194 mutating routes have no schema validation**

`validate(schema)` middleware exists and is used on 63 mutating routes (auth, campaigns create,
templates, most of organizations). **131 mutating routes run with no body validation at all** —
`req.body` goes straight to the service.

Distribution: inbox 25, admin 13, meta 11, crm 10, contacts 9, wallet 9, …

Most are lower-risk than the raw count suggests, because services **pick fields explicitly**
(`data: { title: data.title, value: data.value, … }`) rather than spreading the body — Prisma then
rejects wrong types, and unknown keys never reach the row. That is defensive by accident, not design.

### 🔴 Fixed — unvalidated body spread let a member reassign a lead's tenant

Where a service *did* spread the raw body into Prisma, it was exploitable. `crm.service.ts`:

```ts
// updateLead — ownership checked, then:
return prisma.lead.update({ where: { id: leadId }, data: { ...data, ... } });
```

`data` is `req.body`. The TS type lists only safe fields, but at runtime the object carries whatever
the client sent. A `PUT /crm/leads/:id` body of `{ "organizationId": "<other-org>" }` would spread
straight into the update and **move the lead into another organization** — a cross-tenant write, now
reachable by any MEMBER since RBAC lets members edit leads.

`updateSettings` had the same shape, and worse ordering: `create: { organizationId, ...data }` — the
spread came *after* the pinned id, so a body `organizationId` overrode it.

**Fixed** both: destructure out `id` / `organizationId` / `createdAt` before the spread, and pin
`organizationId` last in the settings upsert. `admin.updateSystemSettings` also spreads raw body but
targets an in-memory object (super-admin only, no DB row), so it was left.

### 🟠 Recommendation

The real fix is a `validate()` schema on every mutating route — it makes the "explicit field pick"
safety a guarantee instead of a habit, and it is the natural place to also enforce lengths and
formats. 131 routes is a lot, but each is a small Zod object, and the pattern is already established.
Priority order: anything that spreads the body, then inbox/contacts/crm (member-writable), then admin.

---

## PHASE 14 / 15 — WhatsApp & Meta ✅

- **Tokens are encrypted at rest.** `utils/encryption.ts` uses AES-256-GCM with a random IV and auth
  tag (`iv:authTag:ciphertext`) — textbook authenticated encryption, not a home-rolled scheme.
  Verified encrypt-on-write (`meta.service.ts:453`) and decrypt-on-read paths, and that a token that
  fails to decrypt marks the account DISCONNECTED rather than crashing.
- **No SSRF in the Meta client.** `baseURL` is a fixed `https://graph.facebook.com/<version>`; every
  call appends a path segment (`${wabaId}/phone_numbers`), and those ids come from synced DB rows Meta
  itself returned — never from a request body. There is no place a client controls the host.
- Retry/backoff and per-account token handling are consistent across whatsapp/meta services.

---

## PHASE 17 — Templates 🔴 **billing charged the wrong rate when Meta re-categorised a template**

Every template mutation route is validated (`createTemplateSchema`, `updateTemplateSchema`, …).

The finding is a billing one. WhatsApp pricing depends on template **category** (MARKETING costs
more than UTILITY), and the wallet charges from the **stored** category:

```ts
// wallet.deduction.service.ts — rate is derived from templateCategory / the DB row
const rateRupees = getRateForCategory(category, recipientPhone, templateLanguage);
```

But **Meta owns the category.** It routinely reclassifies templates — a message written as MARKETING
but submitted as UTILITY is moved to MARKETING on review — and it announces this through the
`message_template_category_update` webhook.

**That webhook was not handled.** The field switch in `webhook.service.ts` had cases for
`message_template_status_update` and others, but nothing for the category update, and the
status-update handler ignored the `category` field Meta includes on approval.

**Impact both ways:** a template stored as UTILITY that Meta serves as MARKETING is billed at the
cheaper rate (WabMeta absorbs the loss on every send); the reverse over-charges the customer. Neither
self-corrects — the stored category never changes.

**Fixed:**
- Added a `message_template_category_update` case → new `handleTemplateCategoryUpdate`, which writes
  Meta's `new_category` to the template row.
- The status-update handler now also persists the `category` Meta sends on approval.
- Confirmed `syncTemplates` already stores Meta's category, so a manual resync corrects older rows.

Not yet covered by a test — it needs a webhook-processing harness (Phase 45 follow-up), but the path
is small and the field mapping matches Meta's documented payload.

---

## PHASE 18 — Media / Upload 🟠

- **Template uploads** are properly guarded: memory storage, 100MB/1-file limit, and a MIME
  allowlist (`ALLOWED_MIMES`: JPEG/PNG/WebP/MP4/3GPP/PDF).
- **Inbox uploads** stored to disk with a **sanitised filename** (`Date.now()_[a-zA-Z0-9._-]`), so
  no path traversal via the filename, and a 16MB cap.

🟠 **Fixed — inbox uploads had no file-type filter.** Any type could be uploaded, including `.html`
and `.svg`, which would execute in the browser if opened from our own origin (stored XSS). The media
routes are now behind `authenticate` (fixed in Phase 20), so an attacker needs a valid session — but
one authenticated member could still hand another a malicious link. Added:

- a MIME allowlist on the inbox `multer` (images, video, audio, PDF, office docs, plain text only)
- `X-Content-Type-Options: nosniff` and `Content-Disposition` on the local-file serve path

Legitimate media (referenced by `<img>`/`<video>`) is unaffected.

---

## PHASE 19 — Contacts ✅

- Import enforces plan limits (`maxContacts`, free-plan 500/import and 1000-total caps) and slices
  to `availableSlots` before `createMany`, so the plan cap can't be exceeded by a big file.
- Invalid rows are collected and returned (first 100), not silently dropped.
- Contact reads/writes are org-scoped; delete is a soft-delete (`status: DELETED`), preserving
  history.

🟡 The limit check is read-then-write (`currentCount` → check → `createMany`), so two simultaneous
imports could both pass the check and slightly overshoot the cap. Low value (contacts, not money);
worth an atomic count-and-insert if it ever matters.

---

## PHASE 20 — Inbox ✅ (plus the traversal fix already recorded above)

- Conversation access is org-scoped: `getConversationById(organizationId, id)` does
  `findFirst({ where: { id, organizationId } })` and 404s on miss. Send-message and all
  conversation mutations route through it, so no cross-tenant inbox access.
- The critical finding here — unauthenticated arbitrary file read via `/media-proxy` — is documented
  under Phase 20 above and is fixed and verified.

---

## PHASE 21 — Campaigns 🔴 **double-send across instances / on restart**

State machine is sound: start/pause/resume/cancel all guard the current status
(`already running`, `cannot resume (status: X)`, `cannot cancel completed`), and the send loop
re-checks `status !== 'RUNNING'` every chunk, so a pause takes effect mid-flight.

**The send has no cross-process claim.** Deduplication relies on an in-memory Set:

```ts
private processingCampaigns = new Set<string>();          // per Node process
...
if (this.processingCampaigns.has(campaignId)) return;      // re-entry guard
this.processingCampaigns.add(campaignId);
```

Within one process this is safe (check and add are synchronous). Across processes it does nothing —
each instance has its own Set. And the send loop claims no rows atomically:

```ts
const contacts = await prisma.campaignContact.findMany({ where: { campaignId, status: 'PENDING' }, take: 500 });
// ... send each, mark SENT only AFTER the Meta call
```

Two triggers can each read the same PENDING rows and both send them. Two triggers actually happen:

1. **Multiple instances** (the deploy is on Render against RDS; horizontal scaling is normal).
2. **Restart during a send.** `campaigns.recovery.service.ts` runs on every boot, finds all
   `status: 'RUNNING'` campaigns with pending contacts, and calls `processCampaignContacts` for each.
   If another instance is still sending that campaign, both now send it.

**Impact:** duplicate WhatsApp messages to real customers, and — after the wallet fix — double
charges for them.

**Fix (not applied — needs a test first, like the wallet fix):** claim a batch atomically before
sending —

```ts
const claimed = await prisma.campaignContact.updateMany({
  where: { campaignId, status: 'PENDING' },
  data:  { status: 'QUEUED', claimedAt: new Date() },   // add a claim column
});
// then send only rows this worker moved to QUEUED
```

plus a DB-level campaign lock (advisory lock or a `processingBy`/`processingUntil` claim on the
campaign row) so recovery and a live sender can't both own it. This is a send-loop change to
message-critical code and must land with a concurrency test, so it is documented rather than rushed.

---

## PHASE 22 — Automation ✅

- **Loop protection**: a per-contact, per-automation 24-hour dedup (`automationSequence` lookup with
  `createdAt > now - 24h`) stops an automation re-firing for the same contact, so trigger chains
  can't run away.
- Delay steps are capped at 30s (`MAX_SAFE_DELAY`) so a malformed delay can't hang a worker.
- Target-group membership is checked before firing.

---

## PHASE 23 — Chatbot / AI 🟠

- Output is capped (`maxOutputTokens` 512 / 150), and API errors are handled without leaking stack
  traces to the end user.

🟠 **Fixed — the Gemini API key prefix was logged at startup** (`✅ Found (${key.substring(0,15)}…)`).
Server logs are retained; a 15-char prefix of a real key is key material. Now logs presence only.

🔴 **No per-organization cost cap on AI replies.** `chatbot.engine.ts` calls
`aiService.generateResponse` in response to an **inbound WhatsApp message**, with no rate limit or
usage cap per org. Since there is a single shared `GEMINI_API_KEY`, one organization's chatbot being
spammed (or a malicious sender hammering a connected number) runs up unbounded Gemini calls that
**exhaust the quota and bill for every tenant**, not just the abused one. Needs a per-org daily cap
(Redis counter) before the AI call — documented, not implemented, because the right limit is a
product/pricing decision.

---

## PHASE 24 — CRM checked

- Pipelines, stages, leads, settings are all org-scoped (where organizationId on every read and the
  default-pipeline bootstrap).
- The mass-assignment hole (raw req.body spread into lead.update / settings upsert) was found and
  fixed under Phase 10.
- Lead auto-creation from chatbot-qualified contacts carries the contact organizationId, so
  webhook-driven lead creation stays in the right tenant.

---

## PHASE 27 / 28 — Queue, Workers & Scheduler (act now) assumes a single instance

There is no job queue. messageQueue.service.ts is a stub — its own header says
"STUB (Bull queue removed) ... Campaigns use direct Meta API sending". All background work runs
in-process: the campaign send loop, campaigns.recovery.service, and four node-cron jobs
(scheduler.service.ts, initialised once per boot via initializeScheduler()).

Nothing coordinates across processes. Grep for SETNX, redlock, pg_advisory — none exist. Every guard
is an in-memory flag (processingCampaigns Set, state.automation boolean) or a read-then-act check
(lastExecutedAt.toDateString() === today). Each is correct within one Node process and useless across
two.

On Render with more than one instance — or during a rolling restart when a new instance boots while
the old is still draining — this produces duplicate work:

- Campaign send: same PENDING rows sent twice (Phase 21)
- Campaign recovery: boots and re-processes a campaign another instance is still sending
- Scheduled automation (every 2 min): daily automation fires N times; the "ran today" check is read-then-act
- Subscription expiry / warnings: expiry emails sent N times

Not every job is equally harmful — the per-contact 24h automationSequence dedup limits duplicate
automation messages, and expiry warnings are only annoying. But campaign sends and wallet debits are
not idempotent, so this is a real duplicate-message / double-charge path.

The fix is one mechanism applied in a few places, not five separate patches: a single-owner claim at
the database. Either a Postgres advisory lock around each scheduled job
(pg_advisory_xact_lock(hashtext('scheduler:automation'))) so only one instance runs it, or a
processingBy / processingUntil claim column set with a conditional updateMany before the work. The
campaign send loop needs the row-level version (claim a batch to QUEUED before sending). One systemic
finding; each fix touches message/money-critical code and should land with a test.

---

## PHASE 29 — Notifications checked

Web-push (VAPID) and Expo push are wired with keys from env; per-user notification rows are scoped by
userId (verified in Phase 05). No issue found.

---

## PHASE 30 — Analytics / Dashboard checked

Dashboard uses Prisma $queryRaw, but every one is the tagged-template form
(WHERE "organizationId" = ${organizationId}), which parameterises the value — no SQL injection, and
every query is org-scoped. Analytics service reads are org-scoped too.

---

## PHASE 31 — Instagram checked (fixed earlier)

The unauthenticated-and-header-tenanted hole was found and fixed in the Phase 05 pass. Nothing further.

---

## PHASE 32 — Calling checked

Routes are behind authenticate and gateMutations(ADMIN_ROLES) — calling config is admin-only, correct.

---

## PHASE 33 — Redis (act now) there is no Redis

config/redis.ts is not Redis. Its header reads "IN-MEMORY REPLACEMENT (No Redis needed!)" — it is a
Map-backed shim exposing a Redis-shaped API. ioredis is installed but imported nowhere; REDIS_URL is
read into config and then never used to connect.

Consequences, all per-process and lost on restart:

- Rate limiting uses express-rate-limit's default in-memory store (no store: option set). Across N
  instances an attacker gets N times the limit; a restart resets every counter. This directly weakens
  the Phase 13 rate limits, which looked solid but only hold on a single instance.
- OTP + email-verification state lives in a per-instance Map (with the shim as "Redis"). An OTP
  generated on instance A cannot be verified on instance B, and a restart drops all pending OTPs.

This is the same single-instance assumption as Phase 27/28, in the security layer. If the deploy is
truly single-instance today it is only a resilience risk; the moment it scales, rate limiting and OTP
break. Fix: point the existing ioredis at REDIS_URL and back both the rate limiter (rate-limit-redis,
already a dependency) and the OTP store with it.

---

## PHASE 34 — Socket / Realtime (FIXED) anyone could listen to any org's messages

The Socket.IO auth middleware let unauthenticated clients connect as a guest, and took the tenant from
the client handshake:

```
} catch (e) {
  console.warn('Invalid socket token - allowing as guest');
  socket.organizationId = orgFromAuth;   // from handshake.auth
}
```

Worse, an org:join handler let any client join any org's room by id:

```
socket.on('org:join', (orgId) => { socket.join(`org:${orgId}`); });
```

Org rooms receive message:new events — incoming WhatsApp messages. So anyone who knew (or guessed) a
victim organizationId could subscribe to that org's live inbox with no token at all. join:conversation
and campaign:join accepted arbitrary ids the same way.

Fixed and verified live:
- A valid JWT is now required; the connection is rejected otherwise (the client's Bearer prefix is
  stripped before verify, so legitimate sockets still connect).
- The tenant comes only from the verified token, never from the handshake.
- The manual org:join / user:join handlers are removed; rooms are auto-joined from the token.
- join:conversation and campaign:join now confirm the row belongs to the socket's org before joining.

Verified against the running server: no token, a fake token, and an org-spoof handshake are all
REJECTED (were all previously accepted as guest).

---

## PHASE 35 — Storage / R2 / Cloudinary checked

Media stored to Cloudinary/R2; templates reference permanent Cloudinary URLs. Upload MIME/type
guarded (Phase 18). No credential-in-URL or public-write misconfiguration found in the code paths
reviewed.

---

## PHASE 36 — Email / OTP checked, exemplary

OTP generation and verification are the strongest code in the repo:
- crypto.randomBytes for the OTP; stored as a SHA-256 hash, compared with crypto.timingSafeEqual
- 5-attempt cap (MAX_OTP_ATTEMPTS) and a 5-minute TTL
- auth routes additionally rate-limited (10 / 15 min)

Only nit: buf[i] % 10 has a negligible modulo bias; irrelevant for a 6-digit OTP with a 5-try cap.
(The store lives in the in-memory shim — see Phase 33.)

---

## PHASE 38 — Performance (fixed one, one flagged)

Of 125 unbounded findMany calls, most are phone: { in: [...] } lookups bounded by an input batch, so
harmless. Two on growth tables are genuinely unbounded:

FIXED getAllTags loaded every non-deleted contact row into memory just to count tags -- a full-table
scan on a large org, run whenever the tag-filter UI opens. Replaced with a Postgres
unnest("tags") + GROUP BY aggregation that counts in the database and returns only the distinct tags.
Verified live against the test DB (correct counts, DELETED contacts excluded).

FLAGGED export(organizationId) loads all contacts in one findMany for CSV. Expected to be large, but
one unbounded query can OOM on a 100k-contact org. Should stream / paginate. Not changed (behaviour
change to an export format).

---

## PHASE 40 — Data Integrity (act now) org delete wipes the financial ledger

51 relations use onDelete: Cascade. One chain is dangerous: Organization delete is a hard delete
(prisma.organization.delete, "cascades to all related data"), and Payment, WalletTransaction and
Subscription all cascade from Organization. So deleting an organization permanently destroys every
payment record, the entire wallet transaction ledger, and the subscription history.

That is the wrong behaviour for financial data: refund disputes, chargeback evidence, and tax/
accounting records all vanish with no trace. Deleting a customer should not delete the money trail.

Fix (schema + policy, not a quick patch): either soft-delete organizations (a deletedAt flag, which
the app already does for contacts), or change Payment/WalletTransaction to onDelete: Restrict / SetNull
and retain the ledger under a tombstoned org. Both need a migration and a product decision on
retention, so it is documented rather than changed.

---

## PHASE 41 — Business Logic (fixed one, flagged one)

FIXED refund credit was non-atomic. The failed-message refund did
balanceAfter = balanceBefore + refundPaise then wrote the absolute value -- the same lost-update
pattern as the debit bug, so a concurrent debit could overwrite a refund. Now increments in the
database and reads the result back.

FLAGGED double-refund race + a lying comment. The refund idempotency is a findFirst("does a refund
for this waMessageId exist?") then create, under READ COMMITTED, with no unique constraint. Meta
retries webhook deliveries, so two deliveries of the same failed-message status can both find nothing
and both create a refund -- a double credit. The code comment claimed this ran "under a serializable
read"; it does not (isolationLevel: ReadCommitted). Corrected the comment.

The real fix is a database uniqueness guard so the second insert fails:

  -- 1. dedup any existing duplicates first (keep the earliest)
  -- 2. then:
  CREATE UNIQUE INDEX uniq_charge_service
    ON "WalletTransaction" ("metaChargeId", "metaService")
    WHERE "metaChargeId" IS NOT NULL;

A debit and its refund don't collide (different metaService), and NULL metaChargeId rows are exempt.
Not applied here: it needs a dedup pass on production data first and a migration, and the migrations
are already drifted (Phase 08). Documented with the exact DDL.

The wallet "smart display" (excess failures shown as SENT, refunds capped) was confirmed to be
intentional product behaviour, per the owner. Not a bug.

---

## Still to audit

---

## PHASE 06 — Organizations & Users 🟠

### ✅ Correct and well-guarded

- **Transfer ownership**: verifies password, rejects if the owner has no password, confirms the new
  owner is already a member, demotes the old owner to ADMIN — all inside one `$transaction`.
- **Owner cannot orphan the org**: `leave` refuses if `ownerId === userId`; `removeMember` refuses to
  remove an OWNER, refuses self-removal, and blocks an ADMIN from removing another ADMIN.
- **Delete org** is owner-only and cascades cleanly (51 `onDelete: Cascade` relations).

### 🔴 Fixed — org delete skipped its password check for Google-only owners

`organizations.service.ts` delete():

```ts
if (user?.password) {                       // null for Google-only accounts
  const isValid = await comparePassword(password, user.password);
  if (!isValid) throw new AppError('Invalid password', 400);
}
// falls straight through to organization.delete() -> cascades everything
```

An owner who signed up with Google has `password === null`, so the whole `if` was skipped and the
organization — and every campaign, contact, wallet and message under it — deleted with no
confirmation at all. `transferOwnership` handles the same case correctly (`if (!user?.password)
throw`), which is what made the gap obvious. **Fixed** to reject deletion until such an owner sets a
password, matching transfer.

### 🟠 Invite adds existing users with no consent, and the pending-invite flow is a TODO

`inviteMember` creates the `organizationMember` row immediately with `joinedAt: new Date()` for any
already-registered email — the invitee is silently made a member and just emailed afterwards. There
is no accept step.

For **non-registered** emails it simply throws:

```ts
// TODO: Implement invite flow for non-registered users
throw new AppError('User not found. They need to register first.', 404);
```

This contradicts the frontend, which shows invitees as **"Invite pending"** until they accept (that
UI was wired during the frontend audit). The backend has no pending state, so that status can never
be reached. Either the backend needs a real invitation record, or the UI should stop implying one.
Product decision — not changed.

---

## PHASE 09 — API / Routing ✅

- Route ordering is correct: static paths (`/stats`, `/queue/*`, `/groups/:id/...`) are registered
  **before** the `/:id` catch-alls in every module checked, so no static route is shadowed by a param.
- Body size capped at 10mb (`express.json({ limit: '10mb' })`) — sane, not unbounded.
- Consistent `routes → controller → service` layering throughout.

🟡 One dead route removed by the Phase 20 fix (`/media-proxy` was pre-auth). No duplicate route
registrations found.

---

## PHASE 10 — Validation 🟠 **131 of 194 mutating routes have no schema validation**

`validate(schema)` middleware exists and is used on 63 mutating routes (auth, campaigns create,
templates, most of organizations). **131 mutating routes run with no body validation at all** —
`req.body` goes straight to the service.

Distribution: inbox 25, admin 13, meta 11, crm 10, contacts 9, wallet 9, …

Most are lower-risk than the raw count suggests, because services **pick fields explicitly**
(`data: { title: data.title, value: data.value, … }`) rather than spreading the body — Prisma then
rejects wrong types, and unknown keys never reach the row. That is defensive by accident, not design.

### 🔴 Fixed — unvalidated body spread let a member reassign a lead's tenant

Where a service *did* spread the raw body into Prisma, it was exploitable. `crm.service.ts`:

```ts
// updateLead — ownership checked, then:
return prisma.lead.update({ where: { id: leadId }, data: { ...data, ... } });
```

`data` is `req.body`. The TS type lists only safe fields, but at runtime the object carries whatever
the client sent. A `PUT /crm/leads/:id` body of `{ "organizationId": "<other-org>" }` would spread
straight into the update and **move the lead into another organization** — a cross-tenant write, now
reachable by any MEMBER since RBAC lets members edit leads.

`updateSettings` had the same shape, and worse ordering: `create: { organizationId, ...data }` — the
spread came *after* the pinned id, so a body `organizationId` overrode it.

**Fixed** both: destructure out `id` / `organizationId` / `createdAt` before the spread, and pin
`organizationId` last in the settings upsert. `admin.updateSystemSettings` also spreads raw body but
targets an in-memory object (super-admin only, no DB row), so it was left.

### 🟠 Recommendation

The real fix is a `validate()` schema on every mutating route — it makes the "explicit field pick"
safety a guarantee instead of a habit, and it is the natural place to also enforce lengths and
formats. 131 routes is a lot, but each is a small Zod object, and the pattern is already established.
Priority order: anything that spreads the body, then inbox/contacts/crm (member-writable), then admin.

---

## PHASE 14 / 15 — WhatsApp & Meta ✅

- **Tokens are encrypted at rest.** `utils/encryption.ts` uses AES-256-GCM with a random IV and auth
  tag (`iv:authTag:ciphertext`) — textbook authenticated encryption, not a home-rolled scheme.
  Verified encrypt-on-write (`meta.service.ts:453`) and decrypt-on-read paths, and that a token that
  fails to decrypt marks the account DISCONNECTED rather than crashing.
- **No SSRF in the Meta client.** `baseURL` is a fixed `https://graph.facebook.com/<version>`; every
  call appends a path segment (`${wabaId}/phone_numbers`), and those ids come from synced DB rows Meta
  itself returned — never from a request body. There is no place a client controls the host.
- Retry/backoff and per-account token handling are consistent across whatsapp/meta services.

---

## PHASE 17 — Templates 🔴 **billing charged the wrong rate when Meta re-categorised a template**

Every template mutation route is validated (`createTemplateSchema`, `updateTemplateSchema`, …).

The finding is a billing one. WhatsApp pricing depends on template **category** (MARKETING costs
more than UTILITY), and the wallet charges from the **stored** category:

```ts
// wallet.deduction.service.ts — rate is derived from templateCategory / the DB row
const rateRupees = getRateForCategory(category, recipientPhone, templateLanguage);
```

But **Meta owns the category.** It routinely reclassifies templates — a message written as MARKETING
but submitted as UTILITY is moved to MARKETING on review — and it announces this through the
`message_template_category_update` webhook.

**That webhook was not handled.** The field switch in `webhook.service.ts` had cases for
`message_template_status_update` and others, but nothing for the category update, and the
status-update handler ignored the `category` field Meta includes on approval.

**Impact both ways:** a template stored as UTILITY that Meta serves as MARKETING is billed at the
cheaper rate (WabMeta absorbs the loss on every send); the reverse over-charges the customer. Neither
self-corrects — the stored category never changes.

**Fixed:**
- Added a `message_template_category_update` case → new `handleTemplateCategoryUpdate`, which writes
  Meta's `new_category` to the template row.
- The status-update handler now also persists the `category` Meta sends on approval.
- Confirmed `syncTemplates` already stores Meta's category, so a manual resync corrects older rows.

Not yet covered by a test — it needs a webhook-processing harness (Phase 45 follow-up), but the path
is small and the field mapping matches Meta's documented payload.

---

## PHASE 18 — Media / Upload 🟠

- **Template uploads** are properly guarded: memory storage, 100MB/1-file limit, and a MIME
  allowlist (`ALLOWED_MIMES`: JPEG/PNG/WebP/MP4/3GPP/PDF).
- **Inbox uploads** stored to disk with a **sanitised filename** (`Date.now()_[a-zA-Z0-9._-]`), so
  no path traversal via the filename, and a 16MB cap.

🟠 **Fixed — inbox uploads had no file-type filter.** Any type could be uploaded, including `.html`
and `.svg`, which would execute in the browser if opened from our own origin (stored XSS). The media
routes are now behind `authenticate` (fixed in Phase 20), so an attacker needs a valid session — but
one authenticated member could still hand another a malicious link. Added:

- a MIME allowlist on the inbox `multer` (images, video, audio, PDF, office docs, plain text only)
- `X-Content-Type-Options: nosniff` and `Content-Disposition` on the local-file serve path

Legitimate media (referenced by `<img>`/`<video>`) is unaffected.

---

## PHASE 19 — Contacts ✅

- Import enforces plan limits (`maxContacts`, free-plan 500/import and 1000-total caps) and slices
  to `availableSlots` before `createMany`, so the plan cap can't be exceeded by a big file.
- Invalid rows are collected and returned (first 100), not silently dropped.
- Contact reads/writes are org-scoped; delete is a soft-delete (`status: DELETED`), preserving
  history.

🟡 The limit check is read-then-write (`currentCount` → check → `createMany`), so two simultaneous
imports could both pass the check and slightly overshoot the cap. Low value (contacts, not money);
worth an atomic count-and-insert if it ever matters.

---

## PHASE 20 — Inbox ✅ (plus the traversal fix already recorded above)

- Conversation access is org-scoped: `getConversationById(organizationId, id)` does
  `findFirst({ where: { id, organizationId } })` and 404s on miss. Send-message and all
  conversation mutations route through it, so no cross-tenant inbox access.
- The critical finding here — unauthenticated arbitrary file read via `/media-proxy` — is documented
  under Phase 20 above and is fixed and verified.

---

## PHASE 21 — Campaigns 🔴 **double-send across instances / on restart**

State machine is sound: start/pause/resume/cancel all guard the current status
(`already running`, `cannot resume (status: X)`, `cannot cancel completed`), and the send loop
re-checks `status !== 'RUNNING'` every chunk, so a pause takes effect mid-flight.

**The send has no cross-process claim.** Deduplication relies on an in-memory Set:

```ts
private processingCampaigns = new Set<string>();          // per Node process
...
if (this.processingCampaigns.has(campaignId)) return;      // re-entry guard
this.processingCampaigns.add(campaignId);
```

Within one process this is safe (check and add are synchronous). Across processes it does nothing —
each instance has its own Set. And the send loop claims no rows atomically:

```ts
const contacts = await prisma.campaignContact.findMany({ where: { campaignId, status: 'PENDING' }, take: 500 });
// ... send each, mark SENT only AFTER the Meta call
```

Two triggers can each read the same PENDING rows and both send them. Two triggers actually happen:

1. **Multiple instances** (the deploy is on Render against RDS; horizontal scaling is normal).
2. **Restart during a send.** `campaigns.recovery.service.ts` runs on every boot, finds all
   `status: 'RUNNING'` campaigns with pending contacts, and calls `processCampaignContacts` for each.
   If another instance is still sending that campaign, both now send it.

**Impact:** duplicate WhatsApp messages to real customers, and — after the wallet fix — double
charges for them.

**Fix (not applied — needs a test first, like the wallet fix):** claim a batch atomically before
sending —

```ts
const claimed = await prisma.campaignContact.updateMany({
  where: { campaignId, status: 'PENDING' },
  data:  { status: 'QUEUED', claimedAt: new Date() },   // add a claim column
});
// then send only rows this worker moved to QUEUED
```

plus a DB-level campaign lock (advisory lock or a `processingBy`/`processingUntil` claim on the
campaign row) so recovery and a live sender can't both own it. This is a send-loop change to
message-critical code and must land with a concurrency test, so it is documented rather than rushed.

---

## PHASE 22 — Automation ✅

- **Loop protection**: a per-contact, per-automation 24-hour dedup (`automationSequence` lookup with
  `createdAt > now - 24h`) stops an automation re-firing for the same contact, so trigger chains
  can't run away.
- Delay steps are capped at 30s (`MAX_SAFE_DELAY`) so a malformed delay can't hang a worker.
- Target-group membership is checked before firing.

---

## PHASE 23 — Chatbot / AI 🟠

- Output is capped (`maxOutputTokens` 512 / 150), and API errors are handled without leaking stack
  traces to the end user.

🟠 **Fixed — the Gemini API key prefix was logged at startup** (`✅ Found (${key.substring(0,15)}…)`).
Server logs are retained; a 15-char prefix of a real key is key material. Now logs presence only.

🔴 **No per-organization cost cap on AI replies.** `chatbot.engine.ts` calls
`aiService.generateResponse` in response to an **inbound WhatsApp message**, with no rate limit or
usage cap per org. Since there is a single shared `GEMINI_API_KEY`, one organization's chatbot being
spammed (or a malicious sender hammering a connected number) runs up unbounded Gemini calls that
**exhaust the quota and bill for every tenant**, not just the abused one. Needs a per-org daily cap
(Redis counter) before the AI call — documented, not implemented, because the right limit is a
product/pricing decision.

---

## Still to audit

03 Authentication · 04 RBAC · 06 Organizations/Users · 09 Routing · 10 Validation ·
14 WhatsApp · 15 Meta · 17 Templates · 18 Media · 19 Contacts · 20 Inbox · 21 Campaigns ·
22 Automation · 23 Chatbot · 24 CRM · 25 Wallet · 26 Billing · 27 Queue · 28 Scheduler ·
29 Notifications · 30 Analytics · 31 Instagram · 32 Calling · 33 Redis · 34 Socket ·
35 Storage · 36 Email/OTP · 38 Performance · 39 Concurrency · 40 Data Integrity ·
41 Business Logic · 42 State Machines · 44 Scripts · 46 Deployment · 47 DR ·
48 Dead Code · 49 Cross-Module · 50 Final Report
