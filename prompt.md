# AI Coding Agent Prompt: Build Cluebound

## Your Role

Act as a senior game developer, gameplay designer, UI/UX designer, and test engineer. Build a complete, playable, polished browser game called **Cluebound**.

Do not stop after analyzing the repository or writing a plan. Inspect the existing project, explain the implementation briefly, and then implement and test the game. If the repository is empty, create the project structure and all required files. Make sensible decisions without asking questions unless a genuine blocker prevents progress.

## 1. Game Vision

**Cluebound** is an original strategy-based mystery and treasure-hunt game. The player explores locations, investigates objects, interprets clues, solves puzzles, and finds hidden items to progress through the story.

The game should feel like a real small indie puzzle-adventure game, not a quiz, a static presentation, or a generic landing page. Prioritize thoughtful puzzles, satisfying feedback, atmospheric visuals, and a smooth user experience.

The game also promotes responsible gaming. Before playing, the user must select a session duration. The maximum allowed duration is **120 minutes (2 hours)**. When time expires, gameplay must stop and the game must display the end-of-session message defined below.

## 2. Technology and Project Setup

- First inspect the current repository, package files, framework, and existing code. Reuse the current stack if a project already exists and is suitable.
- If the repository is empty, build a lightweight browser game using **HTML, CSS, and vanilla JavaScript**. Do not add a framework without a strong reason.
- The game must run locally in a modern desktop browser and be straightforward to publish as a static website, for example with GitHub Pages.
- No backend, account system, paid service, API key, or database should be required.
- Do not use mock buttons or decorative controls that do nothing.
- Do not introduce Docker unless the existing project specifically requires it.
- Keep code modular, readable, and commented where the logic is non-obvious.
- Use local assets or CSS/SVG-generated art where practical. Do not rely on external images loading for core gameplay.
- Include a `README.md` with setup, run, build/deployment (if applicable), and gameplay instructions.
- If creating a new project, include all necessary files and a clear entry point such as `index.html`.

## 3. Game Story and Stages

Create a short, coherent mystery about a missing valuable artifact hidden inside an old estate. The player is an investigator who must discover the artifact by solving connected puzzles.

Implement these five stages. The game must have actual interactions and working puzzle logic in every stage.

### Stage 1: The Forgotten Study
- Teach the player how to inspect objects and use clues.
- The player finds a note, examines a desk, and solves a simple riddle to obtain a key.
- Introduce the inventory and hint system.
- Explain controls through a short, dismissible tutorial.

### Stage 2: The Hidden Library
- The player investigates books, symbols, and written clues.
- Solve a code or sequence puzzle to unlock a concealed compartment.
- Use at least two pieces of evidence; avoid making the answer obvious without investigation.

### Stage 3: The Locked Workshop
- The player inspects several tools and objects.
- Determine which objects or sequence can operate a mechanism.
- Provide useful feedback for incorrect choices without immediately revealing the solution.

### Stage 4: The Secret Chamber
- Combine information learned in earlier stages.
- Solve a multi-step puzzle to open the chamber.
- Ensure clues from earlier stages matter and the solution is logically deducible.

### Stage 5: The Final Discovery
- Use the final clues to locate and reveal the hidden artifact.
- Show an ending screen with the player's completion time, stages completed, hints used, and final result.
- Offer a clear option to start a new game, subject to the session-limit rules.

The story, object names, clues, and puzzle answers must be consistent. Create an internal answer key or documented puzzle data so the puzzles can be verified during testing.

## 4. Gameplay Requirements

Implement all of the following:

- A main menu with the game title, a short premise, and a **Start New Game** action.
- A required session-duration selection screen shown before every new session.
- A maximum duration of exactly 120 minutes. Never offer or accept a longer duration.
- Duration options such as 15, 30, 60, 90, and 120 minutes. A custom duration is optional, but if implemented it must be validated and capped at 120 minutes.
- A clear, visible countdown timer while playing.
- A location/room view with clickable or otherwise accessible objects to investigate.
- Clue descriptions and readable text.
- A working inventory for collected items.
- Puzzle interfaces with real validation and success/failure feedback.
- A hint system. Hints should help without immediately giving away every answer; track the number of hints used.
- Stage progression that only unlocks after the required puzzle is solved.
- A pause/resume feature if practical. **Pausing must not allow the player to bypass the overall session limit.** Decide and document whether deliberate pause stops the countdown; the safest default is that the session deadline continues to elapse while paused.
- A progress/score summary and an end screen.
- A restart/new-session flow that requires choosing a new duration.
- Responsive layouts, accessible contrast, keyboard-friendly controls, visible focus states, and sensible text sizes.
- Save progress locally if practical, but never let saved state or a page refresh reset, extend, or bypass the active session deadline.

## 5. Mandatory Session-Time Limit

This is a core gameplay and responsible-gaming feature, not an optional decoration.

### Before gameplay
- The player must choose a session duration before entering the first stage.
- The maximum is 120 minutes (7,200 seconds).
- Display the selected duration and explain that the game will end when the time runs out.
- Do not start the countdown on the menu or duration-selection screen. Start it when the player explicitly begins the session.

