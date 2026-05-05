import { VercelRequest, VercelResponse } from "@vercel/node";
import { json, methodNotAllowed, withErrorHandling } from "../_lib/http";
import { dbQueryOne, dbQuery } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const admin = await requireAdmin(req, res);

  // Backup first? Just log it for now.
  await dbQueryOne(
    `INSERT INTO activity_logs (admin_id, action, target, details) VALUES ($1, $2, $3, $4)`,
    [admin.id, "RESET_DATABASE", "all_data", JSON.stringify({ reason: "Manual reset via API" })]
  );

  // Delete selective tables
  const { tables = [] } = req.body || {};
  
  if (tables.includes("alumni") || tables.length === 0) await dbQuery("TRUNCATE TABLE alumni CASCADE");
  if (tables.includes("teachers") || tables.length === 0) await dbQuery("TRUNCATE TABLE teachers CASCADE");
  if (tables.includes("yearbooks") || tables.length === 0) await dbQuery("TRUNCATE TABLE yearbooks CASCADE");
  if (tables.includes("visitor_stats") || tables.length === 0) await dbQuery("TRUNCATE TABLE visitor_stats CASCADE");

  return json(res, 200, { ok: true, message: "Database reset successful" });
});