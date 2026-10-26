import {
  configError,
  difficultyForDuration,
  deviceToken,
  hashDeviceToken,
  json,
  knownSessionError,
  rpc,
  validDuration,
  verifiedUser,
} from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return json(res, 405, { error: "Method not allowed" }, { Allow: "POST" });
  const setupError = configError();
  if (setupError) return json(res, 503, { error: setupError });
  try {
    const user = await verifiedUser(req, res);
    if (!user) return json(res, 401, { error: "Authentication required" });
    const duration = validDuration(req.body?.duration);
    if (!duration)
      return json(res, 400, {
        error: "Duration must be 15, 30, 60, 90, or 120 minutes",
      });
    const token = deviceToken(req, res);
    const session = await rpc("cluebound_start_session", {
      p_user_id: user.id,
      p_duration_minutes: duration,
      p_difficulty: difficultyForDuration(duration),
      p_device_hash: hashDeviceToken(token),
    });
    return json(res, 200, {
      ...session,
      server_time: new Date().toISOString(),
    });
  } catch (error) {
    const knownError = knownSessionError(error);
    return knownError
      ? json(res, knownError.status, knownError)
      : json(res, 502, { error: "Session service is temporarily unavailable" });
  }
}
