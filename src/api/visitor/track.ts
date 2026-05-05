import { VercelRequest, VercelResponse } from "@vercel/node";
import { json, methodNotAllowed, withErrorHandling } from "../_lib/http";
import { dbQueryOne } from "../_lib/db";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const { session_id, path, duration, source, device, browser } = req.body || {};

  if (!session_id || !path) {
    return json(res, 400, { error: "session_id and path are required" });
  }

  // Upsert visitor stats. If session and path exist within the last 1 hour, update duration
  await dbQueryOne(
    `INSERT INTO visitor_stats (session_id, path, duration, source, device, browser) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [session_id, path, duration || 0, source, device, browser]
  );

  return json(res, 200, { ok: true });
});