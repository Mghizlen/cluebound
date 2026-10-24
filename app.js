const STORAGE_KEY = "cluebound-active-session-v1";
const MAX_MINUTES = 120;
const difficultyLevels = [
  { minutes: 15, key: "detective", label: "Detective", description: "Easy; straightforward clues, fewer objects, and simple locks.", tier: 1, minEvidence: 1, puzzleSteps: 1, hintStyle: "direct" },
  { minutes: 30, key: "investigator", label: "Investigator", description: "Medium; more objects, misleading details, and multi-step clues.", tier: 2, minEvidence: 2, puzzleSteps: 2, hintStyle: "guided" },
  { minutes: 60, key: "master", label: "Master Detective", description: "Hard; interconnected clues and evidence from earlier stages.", tier: 3, minEvidence: 2, puzzleSteps: 3, hintStyle: "guided" },
  { minutes: 90, key: "expert", label: "Expert", description: "Very hard; linked puzzles, subtle hints, and challenging combinations.", tier: 4, minEvidence: 3, puzzleSteps: 4, hintStyle: "subtle" },
  { minutes: 120, key: "legendary", label: "Legendary Detective", description: "Expert; the most complex fair puzzles and connected locks.", tier: 5, minEvidence: 3, puzzleSteps: 5, hintStyle: "subtle" }
];
const durations = difficultyLevels.map(level => level.minutes);
const difficultyForDuration = minutes => difficultyLevels.find(level => level.minutes === Number(minutes)) || difficultyLevels[1];

