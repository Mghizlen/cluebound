# Cluebound Architecture

## System boundary

Cluebound is a dependency-light HTML/CSS/vanilla JavaScript frontend served by Vercel. `index.html` loads `app.js` and `styles.css`; Vercel serverless functions under `api/` form the authentication and session boundary. Supabase Auth verifies identities and PostgreSQL RPCs own session authorization.

The existing game remains in one browser module intentionally. Its responsibilities are separated internally into stage data, state transitions, persistence, API calls, renderers, modal handling, and event delegation. A later module split is possible, but introducing import boundaries now would add deployment and test complexity without changing the security model.

## Request flow

1. The browser calls `/api/auth/me` on startup.
2. Auth routes use `SUPABASE_ANON_KEY` for Supabase Auth REST calls and set Secure, HttpOnly access/refresh cookies.
3. Authenticated session routes verify the user token and create or read a one-year device cookie whose SHA-256 hash is stored server-side.
4. `/api/session/start` accepts only an allowlisted duration. The database derives timestamps and enforces the difficulty mapping, active-session lock, device conflict, and cooldown.
5. The browser displays the server deadline and periodically rechecks status. Local storage can restore puzzle progress only when the server session ID and deadline match.

## API responsibilities

- `api/_lib/session.js`: configuration checks, Supabase Auth calls, token refresh, cookie handling, device hashing, RPC calls, and known RPC error mapping.
- `api/auth/signup.js`: account creation and confirmation-required response.
- `api/auth/signin.js`: password sign-in and Auth cookie creation.
- `api/auth/signout.js`: Auth logout and cookie cleanup.
- `api/auth/me.js`: authenticated identity check with safe upstream failure handling.
- `api/session/status.js`: authoritative active/cooldown/device state.
- `api/session/start.js`: validated start or same-device resume.
- `api/session/heartbeat.js`: expiry/status revalidation without extending a deadline.

## Database security model

`public.cluebound_sessions` stores user-owned session records. RLS permits player reads, while direct client writes and RPC execution are revoked from public/authenticated roles. The Vercel server uses the service-role key only for the two security-definer RPCs. The RPCs validate identity and device-hash shape, set an explicit `public, pg_temp` search path, use a per-user advisory transaction lock, and anchor cooldown to `expires_at + interval '24 hours'`.

The migration has not been applied automatically. Review and apply it through an authorized Supabase workflow, then verify function privileges and policies in the target project.

## Frontend responsibilities

`app.js` owns the authoritative client view model and preserves the five stages, adaptive difficulty, evidence, inventory, hints, timer display, pause behavior, expiry screen, and compatible local puzzle progress. The browser is never trusted for session expiry or cooldown. `styles.css` defines the dark navy, cream, and gold visual system, accessible focus treatment, auth states, modal layout, and responsive rules.

## Environment contract

Use only `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. The public key is required for Auth REST calls; the service-role key is required only inside Vercel RPC calls. No database connection string is needed. `.env.example` contains placeholders only, and `.env` is ignored.

## Validation and incomplete work

The dependency-free tests cover five stages, answers, difficulty plans, session bounds, duration validation, known RPC errors, and auth rendering contracts. Syntax checks cover all API routes. Browser screenshots, real Supabase Auth, email confirmation, refresh rotation, database concurrency, cooldown transitions, device conflicts, and Vercel environment verification still require live/manual testing. Credential rotation must be completed manually because previously exposed privileged credentials are considered compromised. Tauri/Steam packaging remains incomplete until Rust/Tauri tooling is installed.
