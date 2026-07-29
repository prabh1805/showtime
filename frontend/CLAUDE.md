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
- `/register` — placeholder (real form not built yet)
- `/login` — placeholder (real form not built yet)
- `*` — 404

## Session log

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