const stages = [
  {
    name: "The Forgotten Study",
    subtitle: "Dust remembers what people forget.",
    description: "Ashcroft Estate's study has been sealed since the night the Star of Ashcroft vanished. A note waits beneath the lamp.",
    objects: [
      { id: "notice", label: "A folded note", type: "clue" },
      { id: "desk", label: "The old desk", type: "puzzle" },
      { id: "lamp", label: "Brass lamp", type: "clue" },
      { id: "clock", label: "Silent clock", type: "clue" },
      { id: "portrait", label: "Ashcroft portrait", type: "clue", minTier: 2 },
      { id: "astrolabe", label: "Dusty astrolabe", type: "clue", minTier: 4 }
    ],
    puzzle: {
      title: "The desk's riddle",
      prompt: "I have a face and two hands, but no arms. I can run, but never walk. What am I?",
      answer: "clock",
      success: "The drawer clicks open. Inside is a small iron key.",
      reward: "Iron key",
      hint: "The answer is already in this room, keeping time.",
      advancedSteps: [
        { minTier: 2, prompt: "The drawer released an object. What is it?", answer: "key", success: "The key bears a tiny star-shaped notch.", reward: "Study cipher mark", hint: "Name the object found inside the drawer." },
        { minTier: 3, prompt: "The silent clock stopped at what time?", answer: "midnight", success: "Midnight is written beside the star notch.", reward: "Midnight notation", hint: "A stopped clock points to the beginning of a new day." },
        { minTier: 4, prompt: "Combine the note's face and hands with the clock's midnight mark. Enter the two ideas together.", answer: "facehands", success: "The study's hidden notation reads: face, hands, midnight.", reward: "Study notation", hint: "Use the two body parts named by the riddle, without spaces." },
        { minTier: 5, prompt: "Whose estate are you investigating?", answer: "ashcroft", success: "The portrait's frame opens and reveals the estate seal.", reward: "Ashcroft seal", hint: "The name appears throughout the estate's story." }
      ]
    }
  },
  {
    name: "The Hidden Library",
    subtitle: "Every shelf has a secret, if you read the gaps.",
    description: "Three books carry the Ashcroft crest. Their dates and spine symbols form a sequence, but only one order fits the librarian's margin note.",
    objects: [
      { id: "books", label: "Three marked books", type: "puzzle" },
      { id: "margin", label: "Margin note", type: "clue" },
      { id: "globe", label: "A brass globe", type: "clue" },
      { id: "ledger", label: "Librarian's ledger", type: "clue", minTier: 2 },
      { id: "waxseal", label: "Broken wax seal", type: "clue", minTier: 3 },
      { id: "catalog", label: "Hidden catalogue card", type: "clue", minTier: 5 }
    ],
    puzzle: {
      title: "The library sequence",
      prompt: "The margin says: 'Begin where the sun rises. Then follow the seasons.' Enter the four symbols in order: S (sunrise), F (first growth), H (high sun), F (fall).",
      answer: "sfhf",
      success: "A panel slides aside, revealing a silver gear and a charcoal rubbing of a triangle.",
      reward: "Silver gear",
      hint: "Use the margin note and the four seasonal symbols, not the books' printed titles.",
      advancedSteps: [
        { minTier: 2, prompt: "Which item from the study unlocks the ledger drawer?", answer: "ironkey", success: "The ledger confirms that the seasonal order is intentional.", reward: "Library index", hint: "Use the first reward from the study, with no space." },
        { minTier: 3, prompt: "The ledger points to the shape on the charcoal rubbing. Name it.", answer: "triangle", success: "The triangle is stamped beside the seasonal sequence.", reward: "Triangle mark", hint: "It has three sides." },
        { minTier: 4, prompt: "Combine the seasonal sequence with the gear revealed by the shelf. Enter the sequence followed by the object.", answer: "sfhfgear", success: "The concealed compartment recognizes the linked evidence.", reward: "Library mechanism", hint: "Use SFHF, then the thing that turns." },
        { minTier: 5, prompt: "The catalogue card names the family whose seal appears on the key and portrait. Enter the family name.", answer: "ashcroft", success: "A second panel opens behind the catalogue.", reward: "Ashcroft catalogue", hint: "It is the estate name." }
      ]
    }
  },
  {
    name: "The Locked Workshop",
    subtitle: "A mechanism only trusts a careful hand.",
    description: "The workshop door is held by a gear mechanism. Three tools fit its sockets, but the correct sequence follows the maker's rule.",
    objects: [
      { id: "tools", label: "Mechanic's tools", type: "puzzle" },
      { id: "bench", label: "Workbench", type: "clue" },
      { id: "blueprint", label: "Faded blueprint", type: "clue" },
      { id: "oilcan", label: "Marked oil can", type: "clue", minTier: 2 },
      { id: "magnet", label: "Horseshoe magnet", type: "clue", minTier: 3 },
      { id: "copperplate", label: "Copper instruction plate", type: "clue", minTier: 5 }
    ],
    puzzle: {
      title: "The workshop mechanism",
      prompt: "The blueprint reads: 'Shape before measure, measure before turn.' Choose the tool initials in that order: Chisel, Ruler, Wrench.",
      answer: "crw",
      success: "The gear turns smoothly. A brass lens drops from the opened compartment.",
      reward: "Brass lens",
      hint: "The blueprint describes actions, then the tools that perform them. Enter only their initials.",
      advancedSteps: [
        { minTier: 2, prompt: "Which workshop reward from the library fits the mechanism's central socket?", answer: "silvergear", success: "The silver gear meshes with the workshop teeth.", reward: "Gear alignment", hint: "Use the item revealed in the library, with no space." },
        { minTier: 3, prompt: "The workbench groove matches the study's first reward. What is it?", answer: "ironkey", success: "The iron key traces a second line on the blueprint.", reward: "Keyed blueprint", hint: "It opened the first drawer." },
        { minTier: 4, prompt: "The blueprint's final diagram shows the library's three-sided mark. Enter its name.", answer: "triangle", success: "The triangle locks the tool sequence in place.", reward: "Workshop diagram", hint: "The rubbing showed this shape." },
        { minTier: 5, prompt: "The copper plate is signed with the estate family name. Enter it.", answer: "ashcroft", success: "The mechanism opens fully and exposes a passage to the chamber.", reward: "Workshop seal", hint: "Read the name on the estate." }
      ]
    }
  },
  {
    name: "The Secret Chamber",
    subtitle: "Past the wall, the house keeps its promise.",
    description: "A triangular lock waits behind the workshop. The rubbing, the gear, and the lens together reveal the order of its three rings.",
    objects: [
      { id: "lock", label: "Triangular lock", type: "puzzle" },
      { id: "rubbing", label: "Charcoal rubbing", type: "clue" },
      { id: "lens", label: "Brass lens", type: "clue" },
      { id: "seal", label: "Old door seal", type: "clue", minTier: 2 },
      { id: "starMap", label: "Faint star map", type: "clue", minTier: 3 },
      { id: "candlestick", label: "Three-pronged candlestick", type: "clue", minTier: 5 }
    ],
    puzzle: {
      title: "The chamber lock",
      prompt: "The rubbing shows a triangle. The gear marks the base, and the lens reveals the apex. Enter the ring order as the symbols appear: gear, lens, triangle.",
      answer: "glt",
      success: "The wall opens onto a narrow stair. At its foot, a final inscription glows in candlelight.",
      reward: "Chamber seal",
      hint: "The three objects you carry map directly to the three symbols: gear, lens, triangle.",
      advancedSteps: [
        { minTier: 2, prompt: "Which library reward forms the lock's base?", answer: "silvergear", success: "The gear ring clicks into the triangular lock.", reward: "Gear ring", hint: "It was revealed behind the library shelf." },
        { minTier: 3, prompt: "Which workshop reward reveals the apex?", answer: "brasslens", success: "The lens ring catches the candlelight.", reward: "Lens ring", hint: "It was found in the workshop compartment." },
        { minTier: 4, prompt: "The three rings echo the study's face-and-hands notation. What shape completes them?", answer: "triangle", success: "The triangle ring completes the chamber seal.", reward: "Triangle ring", hint: "The charcoal rubbing has three sides." },
        { minTier: 5, prompt: "The star map carries the same family name as the estate. Enter it.", answer: "ashcroft", success: "The secret chamber opens and the final inscription is revealed.", reward: "Chamber inscription", hint: "It is the name repeated in every room." }
      ]
    }
  },
  {
    name: "The Final Discovery",
    subtitle: "The truth was hidden in plain sight.",
    description: "The inscription reads: 'Where the first answer kept its face, look beneath what makes a shadow.' The Star of Ashcroft is close.",
    objects: [
      { id: "pedestal", label: "Stone pedestal", type: "puzzle" },
      { id: "inscription", label: "Final inscription", type: "clue" },
      { id: "shadow", label: "A long shadow", type: "clue" },
      { id: "floorTiles", label: "Loose floor tiles", type: "clue", minTier: 2 },
      { id: "compass", label: "Buried compass", type: "clue", minTier: 4 },
      { id: "velvetCase", label: "Empty velvet case", type: "clue", minTier: 5 }
    ],
    puzzle: {
      title: "Reveal the artifact",
      prompt: "What object in the first room had a face and could make a shadow? Enter its name to reveal the Star of Ashcroft.",
      answer: "clock",
      success: "Beneath the clock's shadow, your fingers find a velvet box. The Star of Ashcroft is safe at last.",
      reward: "The Star of Ashcroft",
      hint: "Return to the exact answer of the first riddle.",
      advancedSteps: [
        { minTier: 2, prompt: "The chamber seal points beneath the object that makes the long shadow. What is it?", answer: "clock", success: "The shadow marks a loose floor tile.", reward: "Shadow location", hint: "Return to the first room's answer." },
        { minTier: 3, prompt: "The loose tile is opened by the chamber's reward. Name it.", answer: "chamberseal", success: "The tile reveals a star-shaped recess.", reward: "Star recess", hint: "Use the seal earned in the chamber." },
        { minTier: 4, prompt: "The compass points toward the shape used by the chamber lock. What shape is it?", answer: "triangle", success: "The triangular recess releases the velvet case clasp.", reward: "Case clasp", hint: "The lock and rubbing share this shape." },
        { minTier: 5, prompt: "What artifact belongs inside the velvet case?", answer: "star", success: "The velvet case opens and the Star of Ashcroft shines beneath the clock's shadow.", reward: "The Star of Ashcroft", hint: "The story has named the missing object from the beginning." }
      ]
    }
  }
];

