import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "../_lib/http";
import { dbQuery, dbQueryOne } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";
import { TeacherSchema } from "../_lib/validation";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const rows = await dbQuery(
      "SELECT id, name, position, message, photo_url, category FROM teachers ORDER BY name ASC",
      []
    );
    return json(res, 200, rows.map((t: any) => ({
      id: t.id,
      name: t.name,
      position: t.position,
      message: t.message,
      photo: t.photo_url ?? "",
      category: t.category,
    })));
  }

  if (req.method === "POST") {
    await requireAdmin(req, res);
    const parsed = TeacherSchema.safeParse(req.body);
    if (!parsed.success) return json(res, 400, { error: "Invalid body" });

    const d = parsed.data;
    const row = await dbQueryOne<any>(
      "INSERT INTO teachers (name, position, message, photo_url, category) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, position, message, photo_url, category",
      [d.name, d.position, d.message ?? "", d.photoUrl ?? null, d.category]
    );
    return json(res, 201, {
      id: row.id,
      name: row.name,
      position: row.position,
      message: row.message,
      photo: row.photo_url ?? "",
      category: row.category,
    });
  }

  return methodNotAllowed(res, ["GET", "POST"]);
});

