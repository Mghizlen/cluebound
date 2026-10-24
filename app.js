const STORAGE_KEY = "cluebound-active-session-v1";
const MAX_MINUTES = 120;
const durations = [15, 30, 60, 90, 120];

const stages = [
  {
    name: "The Forgotten Study",
    subtitle: "Dust remembers what people forget.",
    description: "Ashcroft Estate's study has been sealed since the night the Star of Ashcroft vanished. A note waits beneath the lamp.",
    objects: [
      { id: "notice", label: "A folded note", type: "clue" },
      { id: "desk", label: "The old desk", type: "puzzle" },
      { id: "lamp", label: "Brass lamp", type: "clue" },
      { id: "clock", label: "Silent clock", type: "clue" }
    ],
    puzzle: {
      title: "The desk's riddle",
      prompt: "I have a face and two hands, but no arms. I can run, but never walk. What am I?",
      answer: "clock",
      success: "The drawer clicks open. Inside is a small iron key.",
      reward: "Iron key",
      hint: "The answer is already in this room, keeping time."
    }
  },
  {
    name: "The Hidden Library",
    subtitle: "Every shelf has a secret, if you read the gaps.",
    description: "Three books carry the Ashcroft crest. Their dates and spine symbols form a sequence, but only one order fits the librarian's margin note.",
    objects: [
      { id: "books", label: "Three marked books", type: "puzzle" },
      { id: "margin", label: "Margin note", type: "clue" },
      { id: "globe", label: "A brass globe", type: "clue" }
    ],
    puzzle: {
      title: "The library sequence",
      prompt: "The margin says: 'Begin where the sun rises. Then follow the seasons.' Enter the four symbols in order: S (sunrise), F (first growth), H (high sun), F (fall).",
      answer: "sfhf",
      success: "A panel slides aside, revealing a silver gear and a charcoal rubbing of a triangle.",
      reward: "Silver gear",
      hint: "Use the margin note and the four seasonal symbols, not the books' printed titles."
    }
  },
  {
    name: "The Locked Workshop",
    subtitle: "A mechanism only trusts a careful hand.",
    description: "The workshop door is held by a gear mechanism. Three tools fit its sockets, but the correct sequence follows the maker's rule.",
    objects: [
      { id: "tools", label: "Mechanic's tools", type: "puzzle" },
      { id: "bench", label: "Workbench", type: "clue" },
      { id: "blueprint", label: "Faded blueprint", type: "clue" }
    ],
    puzzle: {
      title: "The workshop mechanism",
      prompt: "The blueprint reads: 'Shape before measure, measure before turn.' Choose the tool initials in that order: Chisel, Ruler, Wrench.",
      answer: "crw",
      success: "The gear turns smoothly. A brass lens drops from the opened compartment.",
      reward: "Brass lens",
      hint: "The blueprint describes actions, then the tools that perform them. Enter only their initials."
    }
  },
  {
    name: "The Secret Chamber",
    subtitle: "Past the wall, the house keeps its promise.",
    description: "A triangular lock waits behind the workshop. The rubbing, the gear, and the lens together reveal the order of its three rings.",
    objects: [
      { id: "lock", label: "Triangular lock", type: "puzzle" },
      { id: "rubbing", label: "Charcoal rubbing", type: "clue" },
      { id: "lens", label: "Brass lens", type: "clue" }
    ],
    puzzle: {
      title: "The chamber lock",
      prompt: "The rubbing shows a triangle. The gear marks the base, and the lens reveals the apex. Enter the ring order as the symbols appear: gear, lens, triangle.",
      answer: "glt",
      success: "The wall opens onto a narrow stair. At its foot, a final inscription glows in candlelight.",
      reward: "Chamber seal",
      hint: "The three objects you carry map directly to the three symbols: gear, lens, triangle."
    }
  },
  {
    name: "The Final Discovery",
    subtitle: "The truth was hidden in plain sight.",
    description: "The inscription reads: 'Where the first answer kept its face, look beneath what makes a shadow.' The Star of Ashcroft is close.",
    objects: [
      { id: "pedestal", label: "Stone pedestal", type: "puzzle" },
      { id: "inscription", label: "Final inscription", type: "clue" },
      { id: "shadow", label: "A long shadow", type: "clue" }
    ],
    puzzle: {
      title: "Reveal the artifact",
      prompt: "What object in the first room had a face and could make a shadow? Enter its name to reveal the Star of Ashcroft.",
      answer: "clock",
      success: "Beneath the clock's shadow, your fingers find a velvet box. The Star of Ashcroft is safe at last.",
      reward: "The Star of Ashcroft",
      hint: "Return to the exact answer of the first riddle."
    }
  }
];

