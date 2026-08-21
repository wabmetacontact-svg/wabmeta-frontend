# WabMeta — Full Project Audit & Fix Plan

**Baseline captured:** 2026-08-21 · branch `audit/architecture-fixes`
**Scope:** 245 TS/TSX files · ~71,000 LOC · 203 components/pages

---

## Baseline Measurements (facts, not guesses)

| Metric | Current | Target |
|---|---|---|
| TypeScript errors (`tsc --noEmit`) | ~~153~~ → **0** ✅ | 0 |
| Production build | ✅ passes, **now typecheck-gated** ✅ | ✅ |
| ESLint config | ~~missing~~ → **working** ✅ (46 err / 633 warn) | 0 errors |
| `console.*` in src | 118 | ~0 in prod path |
| `as any` casts | 66 | < 10, justified |
| `alert()` calls | 21 | 0 (toast) |
| Hardcoded hex colors in TSX | 590 | tokenised |
| Files using `dark:` | 32 / 203 | consistent |
| Largest bundle chunks | Inbox 489 kB, index 454 kB, ChatbotBuilder 235 kB | < 250 kB each |
| Files > 800 LOC | 10 | split |
| Source files | ~~245~~ → **205** ✅ | — |
| Source LOC | ~~71,004~~ → **64,476** ✅ | — |

---

## 🔴 MAJOR FINDING — 25% of the codebase is dead

**62 of 245 files (~9,500 LOC) are orphaned** — koi bhi file unhe import nahi karti.
Ye sirf clutter nahi, ye **UI inconsistency ka root cause** hai:

Pura design system dead pada hai — `Card`, `Modal`, `Badge`, `Avatar`, `Table`,
`Dropdown`, `Checkbox`, `Toast`, `Loader` — koi page inhe use nahi karta.
Isi liye 590 hardcoded hex colors hain aur dark mode sirf 32/203 files me hai:
**har page apna custom UI dobara likh raha hai.**

Aur bhi poore feature-modules dead hain:
- `components/billing/*` (5 files, 1,095 LOC) — PricingPlans, PaymentMethods, InvoiceHistory…
- `components/analytics/*` (5 files, 410 LOC) — poora module
- `components/team/*` (3 files, 399 LOC)
- `components/templates/*` (4 files, 867 LOC) — MediaUploader, ButtonBuilder…
- `components/contacts/*` (3 files, 651 LOC) — ContactsTable, ContactFilters, BulkActions
- `components/dashboard/*` (5 files, 728 LOC) — StatsCard, ChartCard, RecentActivity…
- `components/campaigns/*` (5 files, 1,418 LOC)
- `hooks/` — useInbox (299), useChatbot (167), useDataFetch, useDelayedFlag, useInboxNotifications
- `pages/admin/Subscriptions.tsx` (287 LOC)

**43 of the remaining type errors sirf 3 dead files me hain** (CampaignStats,
CampaignFilters, CampaignCard) — inhe fix karne ka koi runtime fayda nahi.

---

## Phase 0 — Guardrails (foundation)
Isse baad ke phases me regression nahi aayega.

- [x] `eslint.config.js` create karo — **DONE** (ab 46 errors + 739 warnings surface ho rahe hain)
- [x] `npm run typecheck` script add karo — **DONE**
- [x] `build` script me typecheck gate lagao — **DONE**
- [x] `tsconfig.app.json` se invalid `erasableSyntaxOnly` hatao — **DONE**

## Phase 1 — Compile-Breaking Type Errors (96)
Ye actual runtime bugs hain, sirf type noise nahi.

- [x] **`NodeConfigPanel.tsx`** — **DONE, 60 → 0.** `node.data` untyped (`{}`) tha. Root cause fix kiya: `ChatbotNodeData` type banaya (`types/chatbot.ts`) aur `Node<ChatbotNodeData>` use kiya — casts se nahi, actual typing se.
- [ ] **`CampaignStats.tsx`** — 30+ errors. Component `stats.sent/delivered/read/replied/failed/pending` padh raha hai jo `CampaignStats` type me hai hi nahi → **API contract mismatch**, stats blank ya NaN dikhengi.
- [ ] **`CampaignCard.tsx`** — `campaign.stats` aur `campaign.templateName` type pe nahi hain.
- [ ] **`CampaignFilters.tsx`** — filter lowercase `'running'` bhejta hai, type uppercase `'RUNNING'` expect karta hai → **filter kaam hi nahi karega**.
- [x] `NotificationsProvider.tsx` — type-only import — **DONE**

