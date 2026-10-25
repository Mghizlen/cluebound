import assert from "node:assert/strict";
import { difficultyForDuration, validDuration } from "./api/_lib/session.js";
import startHandler from "./api/session/start.js";

for (const duration of [15, 30, 60, 90, 120]) assert.equal(validDuration(duration), duration);
for (const invalid of [0, -1, 14, 121, "30", null]) assert.equal(validDuration(invalid), null);
assert.equal(difficultyForDuration(15), "detective");
assert.equal(difficultyForDuration(120), "legendary");

const previousUrl = process.env.SUPABASE_URL;
const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
const response = { statusCode: null, body: null, headers: {}, status(code) { this.statusCode = code; return this; }, setHeader(key, value) { this.headers[key] = value; }, json(body) { this.body = body; return this; } };
await startHandler({ method: "POST", body: { duration: 30 } }, response);
assert.equal(response.statusCode, 503);
assert.match(response.body.error, /not configured/i);
if (previousUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previousUrl;
if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
console.log("API contract checks passed: allowlist, difficulty mapping, and safe unconfigured response.");
