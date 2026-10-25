import { configError, json, verifiedUser } from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" }, { Allow: "GET" });
  const setupError = configError();
  if (setupError) return json(res, 503, { error: setupError });
  const user = await verifiedUser(req, res);
  if (!user) return json(res, 401, { authenticated: false });
  return json(res, 200, { authenticated: true, user: { id: user.id, email: user.email } });
}
