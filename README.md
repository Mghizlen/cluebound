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

## Verification

The app can be syntax-checked with:

```powershell
node --check app.js
```

For a manual smoke test, start the static server, choose a short duration, inspect each room's evidence, solve the five answers above, and verify the completion summary. Refreshing during an active session should restore the same deadline rather than starting a new one.
