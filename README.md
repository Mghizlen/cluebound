# Cluebound

Cluebound is a static, five-stage mystery and treasure-hunt game set in the Ashcroft Estate. Investigate rooms, collect evidence, solve connected puzzles, and recover the Star of Ashcroft.

## Run locally

No build step or dependencies are required. Open `index.html` in a modern desktop browser, or serve the folder with any static server:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## How to play

Choose a session duration before beginning. The duration selects the difficulty automatically:

- **15 minutes - Detective:** straightforward clues, fewer objects, and one puzzle step per room.
- **30 minutes - Investigator:** more objects, two evidence-based puzzle steps, and misleading details.
- **60 minutes - Master Detective:** three connected steps per room and evidence from earlier rooms.
- **90 minutes - Expert:** four linked steps per room, more objects, and subtler hints.
- **120 minutes - Legendary Detective:** five connected steps per room and the largest object set.

The selected difficulty appears in the duration screen, tutorial, and game header. Click highlighted objects to inspect them, read the investigator's log, gather the required evidence, enter puzzle answers, and use hints when needed. The base answer key for the Detective path is:

1. `clock`
2. `SFHF`
3. `CRW`
4. `GLT`
5. `clock`

Answers are validated in the game and are not case-sensitive. The final screen reports completion time, stages solved, hints used, and rooms explored.

## Session limit

The duration selector offers 15, 30, 60, 90, and 120 minutes. The deadline starts only when a session begins. It is persisted in local storage and calculated from `Date.now()` rather than a decrementing counter, so hiding the tab, pausing, refreshing, or returning to the page cannot provide extra time during ordinary use. Expiry freezes gameplay and shows the required break message. A new session always requires a fresh duration selection.

This is a client-side static game. A technically advanced user can manipulate their own browser clock or local storage, so the timer is a responsible-gaming feature for normal use, not a tamper-proof security boundary.

## Publish for classmates

Upload the folder to a static host such as GitHub Pages. Keep `index.html`, `styles.css`, `app.js`, and `README.md` together in the published directory. No server, API key, account system, or database is needed.

## Server session foundation

The repository now includes a staged Supabase/Vercel session foundation in `api/`, `supabase/migrations/`, `.env.example`, and `ARCHITECTURE.md`. The existing static game remains playable until Supabase is configured; the API intentionally returns a configuration error rather than authorizing an unverified session.

To enable it:

1. Create a Supabase project and apply `supabase/migrations/001_cluebound_sessions.sql` through the Supabase SQL editor or CLI.
2. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Never expose the service-role key to the browser.
3. Deploy the project with `vercel --prod` and configure Supabase Auth redirect URLs for the deployed domain.

The API routes use verified Supabase bearer tokens, a Secure HttpOnly device cookie hash, server-created UTC timestamps, an advisory transaction lock, and a cooldown anchored to the stored expiry plus 24 hours. The device binding is supplementary; users can delete a browser cookie, so account-level server enforcement remains primary.

The Tauri desktop milestone is not enabled yet because Rust/Cargo is not installed in the current environment. The static frontend is suitable for a later Tauri wrapper once the toolchain is installed.

## Verification

The app can be syntax-checked with:

```powershell
node --check app.js
```

For a manual smoke test, start the static server, choose a short duration, inspect each room's evidence, solve the five answers above, and verify the completion summary. Refreshing during an active session should restore the same deadline rather than starting a new one.