const state = { view: "menu", selectedDuration: 30, stageIndex: 0, inventory: [], clues: [], hintsUsed: 0, startedAt: null, deadline: null, paused: false, pausedDisplaySeconds: null, solved: [], modal: null, feedback: "", toast: "", timerId: null };
let renderedClueCount = 0;
const app = document.querySelector("#app");
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const formatTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const currentStage = () => stages[state.stageIndex];

function saveSession() {
  if (!state.deadline || state.view !== "game") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ startedAt: state.startedAt, deadline: state.deadline, durationMinutes: state.selectedDuration, stageIndex: state.stageIndex, inventory: state.inventory, clues: state.clues, hintsUsed: state.hintsUsed, solved: state.solved }));
}
function clearSession() { localStorage.removeItem(STORAGE_KEY); }
function validStoredSession(session) {
  return session && Number.isFinite(session.startedAt) && Number.isFinite(session.deadline) && Number.isFinite(session.durationMinutes) && session.durationMinutes >= 1 && session.durationMinutes <= MAX_MINUTES && session.deadline >= session.startedAt && session.deadline - session.startedAt <= MAX_MINUTES * 60 * 1000 && session.stageIndex >= 0 && session.stageIndex < stages.length;
}
function restoreSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!validStoredSession(session)) { clearSession(); return false; }
    if (Date.now() >= session.deadline) { clearSession(); showExpired(); return true; }
    Object.assign(state, session, { view: "game", modal: null, feedback: "" });
    render(); startTimer(); return true;
  } catch { clearSession(); return false; }
}
function startNewGame() { state.view = "duration"; state.modal = null; render(); }
function beginSession() {
  const minutes = Number(state.selectedDuration);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_MINUTES) return;
  Object.assign(state, { view: "game", stageIndex: 0, inventory: [], clues: [], hintsUsed: 0, startedAt: Date.now(), deadline: Date.now() + minutes * 60 * 1000, paused: false, solved: [], modal: "tutorial", feedback: "" });
  saveSession(); render(); startTimer();
}
function remainingSeconds() { return Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000)); }
function ensureActive() { if (state.view !== "game" || !state.deadline || Date.now() >= state.deadline) { showExpired(); return false; } return true; }
function showExpired() { stopTimer(); clearSession(); Object.assign(state, { view: "expired", modal: null, deadline: null }); render(); }
function startTimer() { stopTimer(); state.timerId = setInterval(() => { if (state.view === "game" && remainingSeconds() <= 0) showExpired(); else updateTimer(); }, 250); }
function stopTimer() { if (state.timerId) clearInterval(state.timerId); state.timerId = null; }
function updateTimer() { const timer = document.querySelector("[data-timer]"); if (!timer || state.paused) return; const seconds = remainingSeconds(); timer.textContent = formatTime(seconds); timer.classList.toggle("urgent", seconds <= 60); }
function addClue(text) { if (!state.clues.includes(text)) state.clues.push(text); }
function toast(text) { state.toast = text; render(); setTimeout(() => { state.toast = ""; render(); }, 2400); }
function inspect(id) {
  if (!ensureActive()) return;
  const object = currentStage().objects.find(item => item.id === id);
  if (!object) return;
  if (object.type === "puzzle") { state.modal = "puzzle"; state.feedback = ""; render(); return; }
  const clues = { notice: "The note says: 'The first answer keeps a face and two hands.'", lamp: "The lamp casts a sharp shadow across the desk's locked drawer.", clock: "The clock has stopped at midnight, but its face is still clear.", margin: "The margin note names four moments: sunrise, first growth, high sun, fall.", globe: "A brass arrow points east. A tiny label reads: 'Begin where the sun rises.'", bench: "A clean groove on the bench matches a narrow gear, recently moved.", blueprint: "The blueprint reads: 'Shape before measure, measure before turn.'", rubbing: "The charcoal rubbing is a triangle with a gear at its base.", lens: "Through the lens, a tiny mark appears at the triangle's apex.", inscription: "The inscription says: 'Where the first answer kept its face, look beneath what makes a shadow.'", shadow: "The chamber candle throws a long shadow from a familiar round shape." };
  addClue(clues[id]); toast("Evidence added to your notebook."); saveSession();
}
function submitAnswer() {
  if (!ensureActive()) return;
  const input = document.querySelector("[data-answer]");
  const answer = input?.value.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!answer) return;
  if (answer === currentStage().puzzle.answer) { solveCurrent(); } else { state.feedback = "That does not fit the evidence. Inspect the room and try again."; render(); }
}
function solveCurrent() {
  const stage = currentStage();
  if (!state.solved.includes(state.stageIndex)) state.solved.push(state.stageIndex);
  if (!state.inventory.includes(stage.puzzle.reward)) state.inventory.push(stage.puzzle.reward);
  addClue(stage.puzzle.success); state.feedback = "Correct. " + stage.puzzle.success; state.modal = null; saveSession(); render();
  if (state.stageIndex === stages.length - 1) { state.view = "complete"; clearSession(); render(); }
}
function useHint() {
  if (!ensureActive()) return;
  state.hintsUsed += 1; state.feedback = `Hint ${state.hintsUsed}: ${currentStage().puzzle.hint}`; render(); saveSession();
}
function nextStage() {
  if (!ensureActive() || !state.solved.includes(state.stageIndex) || state.stageIndex >= stages.length - 1) return;
  state.stageIndex += 1; state.feedback = ""; saveSession(); render();
}
function pauseGame() { if (!ensureActive()) return; state.paused = !state.paused; state.pausedDisplaySeconds = state.paused ? remainingSeconds() : null; state.modal = state.paused ? "paused" : null; render(); }
function renderMenu() { return `<main class="screen"><section class="panel title-panel"><div class="eyebrow">An Ashcroft Estate mystery</div><h1>Cluebound</h1><p class="lede">A missing star. Five locked rooms. One investigator with the patience to read what the house left behind.</p><div class="button-row"><button class="button" data-action="new">Start New Game</button><span class="pill">A five-stage puzzle adventure</span></div><p class="muted">Created for curious investigators. Choose a time limit before you enter the estate.</p></section></main>`; }
function renderDuration() { return `<main class="screen"><section class="panel duration-panel"><div class="eyebrow">Before you enter</div><h2>Set your session</h2><p>Choose how long you would like to investigate. The countdown begins only when you press Begin Investigation and cannot exceed 120 minutes.</p><div class="duration-grid">${durations.map(minutes => `<button class="duration-choice ${state.selectedDuration === minutes ? "selected" : ""}" data-duration="${minutes}"><strong>${minutes}</strong><span>minutes</span></button>`).join("")}</div><p class="muted">When the timer reaches zero, the investigation ends so you can take a proper break.</p><div class="button-row"><button class="button" data-action="begin">Begin Investigation</button><button class="button secondary" data-action="menu">Back to Title</button></div></section></main>`; }
function renderGame() { const stage = currentStage(); const solved = state.solved.includes(state.stageIndex); const progress = Math.round((state.solved.length / stages.length) * 100); const displaySeconds = state.paused ? state.pausedDisplaySeconds : remainingSeconds(); return `<main class="game-screen"><header class="game-header"><div class="brand">CLUEBOUND</div><div class="header-meta"><span>Stage ${state.stageIndex + 1} of ${stages.length}</span><span class="timer ${state.paused ? "paused" : ""}" data-timer>${state.paused ? "PAUSED" : formatTime(displaySeconds)}</span><button class="button secondary" data-action="pause">${state.paused ? "Resume" : "Pause"}</button></div></header><div class="game-layout"><section class="scene"><div class="scene-top"><div class="eyebrow">${escapeHtml(stage.subtitle)}</div><h2>${escapeHtml(stage.name)}</h2><p>${escapeHtml(stage.description)}</p></div><div class="room-art" aria-label="Interactive illustration of ${escapeHtml(stage.name)}">${stage.objects.map(object => `<button class="object obj-${object.id}" data-object="${object.id}"><small>${object.type === "puzzle" ? "Investigate" : "Evidence"}</small>${escapeHtml(object.label)}</button>`).join("")}</div></section><aside class="side-panel"><div class="side-section"><h3>Investigator's log</h3><p class="muted">${state.clues.length ? "Evidence collected:" : "Inspect objects to collect evidence."}</p><ul class="clue-list">${state.clues.map(clue => `<li class="clue-item">${escapeHtml(clue)}</li>`).join("") || "<li class=\"muted\">Your notebook is empty.</li>"}</ul></div><div class="side-section"><h3>Inventory</h3><ul class="inventory-list">${state.inventory.map(item => `<li class="inventory-item">${escapeHtml(item)}</li>`).join("") || "<li class=\"muted\">Nothing collected yet.</li>"}</ul></div><div class="side-section"><h3>Progress</h3><div class="progress-bar"><span style="width:${progress}%"></span></div><p class="muted">${state.solved.length} of ${stages.length} locks solved</p><div class="button-row"><button class="button secondary" data-action="hint">Use a hint</button>${solved && state.stageIndex < stages.length - 1 ? `<button class="button" data-action="next">Next room</button>` : ""}</div></div></aside></div>${renderModal()}</main>`; }
function renderModal() { if (!state.modal) return ""; if (state.modal === "tutorial") return `<div class="modal-wrap"><section class="modal"><div class="eyebrow">Field notes</div><h2>How to investigate</h2><div class="tutorial"><p>Click the highlighted objects in each room to inspect them. Evidence goes into your log, while solved puzzles add useful items to your inventory.</p><p>Use a hint when you are stuck. The timer continues during a pause, so plan your investigation carefully.</p></div><button class="button" data-action="close-modal">Enter the study</button></section></div>`; if (state.modal === "paused") return `<div class="modal-wrap"><section class="modal"><div class="eyebrow">Investigation paused</div><h2>The house waits.</h2><p>Your session deadline continues to elapse while paused. Resume when you are ready.</p><button class="button" data-action="pause">Resume investigation</button></section></div>`; const puzzle = currentStage().puzzle; return `<div class="modal-wrap"><section class="modal"><div class="eyebrow">Puzzle ${state.stageIndex + 1}</div><h2>${escapeHtml(puzzle.title)}</h2><p>${escapeHtml(puzzle.prompt)}</p><div class="evidence">Use the evidence in your log. Answers are not case-sensitive.</div><div class="answer-row"><input data-answer aria-label="Puzzle answer" autocomplete="off" placeholder="Enter your answer"><button class="button" data-action="submit">Check</button></div><div class="feedback ${state.feedback.startsWith("Correct") ? "success" : ""}">${escapeHtml(state.feedback)}</div><div class="button-row"><button class="button secondary" data-action="hint">Need a hint</button><button class="button secondary" data-action="close-modal">Keep investigating</button></div></section></div>`; }
function renderExpired() { return `<main class="screen"><section class="panel end-panel"><div class="eyebrow">Session complete</div><h2>Time to step away</h2><p><strong>Enough with today's playing. Go do your homework or go out!</strong></p><p>Your play session has ended. Take a break and enjoy something offline.</p><div class="button-row" style="justify-content:center"><button class="button" data-action="new">Choose a new session</button><button class="button secondary" data-action="close-tab">Close tab</button></div><p class="muted">If your browser keeps this tab open, please close it manually.</p></section></main>`; }
function renderComplete() { const seconds = Math.max(0, Math.round((Date.now() - state.startedAt) / 1000)); return `<main class="screen"><section class="panel end-panel"><div class="eyebrow">Case closed</div><h2>The Star of Ashcroft is found.</h2><p>${escapeHtml(stages[4].puzzle.success)}</p><div class="stat-grid"><div class="stat"><strong>${formatTime(seconds)}</strong><span>completion time</span></div><div class="stat"><strong>${state.solved.length}/5</strong><span>stages solved</span></div><div class="stat"><strong>${state.hintsUsed}</strong><span>hints used</span></div><div class="stat"><strong>5/5</strong><span>rooms explored</span></div></div><p>The estate's secret is safe with you, Investigator.</p><button class="button" data-action="new">Start a new investigation</button></section></main>`; }
function render() {
  const oldClueList = app.querySelector(".clue-list");
  const oldScrollTop = oldClueList?.scrollTop ?? 0;
  const clueCount = state.clues.length;
  app.innerHTML = state.view === "menu" ? renderMenu() : state.view === "duration" ? renderDuration() : state.view === "game" ? renderGame() : state.view === "expired" ? renderExpired() : renderComplete();
  const newClueList = app.querySelector(".clue-list");
  if (newClueList) newClueList.scrollTop = clueCount > renderedClueCount ? newClueList.scrollHeight : oldScrollTop;
  renderedClueCount = clueCount;
}
app.addEventListener("click", event => { const target = event.target.closest("button"); if (!target) return; if (target.dataset.duration) { state.selectedDuration = Number(target.dataset.duration); render(); return; } const action = target.dataset.action; if (action === "new") startNewGame(); else if (action === "begin") beginSession(); else if (action === "menu") { clearSession(); stopTimer(); state.view = "menu"; render(); } else if (action === "pause") pauseGame(); else if (action === "close-modal") { state.modal = null; state.feedback = ""; render(); } else if (action === "submit") submitAnswer(); else if (action === "hint") useHint(); else if (action === "next") nextStage(); else if (action === "close-tab") window.close(); else if (target.dataset.object) inspect(target.dataset.object); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && state.view === "game" && !ensureActive()) return; updateTimer(); });
window.addEventListener("focus", () => { if (state.view === "game") ensureActive(); });
window.addEventListener("keydown", event => { if (event.key === "Enter" && document.querySelector("[data-answer]")) submitAnswer(); if (event.key === "Escape" && state.modal === "puzzle") { state.modal = null; render(); } });
if (!restoreSession()) render();
window.__CLUEBOUND_TESTS__ = { stages, validStoredSession, remainingSeconds };
