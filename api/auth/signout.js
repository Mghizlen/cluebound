import { authSignout, configError, json, readBearer, clearAuthCookies } from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" }, { Allow: "POST" });
  const setupError = configError();
  if (setupError) return json(res, 503, { error: setupError });
  try {
    const response = await authSignout(readBearer(req) || "");
    clearAuthCookies(res);
    return json(res, response.ok ? 200 : 200, { authenticated: false });
  } catch { clearAuthCookies(res); return json(res, 200, { authenticated: false }); }
}
