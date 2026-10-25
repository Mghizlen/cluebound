# Cluebound Architecture

## Current system

Cluebound is a static HTML/CSS/vanilla JavaScript game deployed through Vercel. `index.html` loads `app.js` and `styles.css`; `app.js` owns the five-stage content, adaptive difficulty, puzzle progression, local save state, and client deadline display. `test-game.mjs` runs dependency-free Node checks. There is currently no package manager, server route, authentication layer, database, or desktop wrapper.

## Implemented backend foundation

- `api/session/status.js` authenticates a Supabase bearer token and returns server-owned session state.
- `api/session/start.js` accepts only 15, 30, 60, 90, or 120 minutes and derives the difficulty server-side.
- `api/session/heartbeat.js` rechecks expiry without extending it.
- `api/auth/signup.js`, `api/auth/signin.js`, `api/auth/signout.js`, and `api/auth/me.js` provide the frontend authentication boundary using HttpOnly access and refresh cookies.
- `api/_lib/session.js` centralizes token verification, device-cookie hashing, duration validation, and Supabase RPC calls.
- `supabase/migrations/001_cluebound_sessions.sql` defines the session table, RLS read policy, device binding hash, server RPCs, and cooldown anchored to `expires_at + 24 hours`.

The existing game shell is preserved, but gameplay is intentionally blocked behind authentication and server authorization. The API returns HTTP 503 until Vercel environment variables and the migration are configured; it does not silently authorize an unverified server session.

## Security boundaries

The browser remains responsible only for rendering and local puzzle state. Supabase Auth identifies the player, Vercel routes verify the bearer token, and the database RPC owns duration, timestamps, active-session locking, device binding, and cooldown. Device cookies are supplemental and can be removed; account-level cooldown is the primary control.

## Next milestone

The next staged milestone is configuring Supabase and exercising real sign-in, cooldown, and device-conflict transitions. Tauri packaging should follow after installing Rust/Tauri tooling and proving the bundled static frontend works offline.
