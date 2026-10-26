import assert from "node:assert/strict";
import {
  difficultyForDuration,
  knownSessionError,
  publicAuthKey,
  serverKey,
  supabaseUrl,
  validDuration,
} from "./api/_lib/session.js";
import startHandler from "./api/session/start.js";

for (const duration of [15, 30, 60, 90, 120])
  assert.equal(validDuration(duration), duration);
for (const invalid of [0, -1, 14, 121, "30", null])
  assert.equal(validDuration(invalid), null);
assert.equal(difficultyForDuration(15), "detective");
assert.equal(difficultyForDuration(120), "legendary");
assert.deepEqual(knownSessionError({ detail: { code: "22023" } }), {
  status: 400,
  error: "Invalid session request",
});
assert.deepEqual(
  knownSessionError({
    detail: { code: "P0001", message: "Account is in cooldown" },
  }),
  { status: 409, error: "Account is in cooldown" },
);
assert.equal(knownSessionError({ detail: { code: "XX000" } }), null);
const previousAliases = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  secret: process.env.SUPABASE_SECRET_KEY,
};
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-key";
process.env.SUPABASE_SECRET_KEY = "server-key";
assert.equal(supabaseUrl(), "https://example.supabase.co");
assert.equal(publicAuthKey(), "public-key");
assert.equal(serverKey(), "server-key");
for (const [name, value] of Object.entries(previousAliases)) {
  const key = {
    url: "NEXT_PUBLIC_SUPABASE_URL",
    anon: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    publishable: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    secret: "SUPABASE_SECRET_KEY",
  }[name];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

const previousUrl = process.env.SUPABASE_URL;
const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
const response = {
  statusCode: null,
  body: null,
  headers: {},
  status(code) {
    this.statusCode = code;
    return this;
  },
  setHeader(key, value) {
    this.headers[key] = value;
  },
  json(body) {
    this.body = body;
    return this;
  },
};
await startHandler({ method: "POST", body: { duration: 30 } }, response);
assert.equal(response.statusCode, 503);
assert.match(response.body.error, /not configured/i);
if (previousUrl === undefined) delete process.env.SUPABASE_URL;
else process.env.SUPABASE_URL = previousUrl;
if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
console.log(
  "API contract checks passed: allowlist, difficulty mapping, and safe unconfigured response.",
);
