import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "./_lib/http";
import { dbQueryOne } from "./_lib/db";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    await dbQueryOne("SELECT 1 AS ok", []);
    return json(res, 200, { ok: true, dbConnected: true, now: new Date().toISOString() });
  } catch (e) {
    return json(res, 200, { ok: true, dbConnected: false, now: new Date().toISOString() });
  }
});