## Phase 8 — Dead Code Cleanup ✅ DONE (moved up)

- [x] **43 files deleted** (~6,590 LOC) — 41 approved from the orphan ledger + 2 cascading
      (`types/analytics.ts`, `types/billing.ts` died with their components).
- [x] **21 files kept by decision**: the 9 unwired-but-finished features and the
      12-component design system. Ye Phase 6 ka kaam hai.
- [x] 47 unused imports removed.
- [x] 3 barrel files restored — pehla detector `from '../components/chatbot'` jaise
      directory-imports miss kar gaya tha. Detector fix kiya.

### Real bugs found while clearing unused symbols

- [x] **`ChatInput.tsx`** — `sending` state 3 jagah padha jaa raha tha par kabhi set nahi hota tha.
      Send button na disable hota tha na spinner dikhata tha. Send path jaan-boojh ke optimistic hai,
      isliye vestigial state hataya (blocking wapas nahi laya).
- [x] **`border-gray-205`** — invalid Tailwind class, 2 files me (`ChatInput`, `CreateAutomation`).
      Border render hi nahi ho raha tha. → `border-gray-200`
- [x] **`DMAutomation.tsx`** — dono "Create Rule" buttons `setShowCreateModal(true)` call karte the
      par koi modal render hi nahi hota. **Click karne pe kuch nahi hota tha.** Ab toast dikhta hai.
- [x] **`InstagramSettings.tsx`** — `isConnected` `useState` tha jise koi set nahi karta,
      UI jhooth bol raha tha ki state badal sakti hai. Honest placeholder kiya.
- [x] **`useGlobalNotifications.ts`** — service-worker registration ka result unused; call rakha, binding hataya.
- [x] `VoiceRecorder` `isPaused` — recording-pause feature kabhi bana hi nahi, dead state hataya.

### ✅ DECIDED: Light mode only

Dark mode wapas nahi aayega. Matlab Phase 6 me:
- Har `dark:` class inert hai → hata do (dead weight + confusion)
- Hardcoded-dark components (`bg-[#0a0e27]`, `text-white` — jaise `NodeConfigPanel`,
  Instagram pages, chatbot nodes) ko light palette pe convert karna hai. **Yahi asli UI bug hai.**

### 🔴 `ThemeProvider` — dark mode band hai (context)

`mode` hamesha `'light'` return karta hai, chahe route kuch bhi ho. Matlab
**poore app ke saare `dark:` classes inert hain**. "Dark mode sirf 32/203 files me hai"
wali baat isi ki wajah se hai — dark mode toota nahi, **switch off hai**.

Problem ye hai ki kuch components (jaise `NodeConfigPanel`) hardcoded dark colors use karte hain
(`bg-[#0a0e27]`, `text-white`) — to wo forced-light app ke andar dark UI render karte hain.
**Phase 6 me decision chahiye: dark mode wapas laana hai ya hardcoded dark components ko light karna hai.**

---

## Phase 2 — Routing & Navigation Audit
App.tsx me already 4 confirmed bugs mile:

- [ ] `/inbox/:conversationId` redirect literal string `"/dashboard/inbox/:conversationId"` pe bhejta hai — **param resolve nahi hota**, broken URL.
- [ ] `PublicRoute` landing page `/` pe laga hai → logged-in user apni **marketing/landing page kabhi dekh hi nahi sakta**.
- [ ] `PageTitleUpdater` me `/admin/*` pattern hai, par actual routes `/manage-wabmeta-admin/*` hain → admin pages ka title kabhi set nahi hota.
- [ ] `/chatbot` → `/dashboard/chatbot` → `/dashboard/chatbots` — double redirect chain.
- [ ] Har route ka guard verify: protected/public/admin correctly assigned hai ya nahi.

