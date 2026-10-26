import crypto from "node:crypto";

const ALLOWED_DURATIONS = [15, 30, 60, 90, 120];
const DIFFICULTY_BY_DURATION = {
  15: "detective",
  30: "investigator",
  60: "master",
  90: "expert",
  120: "legendary",
};
const DEVICE_COOKIE = "cluebound_device";
const ACCESS_COOKIE = "cluebound_access";
const REFRESH_COOKIE = "cluebound_refresh";

export function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function publicAuthKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function serverKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
}

export function configError() {
  if (!supabaseUrl() || !publicAuthKey() || !serverKey()) {
    return "Session service is not configured. Add the Supabase URL, public Auth key, and server key in Vercel.";
  }
  return null;
}

export function json(res, status, body, headers = {}) {
  res
    .status(status)
    .setHeader("Content-Type", "application/json; charset=utf-8");
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  return res.json(body);
}

export function readBearer(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

function readCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function setAuthCookies(res, session) {
  if (!session?.access_token) return;
  const maxAge = Math.max(60, Number(session.expires_in) || 3600);
  const values = [cookie(ACCESS_COOKIE, session.access_token, maxAge)];
  if (session.refresh_token)
    values.push(cookie(REFRESH_COOKIE, session.refresh_token, 2592000));
  const existing = res.getHeader("Set-Cookie");
  res.setHeader(
    "Set-Cookie",
    existing
      ? [...(Array.isArray(existing) ? existing : [existing]), ...values]
      : values,
  );
}

export function clearAuthCookies(res) {
  res.setHeader("Set-Cookie", [
    cookie(ACCESS_COOKIE, "", 0),
    cookie(REFRESH_COOKIE, "", 0),
  ]);
}

async function authFetch(path, body) {
  return fetch(`${supabaseUrl()}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: publicAuthKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function authPassword(email, password) {
  const response = await authFetch("token?grant_type=password", {
    email,
    password,
  });
  return { response, data: await response.json().catch(() => null) };
}

export async function authSignup(email, password) {
  const response = await authFetch("signup", { email, password });
  return { response, data: await response.json().catch(() => null) };
}

export async function authSignout(token) {
  return fetch(`${supabaseUrl()}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: publicAuthKey(),
      authorization: `Bearer ${token}`,
    },
  });
}

export async function verifiedUser(req, res) {
  let token = readBearer(req) || readCookie(req, ACCESS_COOKIE);
  if (!token) return null;
  let response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: publicAuthKey(),
      authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok && res) {
    const refreshToken = readCookie(req, REFRESH_COOKIE);
    if (refreshToken) {
      const refreshed = await authFetch("token?grant_type=refresh_token", {
        refresh_token: refreshToken,
      });
      const session = await refreshed.json().catch(() => null);
      if (refreshed.ok) {
        setAuthCookies(res, session);
        token = session.access_token;
        response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
          headers: {
            apikey: publicAuthKey(),
            authorization: `Bearer ${token}`,
          },
        });
      }
    }
  }
  if (!response.ok) return null;
  return response.json();
}

export function deviceToken(req, res) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(
    new RegExp(`(?:^|;\\s*)${DEVICE_COOKIE}=([^;]+)`),
  );
  if (match?.[1]) return decodeURIComponent(match[1]);
  const token = crypto.randomBytes(32).toString("base64url");
  const deviceCookie = `${DEVICE_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
  const existing = res.getHeader("Set-Cookie");
  res.setHeader(
    "Set-Cookie",
    existing
      ? [...(Array.isArray(existing) ? existing : [existing]), deviceCookie]
      : deviceCookie,
  );
  return token;
}

export function hashDeviceToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function rpc(name, payload) {
  const response = await fetch(
    `${supabaseUrl()}/rest/v1/rpc/${name}`,
    {
      method: "POST",
      headers: {
        apikey: serverKey(),
        authorization: `Bearer ${serverKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error("Supabase session operation failed");
    error.status = response.status;
    error.detail = data;
    console.error("Supabase session RPC failed", {
      operation: name,
      status: response.status,
      code: data?.code || null,
    });
    throw error;
  }
  return data;
}

export function knownSessionError(error) {
  const code = error?.detail?.code;
  if (code === "22023")
    return { status: 400, error: "Invalid session request" };
  if (code === "P0001")
    return {
      status: 409,
      error: error.detail.message || "Session cannot start",
    };
  return null;
}

export function validDuration(value) {
  return Number.isInteger(value) && ALLOWED_DURATIONS.includes(value)
    ? value
    : null;
}

export function difficultyForDuration(duration) {
  return DIFFICULTY_BY_DURATION[duration];
}

export { ALLOWED_DURATIONS };