const state = { view: "menu", selectedDuration: 30, difficultyKey: "investigator", stageIndex: 0, inventory: [], clues: [], inspected: [], hintsUsed: 0, startedAt: null, deadline: null, paused: false, pausedDisplaySeconds: null, puzzleStep: 0, solved: [], modal: null, feedback: "", toast: "", timerId: null };
let renderedClueCount = 0;
const app = document.querySelector("#app");
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const formatTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const currentStage = () => stages[state.stageIndex];
const currentDifficulty = () => difficultyLevels.find(level => level.key === state.difficultyKey) || difficultyForDuration(state.selectedDuration);
const activeObjects = () => currentStage().objects.filter(object => !object.minTier || object.minTier <= currentDifficulty().tier);
const advancedSteps = () => (currentStage().puzzle.advancedSteps || []).filter(step => step.minTier <= currentDifficulty().tier);
const currentPuzzle = () => state.puzzleStep === 0 ? currentStage().puzzle : advancedSteps()[state.puzzleStep - 1];
const stageEvidenceCount = () => activeObjects().filter(object => object.type === "clue" && state.inspected.includes(object.id)).length;
const normalizeAnswer = value => String(value).trim().toLowerCase().replace(/[^a-z]/g, "");
const difficultyPlan = level => stages.map(stage => ({
  name: stage.name,
  objectCount: stage.objects.filter(object => !object.minTier || object.minTier <= level.tier).length,
  clueCount: stage.objects.filter(object => object.type === "clue" && (!object.minTier || object.minTier <= level.tier)).length,
  stepCount: 1 + (stage.puzzle.advancedSteps || []).filter(step => step.minTier <= level.tier).length
}));