## Phase 3 — Auth & Security
- [ ] **Token triplication**: `setAuthTokens` ek hi JWT ko 3 keys (`accessToken`, `token`, `wabmeta_token`) me likhta hai — legacy debt, XSS surface 3x, sync bugs.
- [ ] Refresh-token race: single-flight claim verify karo (comment kehta hai fixed, actually test karo).
- [ ] Startup pe API config `console.log` — production me base URL leak.
- [ ] Admin token (`wabmeta_admin_token`) same localStorage me — privilege separation check.
- [ ] 401/403 handling: kya har protected call graceful logout karti hai?
- [ ] `.env` git-tracked hai — secrets exposure check.

## Phase 4 — API / Data Layer

**Backend mil gaya:** `c:/Users/Sameer Thakur/wabmeta-backend` (Express + Prisma + TS).
Source of truth: `src/modules/campaigns/campaigns.service.ts`

- [x] **`types/campaign.ts` backend se align kiya.** Frontend `Campaign` interface me sirf 14 fields the,
      backend `formatCampaign()` 22 bhejta hai. Ab exact match hai.
- [x] **BUG FIX — campaigns list pe template name kabhi nahi dikhta tha.**
      `Campaigns.tsx:515` `campaign.template?.name` padh raha tha, par list endpoint
      `templateName` (flat string) bhejta hai — koi `template` object hai hi nahi.
      Optional chaining ne error chupa liya, line silently render hi nahi hoti thi.
      Interesting: jo `CampaignCard.tsx` humne delete kiya, wo `templateName` **sahi** padh raha tha —
      type galat tha, component nahi.
- [x] `CampaignStats` me `replied` field add ki (backend bhejta hai, hamesha `0` —
      reply tracking implement hi nahi hui).

### ⚠️ Backend me mila: `campaigns.types.ts` ka `CampaignStats` interface stale hai

Declared interface me 16 fields hain (`draft`, `scheduled`, `running`, `averageDeliveryRate`…),
par `getStats()` actually 6 bhejta hai. Service ka return type `Promise<any>` hai isliye
TypeScript ne kabhi pakda nahi. **Backend side pe fix karna chahiye** — warna agli baar
koi us interface pe bharosa karke code likhega.

---

## Phase 4b — API / Data Layer (baaki)
- [ ] `services/api.ts` (1558 LOC) ko domain-wise split: auth / campaigns / contacts / inbox / admin / billing.
- [ ] Frontend types ko backend response se align karo (Phase 1 ke mismatches ka root cause yahi hai).
- [ ] 289 `catch` blocks audit — kitne silently swallow kar rahe hain.
- [ ] Loading / error / empty state har data-fetch pe present hai ya nahi.

## Phase 5 — React Correctness
- [ ] 178 `useEffect` — missing deps, stale closures, cleanup leaks.
- [ ] Socket listeners (`SocketProvider`, `useInboxSocket`, `useCampaignRealtime`) — unmount pe cleanup verify.
- [ ] Sirf 1 ErrorBoundary (root pe) — route-level boundaries add karo, taaki ek page crash pe pura app white-screen na ho.
- [ ] Data-fetch race conditions (fast navigation pe stale response overwrite).

## Phase 6 — UI/UX & Design Consistency ⭐ (in progress)

### Done

- [x] **653 inert `dark:` classes hataye** (30 files). ThemeProvider light pe pinned hai,
      to inme se ek bhi kabhi apply nahi hota tha — zero visual change, pura dead weight.
- [x] **21 dark screens ko light palette pe convert kiya** — 560 surfaces + 390 text colors.
      Admin panel (8 pages), Instagram (4 pages), aur 9 modals/components.
      `bg-[#0a0e27]` → `bg-white`, `border-white/[0.12]` → `border-gray-200`,
      `text-white` → `text-gray-900`, `text-gray-300` → `text-gray-700`.
      Palette invent nahi kiya — jo Campaigns/Contacts/Dashboard already use karte hain wahi liya.
- [x] **136 invalid Tailwind color classes fix kiye** (27 files) — neeche detail.
- [x] Contrast bug: `hover:text-white hover:bg-gray-100` (notification toast) — hover pe invisible tha.

Dark markers: **2,069 → 568**. Jo bache hain wo mostly `text-gray-400` hain, jo light bg pe
valid muted text hai — bug nahi.

### 🔴 136 Tailwind classes jo koi CSS generate hi nahi kar rahe the

`text-gray-550`, `text-gray-650`, `bg-gray-105`, `border-gray-250`, `text-gray-450`…
Tailwind me ye steps exist hi nahi karte (valid: 50/100/200…900/950), to **wo elements
bilkul colorless render ho rahe the** — browser default color le rahe the.

