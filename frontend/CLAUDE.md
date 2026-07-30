# Showtime — Frontend

Living project doc for Claude sessions working on this codebase. Read this
first; update the "Session log" at the bottom at the end of every session.

## Repo structure

This frontend lives inside a monorepo:

```
Showtime/                  ← git root (origin: github.com/prabh1805/showtime.git)
├── backend/                 Spring Boot API (Java 21, Maven)
└── frontend/                ← you are here (Vite + React + Tailwind)
```

Both folders share one `.git`. `backend/` was originally a standalone repo
nested one level too deep (`backend/showtime/`) with real commit history and
a GitHub remote — it was promoted up to `backend/` and merged into this
monorepo as history-preserving renames, then `frontend/` was added as a
fresh addition. See root `.gitignore` for OS-cruft-only rules; each of
`backend/` and `frontend/` keeps its own `.gitignore` for build artifacts.

## Tech stack

- **Frontend**: Vite + React 19 (plain JavaScript, not TypeScript) + Tailwind CSS v4
  - Tailwind v4 uses **CSS-first config** — no `tailwind.config.js`. Design
    tokens live in `src/index.css` under `@theme { ... }`.
  - Routing: `react-router-dom` (`BrowserRouter` in `main.jsx`, `<Routes>` in `App.jsx`).
- **Backend**: Spring Boot (Java 21), fully built, running at:
  ```
  http://localhost:8081
  ```

## Working preferences (how to collaborate with me)

- I'm learning deliberately. For each **component**: give me the full HTML
  structure + Tailwind styling. For **JS logic**: give me function signatures
  with doc-comments (purpose/params/return) — I write the implementation.
- Be token-conscious: prefer targeted diffs/edits over dumping full file
  contents back at me. If context is getting large and quality is dropping,
  say so directly and recommend starting a fresh session — this file should
  have enough for a new session to pick up cleanly.
- Confirm before destructive/high-blast-radius actions (repo restructuring,
  force pushes, deleting things). Ask when a decision is genuinely mine to make.

## Design direction

**Theme: light, anchored to real ticket-booking apps (BookMyShow, redBus)** —
not Netflix-style dark. Rationale: this is a short, task-focused booking flow
(find showtime → pick seat → pay), not a long immersive browsing session, so
light/high-contrast wins for legibility, trust, and daylight/outdoor use.

**Palette** (defined in `src/index.css` `@theme`, available as Tailwind
utilities e.g. `bg-paper`, `text-velvet`):

| Token | Hex | Role |
|---|---|---|
| `paper` | `#FAF7F0` | Page background (warm off-white, not stark white) |
| `surface` | `#FFFFFF` | Cards, inputs |
| `ink` | `#1A1A1F` | Primary text |
| `velvet` | `#8C2D3F` | Primary accent (buttons, links, focus) |
| `velvet-soft` | `#B8546A` | Hover/lighter accent variant |
| `marquee` | `#B5790F` | Secondary accent (ratings, highlights, badges) |
| `marquee-soft` | `#F2B134` | Lighter secondary accent |
| `mist` | `#746C5C` | Muted/secondary text |
| `hairline` | `#E4DCC8` | Borders/dividers |

**Typography** (also in `@theme`, as `font-display` / `font-sans` / `font-mono`):
- Display (`font-display`): `"Futura", "Avenir Next", "Century Gothic", "Segoe UI", sans-serif` — wordmark and headings only, used sparingly.
- Body (`font-sans`): system stack.
- Mono (`font-mono`): system mono stack — used for ticket/seat/booking data (e.g. `SEAT F12 · 19:45`), a deliberate nod to box-office print.

**Logo: "Spotlight Play"** (chosen from 3 concepts: Spotlight Play / Aperture S /
Ticket Notch) — a play-triangle catching a projector beam, no literal film
reel. Production component: `src/components/Logo.jsx`. Favicon updated to
match (`public/favicon.svg`).

A full Figma reference for a *show-discovery homepage* (dark, bold condensed
type, category pills, show cards with badges) was shared and is saved as
**future inspiration only** — it's out of Phase 1 scope (see below) and its
dark theme was explicitly not chosen for this app.

## Token storage strategy

- **Access token**: in-memory only (React state/context) — never persisted.
  Re-fetched via `/refresh` on app load.
- **Refresh token**: `localStorage` for now. Documented trade-off: this is
  vulnerable to XSS reading localStorage; httpOnly-cookie hardening is
  backlog, not needed for Phase 1.

Not yet implemented — this is the plan for when auth logic is built.

## Backend API contracts (Phase 1: Customer Register + Login only)

