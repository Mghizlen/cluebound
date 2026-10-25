import { authSignup, configError, json, setAuthCookies } from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" }, { Allow: "POST" });
  const setupError = configError();
  if (setupError) return json(res, 503, { error: setupError });
  const email = String(req.body?.email || "").trim();
  const password = String(req.body?.password || "");
  if (!email || password.length < 8) return json(res, 400, { error: "Enter an email and a password with at least 8 characters" });
  try {
    const { response, data } = await authSignup(email, password);
    if (!response.ok) return json(res, response.status === 422 ? 409 : 400, { error: data?.msg || data?.error_description || "Could not create account" });
    if (data?.access_token) setAuthCookies(res, data);
    return json(res, 200, { authenticated: Boolean(data?.access_token), confirmation_required: !data?.access_token, user: data?.user ? { id: data.user.id, email: data.user.email } : null });
  } catch { return json(res, 502, { error: "Authentication service is temporarily unavailable" }); }
}