Pattern: kisi purane find-replace ne valid steps ko +5 ya +50 bump kar diya
(`gray-500`→`gray-550`, `gray-200`→`gray-250`). Wahi bug jo `border-gray-205` me mila tha.
Fix: nearest valid step pe round down — dono corruptions consistently reverse ho jaate hain.

### Intentionally dark chhoda (ye bug nahi hai)

Inhe convert karna cheezein todta:
- `components/landing/Footer.tsx` — deliberate dark footer (`bg-gradient-to-b from-gray-900`)
- `components/landing/About.tsx`, `Hero.tsx`, `WorkShowcase.tsx` — `bg-white/10` green gradient cards ke andar
- `pages/Blog.tsx` — intentional dark footer
- `components/inbox/CallScreen.tsx` — gradient call card, black backdrop pe
- `components/auth/AuthLayout.tsx` — gradient side panel
- `components/inbox/MessageBubble.tsx` — `border-white/*` sab `isOutbound` pe conditional hai
  (green bubbles pe sahi); inbound already `border-gray-200` use karta hai
- Spinner rings (`border-white/30 border-t-white`), dark CTA buttons (`bg-gray-900 text-white`),
  modal backdrops (`bg-slate-900/40`)

### Native dialogs khatam — 16 alert() + 17 confirm()

- [x] **16 `alert()` → `toast`**. Native alert page block karta hai, style nahi ho sakta.
- [x] **17 `window.confirm()` → proper dialog.** Naya `ConfirmProvider` + `useConfirm()` hook banaya
      (`src/context/ConfirmProvider.tsx`), jo kept `Modal.tsx` ke upar bana hai.
      Promise-based API hai to call sites ka shape same rehta hai:
      `if (!(await confirm({ title: '...', tone: 'danger' }))) return;`
- [x] `Contacts.tsx` ka group-delete flow: pehle OK/Cancel ko **do alag destructive choices**
      ke liye use kar raha tha (OK = group+contacts delete, Cancel = sirf group).
      Ab do saaf dialogs hain jinke buttons pe likha hai ki kya hoga.

### a11y — modals

12 me se **10 hand-rolled modals me Escape hi nahi tha, kisi me focus trap nahi,
kisi me body scroll lock nahi.** Har modal ko rewrite karna risky tha, isliye behaviour
ko `src/hooks/useModalA11y.ts` me nikala — 2 line ka change per modal:

- [x] Escape to close, Tab/Shift+Tab focus trap, body scroll lock, focus restore — **saare 12 modals me**
- [x] `MessageBubble` ka reply-quote (jump-to-message) sirf mouse se chalta tha —
      ab `role="button"` + `tabIndex` + Enter/Space handler
- [x] `WalletCostModal` ka table `overflow-hidden` me tha (mobile pe clip hota tha) → `overflow-x-auto`

Clickable `<div>` me se baaki sab modal backdrops hain — wo standard pattern hai
aur ab Escape kaam karta hai, to bug nahi.

### Jo check kiya aur theek nikla (kaam nahi banaya)

- **Empty states** — Templates/Contacts/Campaigns/Automation sab me proper empty states hain,
  filtered-vs-truly-empty distinguish bhi karte hain, CTA ke saath. Mera pehla grep crude tha.
- **Table overflow** — 17 me se 16 tables pehle se `overflow-x-auto` me wrapped the.

### Loading — PageSkeleton hataya

Problem ye tha ki ek page kholne pe **teen alag visuals** dikhte the:
`LoadingScreen` (full-screen logo) → `PageSkeleton` (fake dashboard: chart + stat cards) → asli page.

Aur `PageSkeleton` ek **generic dashboard skeleton** tha jo 6 aisi pages pe laga tha
jo waisi dikhti hi nahi (CampaignDetails, ChatbotBuilder, ContactDetails, LeadDetail,
CreateAutomation, OrganizationFeatures). Galat layout dikha ke phir badal jaana
wait ko lamba feel karata hai.

- [x] `PageSkeleton` delete (196 LOC). Naya `PageLoader` — halka spinner, **150ms delay**
      taaki fast loads pe kuch flash hi na ho.
