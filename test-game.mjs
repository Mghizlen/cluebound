import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("app.js", "utf8");
const app = {
  innerHTML: "",
  addEventListener() {},
  querySelector() {
    return null;
  },
};
const context = {
  console,
  Date,
  setInterval,
  clearInterval,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  document: {
    querySelector: (selector) => (selector === "#app" ? app : null),
    addEventListener() {},
    visibilityState: "visible",
  },
  window: { addEventListener() {} },
  setTimeout() {},
};
vm.createContext(context);
vm.runInContext(source, context);
const tests = context.window.__CLUEBOUND_TESTS__;
if (!tests || tests.stages.length !== 5)
  throw new Error("Expected five stages");
if (
  tests.stages.map((stage) => stage.puzzle.answer).join(",") !==
  "clock,sfhf,crw,glt,clock"
)
  throw new Error("Answer key mismatch");
if (tests.difficultyLevels.length !== 5)
  throw new Error("Expected five difficulty levels");
if (
  tests.difficultyLevels
    .map((level) => tests.difficultyForDuration(level.minutes).key)
    .join(",") !== "detective,investigator,master,expert,legendary"
)
  throw new Error("Duration-to-difficulty mapping mismatch");
for (const level of tests.difficultyLevels) {
  const plan = tests.difficultyPlan(level);
  for (const [index, stage] of tests.stages.entries()) {
    const availableSteps =
      1 +
      (stage.puzzle.advancedSteps || []).filter(
        (step) => step.minTier <= level.tier,
      ).length;
    if (
      availableSteps !== level.puzzleSteps ||
      plan[index].stepCount !== level.puzzleSteps
    )
      throw new Error(`Step count mismatch for ${level.label}`);
    if (plan[index].clueCount < level.minEvidence)
      throw new Error(
        `Not enough clues for ${level.label} in stage ${index + 1}`,
      );
    if (plan[index].objectCount < plan[index].clueCount)
      throw new Error(
        `Invalid object plan for ${level.label} in stage ${index + 1}`,
      );
    if (
      (stage.puzzle.advancedSteps || []).some(
        (step) => !step.answer || !step.hint || !step.success || !step.reward,
      )
    )
      throw new Error(`Incomplete puzzle step in stage ${index + 1}`);
  }
}
if (
  !tests.validStoredSession({
    startedAt: 1000,
    deadline: 1000 + 120 * 60 * 1000,
    durationMinutes: 120,
    stageIndex: 0,
  })
)
  throw new Error("Valid maximum session rejected");
if (
  tests.validStoredSession({
    startedAt: 1000,
    deadline: 1000 + 121 * 60 * 1000,
    durationMinutes: 121,
    stageIndex: 0,
  })
)
  throw new Error("Over-limit session accepted");
tests.state.authMode = "signin";
const signInMarkup = tests.renderAuth();
if (
  !signInMarkup.includes('for="auth-email"') ||
  !signInMarkup.includes('id="auth-email"') ||
  !signInMarkup.includes('aria-describedby="auth-description')
)
  throw new Error("Sign-in accessibility contract mismatch");
tests.state.authMode = "signup";
const signUpMarkup = tests.renderAuth();
if (
  !signUpMarkup.includes("Create investigator account") ||
  !signUpMarkup.includes('autocomplete="new-password"') ||
  !signUpMarkup.includes('data-action="toggle-password"')
)
  throw new Error("Sign-up rendering contract mismatch");
tests.state.user = { id: "test-user", email: "test@example.com" };
tests.state.serverAuthorized = true;
tests.state.view = "menu";
tests.startNewGame();
if (tests.state.view !== "duration")
  throw new Error("Authenticated new-game navigation returned to auth");
console.log(
  "Cluebound logic checks passed: five stages, answer key, five difficulty mappings, tiered steps, and session bounds.",
);