Other roles (theater staff, admin, owner) are admin-provisioned — out of
scope for self-service UI.

### `POST /api/v1/users/register`

Request:
```json
{
  "email": "string, required, valid email",
  "password": "string, required, min 8 chars, upper+lower+digit+special char",
  "firstName": "string, required",
  "lastName": "string, required",
  "mobileNumber": "string, optional"
}
```
Response `201`:
```json
{ "id": 0, "email": "", "firstName": "", "lastName": "", "mobileNumber": null, "role": "CUSTOMER" }
```
Errors: `409` (duplicate email), `400` (validation).

### `POST /api/v1/users/login`

Request: `{ "email": "string", "password": "string" }`
Response `200`: `{ "accessToken": "string", "refreshToken": "string" }`
Errors: `401` (invalid credentials, generic message).

## API client plumbing

`src/api/client.js` — plumbing only, no business logic yet:
- `API_BASE_URL` — `http://localhost:8081`
- `apiFetch(path, options)` — fetch wrapper: sets base URL + JSON headers,
  parses JSON/text response, throws `ApiError` (with `.status` and `.body`)
  on non-2xx.
- `ApiError` — structured error class.

Auth header injection is **not** wired in yet — that's business logic for
when register/login are actually built.

## Current routes

- `/` — placeholder home (links to `/login` and `/register`, will become the
  real show-discovery homepage later)
- `/register` — real Customer signup form (always creates role `CUSTOMER`,
  per the backend)
- `/login` — real login form for all roles; redirects to the matching
  dashboard below based on the JWT's `role` claim
- `/admin` — **ProtectedRoute** (`ADMIN` only) — real "create owner" form,
  the only endpoint the backend actually enforces (`hasRole("ADMIN")`)
- `/owner` — **ProtectedRoute** (`OWNER` only) — WIP placeholder (no
  owner-scoped theater lookup endpoint exists yet)
- `/staff` — **ProtectedRoute** (`STAFF` only) — WIP placeholder (no
  add-staff endpoint exists yet)
- `/customer` — **ProtectedRoute** (`CUSTOMER` only) — WIP placeholder
  (future show-discovery home)
- `*` — 404

`ProtectedRoute` (`src/components/ProtectedRoute.jsx`) redirects
unauthenticated visitors to `/login` and authenticated-wrong-role visitors to
their own dashboard via `roleHomePath()` (`src/lib/roles.js`). Note: this is
a client-side UX guard only — per `BACKEND_CONTRACT.md`'s "Known gaps"
section, the backend itself only enforces auth on `/api/v1/admin/**`.

## Session log

### 2026-07-30 — Session 2
**Built:**
- Read the Spring Boot backend's DTOs/controllers/exception handling
  (external contract only, no service/repo/entity code) and generated
  `BACKEND_CONTRACT.md` at the frontend root — now the source of truth for
  API integration. Surfaced two real gaps worth remembering: (1)
  `SecurityConfig` only enforces auth on `/api/v1/admin/**` — everything
  else is `permitAll()` regardless of `SecurityPaths.PUBLIC_PATHS`; (2)
  `CreateTheaterRequest`/`ChangePasswordRequest` DTOs exist with service
  methods behind them but no controller wires them up yet.
- Built real Register (`src/pages/Register.jsx`) and Login
  (`src/pages/Login.jsx`) forms, replacing the placeholders.
- Built `AuthContext`/`AuthProvider`/`useAuth()` (`src/context/AuthContext.jsx`)
  per the project's documented token strategy: access token in-memory only,
  refresh token in `localStorage`, silent re-auth via `/refresh` on app load.
- Added role-based routing: `/admin` (real "create owner" form —
  `src/pages/AdminDashboard.jsx`, the only backend-enforced endpoint) plus
  WIP placeholders for `/owner`, `/staff`, `/customer`
  (`OwnerDashboard.jsx`/`StaffDashboard.jsx`/`CustomerDashboard.jsx`), all
  gated by the new `ProtectedRoute` component
  (`src/components/ProtectedRoute.jsx`).
- Added shared form UI (`src/components/FormField.jsx`, `Button.jsx`,
  `FormError.jsx`), client-side validators mirroring backend rules
  (`src/lib/validators.js`), hand-rolled JWT payload decoding
  (`src/lib/jwt.js` — no new dependency), and role→path mapping
  (`src/lib/roles.js`).
- New API wrappers: `src/api/auth.js` (register/login/refresh) and
  `src/api/admin.js` (`createOwner` — first real use of Authorization-header
  injection via `apiFetch`'s existing `options.headers` passthrough;
  `client.js` itself was not modified).
