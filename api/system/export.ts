import { VercelRequest, VercelResponse } from "@vercel/node";
import { json, methodNotAllowed, withErrorHandling } from "../_lib/http";
import { dbQuery, dbQueryOne } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const admin = await requireAdmin(req, res);

  await dbQueryOne(
    `INSERT INTO activity_logs (admin_id, action, target, details) VALUES ($1, $2, $3, $4)`,
    [admin.id, "EXPORT_DATABASE", "all_data", JSON.stringify({ action: "export" })]
  );

  const schools = await dbQuery("SELECT * FROM schools");
  const teachers = await dbQuery("SELECT * FROM teachers");
  const alumni = await dbQuery("SELECT * FROM alumni");
  const yearbooks = await dbQuery("SELECT * FROM yearbooks");

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="backup_${new Date().toISOString().split('T')[0]}.json"`);
  
  return res.status(200).send(JSON.stringify({ schools, teachers, alumni, yearbooks }));
});