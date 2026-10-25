import { authPassword, configError, json, setAuthCookies } from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" }, { Allow: "POST" });
  const setupError = configError();
  if (setupError) return json(res, 503, { error: setupError });
  const email = String(req.body?.email || "").trim();
  const password = String(req.body?.password || "");
  if (!email || !password) return json(res, 400, { error: "Enter your email and password" });
  try {
    const { response, data } = await authPassword(email, password);
    if (!response.ok) return json(res, response.status === 400 ? 401 : 400, { error: data?.msg || data?.error_description || "Invalid email or password" });
    setAuthCookies(res, data);
    return json(res, 200, { authenticated: true, user: { id: data.user.id, email: data.user.email } });
  } catch { return json(res, 502, { error: "Authentication service is temporarily unavailable" }); }
}