- Per working-style preference, all JS *logic* (function bodies in
  `AuthContext`, validators, API wrapper internals, form submit handlers) was
  left as signatures + JSDoc doc-comments (`// TODO: ...`) for hand
  implementation; JSX markup/Tailwind styling was delivered in full.
  `npm run build` succeeds as-is; `npm run lint` currently shows expected
  `no-unused-vars` errors on the TODO'd files (will clear once implemented)
  plus one real, pre-existing-by-design finding: `AuthContext.jsx` exports
  both a component (`AuthProvider`) and a hook (`useAuth`) from one file,
  which trips `react-refresh/only-export-components` — a deliberate
  colocation choice (see plan), not a bug; split into a `hooks/` dir later
  if it becomes annoying.

**Key decisions:**
- Owner dashboard is a WIP stub this round, not a real "my theater" view —
  no owner-scoped theater lookup endpoint exists on the backend
  (`GET /api/v1/theaters` only filters by `city`, and login returns no
  `theaterId`).
- Self-registration only ever produces `CUSTOMER` accounts; Owner accounts
  only come from the Admin-only create-owner endpoint; Staff has no creation
  path anywhere yet. Change-password and create-theater UI were explicitly
  left out of scope (DTOs exist backend-side but no controller wires them up).
- Route guarding (`ProtectedRoute`) is a client-side UX layer only — it does
  not mirror real backend enforcement, which right now only covers
  `/api/v1/admin/**`.

**Next:**
- Implement the `// TODO:` logic left in: `src/context/AuthContext.jsx`,
  `src/lib/jwt.js`, `src/lib/validators.js`, `src/api/auth.js`,
  `src/api/admin.js`, `src/pages/Register.jsx`, `src/pages/Login.jsx`,
  `src/pages/AdminDashboard.jsx` — the app won't actually authenticate until
  these are filled in (route guards will show "Checking your session…"
  indefinitely until `AuthContext`'s refresh-on-mount logic is implemented).
- End-to-end verify per `BACKEND_CONTRACT.md`/the approved plan once logic is
  filled in: Customer register→login→`/customer`, reload-persists-session,
  logout, role-mismatch redirects, and the Admin create-owner flow against
  the user's existing seeded admin account.

### 2026-07-30 — Session 1
**Built:**
- Restructured the whole project into one monorepo: promoted the Spring Boot
  repo from `backend/showtime/` up to `backend/` (preserving its git history
  and GitHub remote), removed a stray duplicate `backend/frontend/`, added
  `frontend/` fresh, added root `.gitignore`.
- Fixed a pre-existing bug in `vite.config.js` (imported the Tailwind plugin
  from the wrong package — `tailwindcss` instead of `@tailwindcss/vite` —
  which broke `npm run build` entirely).
- Cleaned out Vite template cruft (`App.css`, default react/vite/hero assets,
  `icons.svg`, the template `App.jsx` body).
- Set up Tailwind v4 design tokens in `src/index.css` (`@theme` block — see
  Design direction above).
- Designed and iterated on 3 logo concepts + palette via an interactive
  artifact; landed on **Spotlight Play + light/paper palette**, anchored to
  BookMyShow/redBus rather than Netflix-dark (see Design direction).
- Built production `Logo.jsx`, updated `public/favicon.svg` to match.
- Set up `react-router-dom` with placeholder routes: `/`, `/register`,
  `/login`, `*` (404).
- Built `src/api/client.js` fetch wrapper (base URL, headers, `ApiError` shape).
- Verified with a real headless-browser run (Playwright screenshots + console
  check on all 3 routes) — no console errors, all pages render as expected.

**Key decisions:**
- Light theme, not dark — task-focused booking flow, not immersive browsing.
- Monorepo (one git repo for backend + frontend), not two separate repos.
- Figma dark-discovery-page reference is inspiration for a *future* homepage,
  not something that changes Phase 1 scope or theme.

**Not yet committed to git** — restructuring commits (backend move, frontend
add, root `.gitignore`) are done, but this session's frontend scaffolding
work (tokens, logo, routing, api client, CLAUDE.md) is still uncommitted as
of writing this. Confirm with the user before committing.

**Next:**
- Build the actual Register page (full form: email, password, firstName,
  lastName, mobileNumber) — HTML/Tailwind from Claude, JS logic as
  signatures per working preferences above.
- Build the actual Login page (email, password).
- Implement auth logic: in-memory access token context/provider, refresh
  token in localStorage, `/refresh` call on app load, wire `apiFetch` to
  attach the access token header.
