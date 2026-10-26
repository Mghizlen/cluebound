# Cluebound

Cluebound is a five-stage Ashcroft Estate mystery game. Investigate rooms, collect evidence, solve connected puzzles, and recover the Star of Ashcroft.

## Folder structure

```text
index.html                 Static browser entry point
app.js                     Game state, puzzle data, rendering, and API flow
styles.css                 Visual tokens, layout, responsive and accessibility styles
api/_lib/session.js        Shared Auth, cookies, device tokens, and RPC helpers
api/auth/                  Signup, signin, signout, and current-user routes
api/session/               Status, start/resume, and heartbeat routes
supabase/migrations/       Database schema and authoritative session RPCs
test-game.mjs              Dependency-free game and UI contract checks
test-api.mjs               API validation and error contract checks
```

## Local development

Serve the repository over HTTP so browser modules and API routes behave predictably:

```powershell
python -m http.server 8000
```

The static frontend is available at `http://localhost:8000`. The Python server does not execute the Vercel API routes; use a Vercel development environment with configured variables for authenticated local integration testing.

## Gameplay

The five durations select five server-validated difficulty levels: 15 Detective, 30 Investigator, 60 Master Detective, 90 Expert, and 120 Legendary Detective minutes. Higher levels add objects, evidence requirements, linked inventory requirements, and puzzle steps. The puzzle answers are unchanged:

1. `clock`
2. `SFHF`
3. `CRW`
4. `GLT`
5. `clock`

The browser renders progress and preserves compatible local progress, but it never authorizes a session. The server's `expires_at` controls the timer, cooldown, and resume behavior.

## Supabase and Vercel setup

Required Vercel variables are:

- `SUPABASE_URL`: the Supabase project URL.
- `SUPABASE_ANON_KEY`: the public Supabase Auth API key. It is used only for Auth REST requests.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used for the protected session RPCs.

Use placeholders only in `.env.example`. Do not add `.env` files, database passwords, JWT signing secrets, or privileged keys to source control or frontend code. The API returns `503` when required server variables are absent rather than authorizing gameplay.

Safe rollout:

1. Create or select the existing Supabase project.
2. Review `supabase/migrations/001_cluebound_sessions.sql` and apply it through the Supabase SQL editor or CLI only after authorization.
3. Add the three variables to Vercel Development, Preview, and Production environments as appropriate. Confirm names without printing values.
4. Configure Supabase Auth site and redirect URLs for the local and deployed origins.
5. Run authenticated smoke tests against a non-production account before any production deployment.

Authentication routes are `/api/auth/signup`, `/api/auth/signin`, `/api/auth/signout`, and `/api/auth/me`. Session routes are `/api/session/status`, `/api/session/start`, and `/api/session/heartbeat`.

The database owns duration validation, UTC timestamps, active-session locking, device conflicts, and the 24-hour cooldown measured from the original expiry. HttpOnly cookies carry Auth tokens and a hashed device token. Device binding is supplementary; account-level session and cooldown rules remain authoritative.

## Credential rotation checklist

Previously exposed Supabase database passwords, service-role/secret keys, and JWT signing secrets must be treated as compromised. Rotate them in the Supabase dashboard, update the matching Vercel environment variables, redeploy, and revoke old sessions or keys where Supabase provides that control. Do not paste the old or new values into issues, chat, logs, commits, or documentation. Rotation has not been performed automatically.

## Verification

```powershell
node --check app.js
node test-game.mjs
node test-api.mjs
Get-ChildItem api -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Manual accessibility checks should cover keyboard-only auth, visible focus, readable error/success states, modal focus, duration selection announcements, and mobile widths. Live Supabase signup, email confirmation, refresh-token rotation, cooldown transitions, device conflicts, and concurrent starts still require configured integration testing. Tauri packaging is incomplete because the Rust toolchain is not installed.