### During gameplay
- Show the remaining time clearly in the game interface.
- Use a deadline-based timer rather than relying only on decrementing a counter every second. Store the session start/deadline using a reliable browser time source such as `Date.now()` and calculate remaining time from the deadline. This prevents ordinary timer drift.
- Check expiry on a regular interval and whenever the page becomes visible again, the window regains focus, or the game is resumed.
- If the browser tab is hidden or the user switches away, the deadline must continue to elapse.
- A refresh must not reset the selected duration or create extra playtime for the same active session. Persist the deadline and active-session state locally if feasible.
- Validate stored values before using them. Corrupt or manipulated local data must not produce a session longer than 120 minutes from the saved session start. Do not claim that a client-side-only game can prevent a technically advanced user from manipulating their own browser clock or storage; document this limitation in the README.
- Prevent gameplay actions after the deadline has expired, even if the timer display has not yet visually updated.

### When time expires
Immediately:
1. Stop accepting gameplay input and puzzle interactions.
2. Cancel active gameplay timers and disable or block all game controls.
3. Display a full-screen end-of-session overlay or screen.
4. Show this exact message, preserving the wording and meaning:

   **"Enough with today's playing. Go do your homework or go out!"**

5. Display a short explanation such as: "Your play session has ended. Take a break and enjoy something offline."
6. Do not allow the player to resume the expired session or continue by navigating back to a stage.
7. Allow the user to close the tab or return to the title screen. Returning to the title screen must not restore the expired session; a new session requires a fresh duration selection.

A normal website cannot reliably close its own browser tab unless that tab was opened by script. Therefore, **do not rely on `window.close()` as the enforcement mechanism**. Freeze gameplay and show the full-screen end-of-session screen. You may provide a clearly labelled "Close tab" button that attempts `window.close()` and, if the browser blocks it, leaves the end screen visible with a polite instruction to close the tab manually.

### Timer test cases
Test and handle these cases:
- A session expires while the player is actively playing.
- The player switches tabs and returns after the deadline.
- The player refreshes the page during an active session.
- The player pauses and resumes.
- The player tries to trigger a puzzle action after expiry.
- The player starts a new session after an expired session.
- Invalid or over-limit duration values are supplied.
- The remaining time reaches zero exactly.

## 6. Art Direction and User Experience

Aim for a polished mystery atmosphere:
- Dark navy, charcoal, parchment, muted gold, and warm candlelight accents.
- A mysterious old study/library aesthetic with readable interfaces.
- Subtle transitions, hover states, button feedback, and restrained animation.
- Clear visual hierarchy: location name, scene, interactive objects, clue panel, inventory, stage indicator, and timer.
- Use simple original room illustrations, CSS shapes, SVG, or locally stored assets. Visual quality must not make the game slow or obscure clues.
- Avoid excessive neon, clutter, tiny text, or generic dashboard design.
- Add sound effects only if they can be implemented cleanly, and provide a mute control. Do not autoplay loud audio.
- Make the game usable on common laptop screens and adapt to smaller screens.

## 7. Presentation-Friendly Features

This game will be demonstrated to classmates during an English presentation. Include:
- A concise introductory story screen.
- A short explanation of how to play.
- Clearly named characters or narrative roles, even if the player is the only on-screen character.
- A visible stage/level indicator.
- A polished completion screen suitable for showing to the class.
- A reset path so the game can be demonstrated again, with a new session duration selection.
- Clear English throughout the interface. Proofread grammar and spelling.

## 8. Code Quality and Architecture

- Separate game state, puzzle definitions, UI rendering, and timer/session logic where appropriate.
- Keep puzzle solutions and progression checks in code, not only in visual text.
- Avoid duplicated event listeners and timers.
- Clean up intervals and event handlers when changing states.
- Use safe DOM APIs and avoid injecting untrusted text through `innerHTML`.
- Handle invalid input gracefully.
- Avoid dependencies unless they add meaningful value.
- Do not leave TODOs, placeholder screens, dead links, or unimplemented core features.
- Do not overwrite unrelated existing work. Inspect before editing.
- Keep the project easy for a student to understand and present.

## 9. Testing and Completion Checklist

Before declaring the task complete:

1. Inspect the repository and identify the current stack.
2. Implement the game and all required files.
3. Run any available linting, build, or test commands.
4. Test the main flow from menu to duration selection, all five stages, final discovery, and ending screen.
5. Test each puzzle's correct and incorrect answers.
6. Test session expiry and all timer edge cases listed above.
7. Check the layout at desktop and smaller viewport widths.
8. Fix errors discovered during testing.
9. Provide a concise final report listing:
   - Files created or changed.
   - Implemented features.
   - Commands to run the game locally.
   - How to publish it for classmates.
   - Tests actually run and their results.
   - Any known limitations.

Do not claim that a test passed unless you actually ran it. If browser automation is unavailable, perform the available checks and explicitly state what could not be verified.

## 10. Priority Order

If time is limited, implement in this order:

1. A genuinely playable end-to-end game.
2. Correct, logical, testable puzzles across all five stages.
3. Mandatory session selection and robust expiry enforcement.
4. Inventory, hints, progression, and completion summary.
5. Visual polish, animation, and optional sound.

**Final instruction:** Start by inspecting the current workspace, then build the complete playable game. Do not merely return recommendations, a wireframe, or a development plan.