- [x] `DashboardLayout` ka local `RouteLoader` bhi wahi shared component use karta hai.
      Ab poore app me **ek hi loading visual** hai.

### Unwired features — wire kiye

- [x] **Team page** — 13-line stub se poora feature. List + stats + invite + role change + remove.
      Backend me `/api/team` hai hi nahi (saare `team.*` API calls 404 karte),
      to `organizations/:id/members` pe point kiya aur dead `team` object hata diya.
      Roles bhi align kiye: frontend `owner/admin/manager/agent` maanta tha,
      backend `OWNER/ADMIN/MEMBER/VIEWER` hai.
- [x] **Landing FAQ** — Landing composition me add kiya.
- [x] **Settings → Business Profile** tab — fields (name/logo/website/industry/timezone)
      backend ke `updateOrganizationSchema` se exactly match karte hain.
- [x] **Instagram DM Automation** — mock data se real API pe. List + status toggle,
      aur naya `CreateDmRuleModal` (pehle "Create Rule" button kuch karta hi nahi tha).
      `instagram` API object bhi add kiya, jo tha hi nahi.

### Wire NAHI kiye — aur kyun

- **`WebhookLogs`** — pure mock data hai, koi API call nahi. Wire karne se users ko
  **fake webhook events asli lagenge**. Backend endpoint chahiye pehle.
- **`CreateCommentRuleModal`** — Instagram backend me comment-rule ka koi route nahi.
  `IgCommentRule` Prisma model exist karta hai, API nahi.
- **`Testimonials`** — named logon ke quotes hain (Rahul Sharma/QuickMart,
  Priya Mehta/EduLearn, Arjun Patel/TravelEasy). Agar ye real customers nahi hain
  to live marketing site pe daalna deceptive hoga. **Tumhara call hai.**
- **`AddPhoneModal`** — koi entry point nahi, aur kaunse flow me aana chahiye ye clear nahi.

### Baaki hai

- [ ] Design system adopt karna (11 orphan `common/` components bache hain)
- [ ] Responsive manual check (375px / tablet / desktop)

- [ ] **Design tokens**: 590 hardcoded hex colors → `index.css` tokens me consolidate.
- [ ] **Dark mode**: sirf 32/203 files me `dark:` — baaki pages dark mode me toot rahe honge. Har page verify.
- [ ] **`alert()` × 21** → `react-hot-toast` se replace (native alert app ko block karta hai, brand se off bhi lagta hai).
- [ ] **Responsive**: har page mobile (375px) / tablet / desktop pe check.
- [ ] **Loading states**: skeleton vs spinner consistency (`PageSkeleton`, `Loader`, `LoadingScreen` — 3 alag patterns).
- [ ] **Empty states**: har list page (Contacts, Campaigns, Templates, Leads, Chatbots) pe proper empty state.
- [ ] **Accessibility**: 16 clickable `<div>` (keyboard-inaccessible), focus rings, form label associations, modal focus trap.
- [ ] **Common components**: Button/Input/Card/Modal actual me consistently use ho rahe hain ya har page apna custom bana raha hai.

## Phase 7 — Performance
- [ ] `Inbox` chunk 489 kB — code-split (MessageBubble 1309 LOC, ChatInput 711 LOC).
- [ ] `index` chunk 454 kB — vendor splitting (recharts, framer-motion, xyflow).
- [ ] Long lists virtualise (conversations, contacts, leads).
- [ ] `React.memo` / `useMemo` heavy re-render paths pe.

## Phase 8 — Dead Code Cleanup
- [ ] 57 unused imports/variables (TS6133) — mostly lucide icons.
- [ ] Unused files/components detect karo.
- [ ] 118 `console.*` strip ya dev-guard.

## Phase 9 — Final Verification
- [ ] `tsc --noEmit` → 0 errors
- [ ] `npm run lint` → clean
- [ ] `npm run build` → clean
- [ ] Manual smoke test: har major flow (signup → login → dashboard → inbox → campaign → chatbot → admin)
- [ ] Before/after report

---

## Execution Order
`Phase 0 → 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8 → 9`

Rationale: pehle compile aur crash bugs (0-2), phir security (3), phir React correctness (5), phir UI polish (6). Refactors (4, 7) baad me kyunki wo risky hain aur unke liye stable base chahiye.
