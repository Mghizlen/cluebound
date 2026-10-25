import crypto from "node:crypto";

const ALLOWED_DURATIONS = [15, 30, 60, 90, 120];
const DIFFICULTY_BY_DURATION = {
  15: "detective",
  30: "investigator",
  60: "master",
  90: "expert",
  120: "legendary"
};
const DEVICE_COOKIE = "cluebound_device";

export function configError() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "Session service is not configured. Add the Supabase server variables in Vercel.";
  }
  return null;
}

export function json(res, status, body, headers = {}) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  return res.json(body);
}

export function readBearer(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

export async function verifiedUser(req) {
  const token = readBearer(req);
  if (!token) return null;
  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) return null;
  return response.json();
}

export function deviceToken(req, res) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${DEVICE_COOKIE}=([^;]+)`));
  if (match?.[1]) return decodeURIComponent(match[1]);
  const token = crypto.randomBytes(32).toString("base64url");
  res.setHeader("Set-Cookie", `${DEVICE_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);
  return token;
}

export function hashDeviceToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function rpc(name, payload) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error("Supabase session operation failed");
    error.status = response.status;
    error.detail = data;
    throw error;
  }
  return data;
}

export function validDuration(value) {
  const duration = Number(value);
  return Number.isInteger(duration) && ALLOWED_DURATIONS.includes(duration) ? duration : null;
}

export function difficultyForDuration(duration) {
  return DIFFICULTY_BY_DURATION[duration];
}

export { ALLOWED_DURATIONS };