function saveSession() {
  if (!state.deadline || state.view !== "game") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ startedAt: state.startedAt, deadline: state.deadline, durationMinutes: state.selectedDuration, difficultyKey: state.difficultyKey, stageIndex: state.stageIndex, inventory: state.inventory, clues: state.clues, inspected: state.inspected, hintsUsed: state.hintsUsed, puzzleStep: state.puzzleStep, solved: state.solved }));
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
    Object.assign(state, session, { view: "game", modal: null, feedback: "", difficultyKey: difficultyForDuration(session.durationMinutes).key, inspected: session.inspected || [], puzzleStep: Number.isInteger(session.puzzleStep) ? session.puzzleStep : 0 });
    state.puzzleStep = Math.min(Math.max(0, state.puzzleStep), advancedSteps().length);
    render(); startTimer(); return true;
  } catch { clearSession(); return false; }
}
function startNewGame() { state.view = "duration"; state.modal = null; render(); }
function beginSession() {
  const minutes = Number(state.selectedDuration);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_MINUTES) return;
  Object.assign(state, { view: "game", selectedDuration: minutes, difficultyKey: difficultyForDuration(minutes).key, stageIndex: 0, inventory: [], clues: [], inspected: [], hintsUsed: 0, startedAt: Date.now(), deadline: Date.now() + minutes * 60 * 1000, paused: false, pausedDisplaySeconds: null, puzzleStep: 0, solved: [], modal: "tutorial", feedback: "" });
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
  const object = activeObjects().find(item => item.id === id);
  if (!object) return;
  if (object.type === "puzzle") { state.modal = "puzzle"; state.feedback = ""; render(); return; }
  const clues = { notice: "The note says: 'The first answer keeps a face and two hands.'", lamp: "The lamp casts a sharp shadow across the desk's locked drawer.", clock: "The clock has stopped at midnight, but its face is still clear.", portrait: "The portrait's frame bears the Ashcroft family seal.", astrolabe: "The astrolabe is fixed at midnight, pointing toward a star.", margin: "The margin note names four moments: sunrise, first growth, high sun, fall.", globe: "A brass arrow points east. A tiny label reads: 'Begin where the sun rises.'", ledger: "The ledger confirms the seasonal order was used by the estate librarian.", waxseal: "The broken wax seal carries a three-sided mark.", catalog: "The catalogue card links the hidden shelf to the Ashcroft family.", bench: "A clean groove on the bench matches a narrow gear, recently moved.", blueprint: "The blueprint reads: 'Shape before measure, measure before turn.'", oilcan: "The oil can is marked with a silver gear symbol.", magnet: "The magnet pulls toward the iron key's hidden notch.", copperplate: "The copper plate is signed Ashcroft and lists the tool order.", rubbing: "The charcoal rubbing is a triangle with a gear at its base.", lens: "Through the lens, a tiny mark appears at the triangle's apex.", seal: "The old door seal repeats the star-shaped notch from the study key.", starMap: "The star map connects the library's gear to the chamber's triangle.", candlestick: "The three-pronged candlestick mirrors the chamber lock.", inscription: "The inscription says: 'Where the first answer kept its face, look beneath what makes a shadow.'", shadow: "The chamber candle throws a long shadow from a familiar round shape.", floorTiles: "One floor tile is loose beneath the long shadow.", compass: "The buried compass points toward a triangular recess.", velvetCase: "The empty velvet case is sized for a single star-shaped artifact." };
  if (!state.inspected.includes(id)) state.inspected.push(id);
  addClue(clues[id]); toast("Evidence added to your notebook."); saveSession();
}
function submitAnswer() {
  if (!ensureActive()) return;
  const input = document.querySelector("[data-answer]");
  const answer = normalizeAnswer(input?.value || "");
  if (!answer) return;
  if (answer === normalizeAnswer(currentPuzzle().answer)) { solveCurrent(); } else { state.feedback = "That does not fit the evidence. Inspect the room and try again."; render(); }
}
function solveCurrent() {
  const stage = currentStage();
  const puzzle = currentPuzzle();
  if (stageEvidenceCount() < currentDifficulty().minEvidence) { state.feedback = `Collect at least ${currentDifficulty().minEvidence} pieces of evidence in this room first.`; render(); return; }
  if (!state.inventory.includes(puzzle.reward)) state.inventory.push(puzzle.reward);
  addClue(puzzle.success);
  if (state.puzzleStep < advancedSteps().length) { state.puzzleStep += 1; state.feedback = "Correct. " + puzzle.success; state.modal = "puzzle"; saveSession(); render(); return; }
  if (!state.solved.includes(state.stageIndex)) state.solved.push(state.stageIndex);
  state.feedback = "Correct. " + puzzle.success; state.modal = null; saveSession(); render();
  if (state.stageIndex === stages.length - 1) { state.view = "complete"; clearSession(); render(); }
}
function useHint() {
  if (!ensureActive()) return;
  state.hintsUsed += 1;
  const hint = currentPuzzle().hint;
  const prefix = currentDifficulty().hintStyle === "direct" ? "" : currentDifficulty().hintStyle === "guided" ? "Think about the evidence: " : "The connection is subtle: ";
  state.feedback = `Hint ${state.hintsUsed}: ${prefix}${hint}`; render(); saveSession();
}
function nextStage() {
  if (!ensureActive() || !state.solved.includes(state.stageIndex) || state.stageIndex >= stages.length - 1) return;
  state.stageIndex += 1; state.puzzleStep = 0; state.feedback = ""; saveSession(); render();
}
function pauseGame() { if (!ensureActive()) return; state.paused = !state.paused; state.pausedDisplaySeconds = state.paused ? remainingSeconds() : null; state.modal = state.paused ? "paused" : null; render(); }
function renderMenu() { return `<main class="screen"><section class="panel title-panel"><div class="eyebrow">An Ashcroft Estate mystery</div><h1>Cluebound</h1><p class="lede">A missing star. Five locked rooms. One investigator with the patience to read what the house left behind.</p><div class="button-row"><button class="button" data-action="new">Start New Game</button><span class="pill">A five-stage puzzle adventure</span></div><p class="muted">Created for curious investigators. Choose a time limit before you enter the estate.</p></section></main>`; }
function renderDuration() { const selected = difficultyForDuration(state.selectedDuration); return `<main class="screen"><section class="panel duration-panel"><div class="eyebrow">Before you enter</div><h2>Set your session</h2><p>Choose how long you would like to investigate. The countdown begins only when you press Begin Investigation and cannot exceed 120 minutes.</p><div class="duration-grid">${difficultyLevels.map(level => `<button class="duration-choice ${state.selectedDuration === level.minutes ? "selected" : ""}" data-duration="${level.minutes}"><strong>${level.minutes}</strong><span>${escapeHtml(level.label)}</span></button>`).join("")}</div><div class="evidence"><strong>${escapeHtml(selected.label)}</strong><br>${escapeHtml(selected.description)}</div><p class="muted">When the timer reaches zero, the investigation ends so you can take a proper break.</p><div class="button-row"><button class="button" data-action="begin">Begin Investigation</button><button class="button secondary" data-action="menu">Back to Title</button></div></section></main>`; }
function renderGame() { const stage = currentStage(); const solved = state.solved.includes(state.stageIndex); const progress = Math.round((state.solved.length / stages.length) * 100); const displaySeconds = state.paused ? state.pausedDisplaySeconds : remainingSeconds(); return `<main class="game-screen"><header class="game-header"><div class="brand">CLUEBOUND</div><div class="header-meta"><span>${escapeHtml(currentDifficulty().label)} · Stage ${state.stageIndex + 1} of ${stages.length}</span><span class="timer ${state.paused ? "paused" : ""}" data-timer>${state.paused ? "PAUSED" : formatTime(displaySeconds)}</span><button class="button secondary" data-action="pause">${state.paused ? "Resume" : "Pause"}</button></div></header><div class="game-layout"><section class="scene"><div class="scene-top"><div class="eyebrow">${escapeHtml(stage.subtitle)}</div><h2>${escapeHtml(stage.name)}</h2><p>${escapeHtml(stage.description)}</p></div><div class="room-art" aria-label="Interactive illustration of ${escapeHtml(stage.name)}">${activeObjects().map(object => `<button class="object obj-${object.id}" data-object="${object.id}"><small>${object.type === "puzzle" ? "Investigate" : "Evidence"}</small>${escapeHtml(object.label)}</button>`).join("")}</div></section><aside class="side-panel"><div class="side-section"><h3>Investigator's log</h3><p class="muted">${state.clues.length ? "Evidence collected:" : "Inspect objects to collect evidence."}</p><ul class="clue-list">${state.clues.map(clue => `<li class="clue-item">${escapeHtml(clue)}</li>`).join("") || "<li class=\"muted\">Your notebook is empty.</li>"}</ul></div><div class="side-section"><h3>Inventory</h3><ul class="inventory-list">${state.inventory.map(item => `<li class="inventory-item">${escapeHtml(item)}</li>`).join("") || "<li class=\"muted\">Nothing collected yet.</li>"}</ul></div><div class="side-section"><h3>Progress</h3><div class="progress-bar"><span style="width:${progress}%"></span></div><p class="muted">${state.solved.length} of ${stages.length} locks solved · ${stageEvidenceCount()}/${currentDifficulty().minEvidence} evidence</p><div class="button-row"><button class="button secondary" data-action="hint">Use a hint</button>${solved && state.stageIndex < stages.length - 1 ? `<button class="button" data-action="next">Next room</button>` : ""}</div></div></aside></div>${renderModal()}</main>`; }
function renderModal() { if (!state.modal) return ""; if (state.modal === "tutorial") return `<div class="modal-wrap"><section class="modal"><div class="eyebrow">${escapeHtml(currentDifficulty().label)} field notes</div><h2>How to investigate</h2><div class="tutorial"><p>Click the highlighted objects in each room to inspect them. Evidence goes into your log, while solved puzzles add useful items to your inventory.</p><p>This session has ${currentDifficulty().puzzleSteps} puzzle step${currentDifficulty().puzzleSteps === 1 ? "" : "s"} per room. The timer continues during a pause, so plan your investigation carefully.</p></div><button class="button" data-action="close-modal">Enter the study</button></section></div>`; if (state.modal === "paused") return `<div class="modal-wrap"><section class="modal"><div class="eyebrow">Investigation paused</div><h2>The house waits.</h2><p>Your session deadline continues to elapse while paused. Resume when you are ready.</p><button class="button" data-action="pause">Resume investigation</button></section></div>`; const puzzle = currentPuzzle(); const title = state.puzzleStep === 0 ? currentStage().puzzle.title : `${currentStage().puzzle.title} · Step ${state.puzzleStep + 1}`; return `<div class="modal-wrap"><section class="modal"><div class="eyebrow">Puzzle ${state.stageIndex + 1} · Step ${state.puzzleStep + 1} of ${currentDifficulty().puzzleSteps}</div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(puzzle.prompt)}</p><div class="evidence">Collect ${currentDifficulty().minEvidence} piece${currentDifficulty().minEvidence === 1 ? "" : "s"} of evidence in this room before checking the answer. Answers are not case-sensitive.</div><div class="answer-row"><input data-answer aria-label="Puzzle answer" autocomplete="off" placeholder="Enter your answer"><button class="button" data-action="submit">Check</button></div><div class="feedback ${state.feedback.startsWith("Correct") ? "success" : ""}">${escapeHtml(state.feedback)}</div><div class="button-row"><button class="button secondary" data-action="hint">Need a hint</button><button class="button secondary" data-action="close-modal">Keep investigating</button></div></section></div>`; }
function renderExpired() { return `<main class="screen"><section class="panel end-panel"><div class="eyebrow">Session complete</div><h2>Time to step away</h2><p><strong>Enough with today's playing. Go do your homework or go out!</strong></p><p>Your play session has ended. Take a break and enjoy something offline.</p><div class="button-row" style="justify-content:center"><button class="button" data-action="menu">Return to title</button><button class="button secondary" data-action="close-tab">Close tab</button></div><p class="muted">If your browser keeps this tab open, please close it manually.</p></section></main>`; }
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
window.__CLUEBOUND_TESTS__ = { stages, difficultyLevels, difficultyForDuration, difficultyPlan, validStoredSession, remainingSeconds };
