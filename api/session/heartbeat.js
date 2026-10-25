import { configError, deviceToken, hashDeviceToken, json, rpc, verifiedUser } from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" }, { Allow: "POST" });
  const setupError = configError();
  if (setupError) return json(res, 503, { error: setupError });
  try {
    const user = await verifiedUser(req, res);
    if (!user) return json(res, 401, { error: "Authentication required" });
    const token = deviceToken(req, res);
    const status = await rpc("cluebound_session_status", { p_user_id: user.id, p_device_hash: hashDeviceToken(token) });
    return json(res, 200, { ...status, server_time: new Date().toISOString() });
  } catch {
    return json(res, 502, { error: "Session service is temporarily unavailable" });
  }
}
