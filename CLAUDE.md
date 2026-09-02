# WabMeta (web)

React + TypeScript web app. Part of the `wabmeta` DevMemory workspace, alongside
`wabmeta-backend` (Express API) and `wabmeta-mobile` (Expo).

## Session protocol

**Start every session with `handoff`.** It returns the current task, what the last
session did, the decisions that still bind you, and the recommended next step — so
you do not have to ask Sameer to re-explain the project.

```
project_connect  ->  handoff
```

**End every session with `session_end`,** with a summary of what you changed and
what is left. The next session reads it. A session that ends without this leaves
the next agent starting from nothing.

While working:

- `get_context` **before reading files.** It selects the files that matter for the
  task instead of you opening twenty to find three.
- `remember` any decision worth keeping — why a component holds state where it
  does, why an endpoint is called twice, what a backend constraint forced.
- `task_create` / `task_update` for anything spanning more than one session.

## This app depends on a backend it does not import

Every call in `src/services/api.ts` reaches an Express route in `wabmeta-backend`,
and no import, type or build step connects the two. A route rename there breaks
this app at runtime with a clean compile here.

Before changing or adding an API call, check that the route exists:

```
api_contracts  scope: "wabmeta"
```

`impact_analysis` on a file now reports both directions — the routes a file calls
and who serves them, and a warning when a call matches no route.

## Known: two calls here reach no backend route

Verified 2026-09-03 against every route the backend registers:

- `POST /api/inbox/conversations/:id/messages/:msgId/react` — [src/pages/Inbox.tsx:890](src/pages/Inbox.tsx#L890)
- `PATCH /api/inbox/conversations/:id/messages/:msgId/star` — [src/pages/Inbox.tsx:856](src/pages/Inbox.tsx#L856)

The reaction and star features call endpoints the backend does not serve. Do not
delete the callers to make the warning go away — ask which side is meant to change.

## Shared types

`Template` is declared separately in all three repositories with nothing linking
them (here at `src/types/template.ts:45`, backend `meta.types.ts:237`, mobile
`src/types/template.ts:23`). Adding or renaming a field in one leaves the other two
compiling and wrong. Use `search_context` with `workspace: "wabmeta"` to find every
copy before editing.
