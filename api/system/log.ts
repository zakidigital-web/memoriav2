import { VercelRequest, VercelResponse } from "@vercel/node";
import { json, methodNotAllowed, withErrorHandling } from "../_lib/http";
import { dbQueryOne } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const admin = await requireAdmin(req, res);
  const { action, target, details } = req.body || {};

  await dbQueryOne(
    "INSERT INTO activity_logs (admin_id, action, target, details) VALUES ($1, $2, $3, $4)",
    [admin.id, action, target, details ? JSON.stringify(details) : null]
  );

  return json(res, 200, { ok: true });
});