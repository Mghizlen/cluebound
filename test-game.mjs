import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("app.js", "utf8");
const app = { innerHTML: "", addEventListener() {}, querySelector() { return null; } };
const context = { console, Date, setInterval, clearInterval, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, document: { querySelector: selector => selector === "#app" ? app : null, addEventListener() {}, visibilityState: "visible" }, window: { addEventListener() {} }, setTimeout() {} };
vm.createContext(context);
vm.runInContext(source, context);
const tests = context.window.__CLUEBOUND_TESTS__;
if (!tests || tests.stages.length !== 5) throw new Error("Expected five stages");
if (tests.stages.map(stage => stage.puzzle.answer).join(",") !== "clock,sfhf,crw,glt,clock") throw new Error("Answer key mismatch");
if (!tests.validStoredSession({ startedAt: 1000, deadline: 1000 + 120 * 60 * 1000, durationMinutes: 120, stageIndex: 0 })) throw new Error("Valid maximum session rejected");
if (tests.validStoredSession({ startedAt: 1000, deadline: 1000 + 121 * 60 * 1000, durationMinutes: 121, stageIndex: 0 })) throw new Error("Over-limit session accepted");
console.log("Cluebound logic checks passed: five stages, answer key, and session bounds.");
