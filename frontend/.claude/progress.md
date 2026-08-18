# Progress — Auth Implementation

Quick pickup doc for "where did we leave off." Full history/decisions live in
`CLAUDE.md`'s Session log; this file is just a checklist of the TODO'd auth
logic and what's left.

Last updated: 2026-08-18.

## Done

- [x] `src/lib/validators.js` — all validators implemented.
- [x] `src/api/auth.js` — `register`, `login`, `refresh` all implemented.
- [x] `src/context/AuthContext.jsx` — `login()` and `logout()` implemented.

## Not done — blocks end-to-end auth

- [ ] **`src/context/AuthContext.jsx` line ~35** — the mount-time `useEffect`
      that silently re-authenticates from the stored refresh token is still
      a TODO comment with no body. **This is the current blocker**: until
      it's filled in, `status` never leaves `"loading"`, so every
      `ProtectedRoute` shows "Checking your session…" forever, even for
      fresh logins in the same tab render cycle. Do this one first.
- [ ] `src/lib/jwt.js` — `decodeJwt` body (split on `.`, base64url-decode
      payload) is a TODO. `AuthContext.login()` already calls it, so login
      is currently broken until this exists.
- [ ] `src/api/admin.js` — `createOwner` request body TODO.
- [ ] `src/pages/Login.jsx` — `handleChange` + submit handler TODO.
- [ ] `src/pages/Register.jsx` — `handleChange`, `validate`, submit handler TODO.
- [ ] `src/pages/AdminDashboard.jsx` — `handleChange`, `validate`, submit handler TODO.

## Suggested order

1. `src/lib/jwt.js` (`decodeJwt`) — small, self-contained, unblocks login.
2. `src/context/AuthContext.jsx` mount effect — unblocks route guards/reload persistence.
3. `src/pages/Login.jsx` handlers — first thing testable end-to-end (register→login→redirect).
4. `src/pages/Register.jsx` handlers.
5. `src/api/admin.js` + `src/pages/AdminDashboard.jsx` handlers — create-owner flow.

## Verify once all filled in

Per `CLAUDE.md`'s Session 2 "Next" section:
- Customer register → login → redirect to `/customer`.
- Reload the page mid-session — session should persist (refresh-on-mount).
- Logout clears state and redirects.
- Role-mismatch redirect (e.g. customer hitting `/admin` bounces to `/customer`).
- Admin create-owner flow against the existing seeded admin account.
