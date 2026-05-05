import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "../_lib/http";
import { dbQuery, dbQueryOne } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";
import { TeacherSchema } from "../_lib/validation";

function getId(req: VercelRequest) {
  const id = req.query.id;
  if (typeof id !== "string" || id.length < 10) {
    const err = new Error("Invalid id");
    (err as any).status = 400;
    throw err;
  }
  return id;
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const id = getId(req);

  if (req.method === "GET") {
    const row = await dbQueryOne<any>(
      "SELECT id, name, position, message, photo_url, category FROM teachers WHERE id=$1 LIMIT 1",
      [id]
    );
    if (!row) return json(res, 404, { error: "Not found" });
    return json(res, 200, {
      id: row.id,
      name: row.name,
      position: row.position,
      message: row.message,
      photo: row.photo_url ?? "",
      category: row.category,
    });
  }

  if (req.method === "PUT") {
    await requireAdmin(req, res);
    const parsed = TeacherSchema.safeParse(req.body);
    if (!parsed.success) return json(res, 400, { error: "Invalid body" });
    const d = parsed.data;
    await dbQuery(
      "UPDATE teachers SET name=$1, position=$2, message=$3, photo_url=$4, category=$5, updated_at=now() WHERE id=$6",
      [d.name, d.position, d.message ?? "", d.photoUrl ?? null, d.category, id]
    );
    return json(res, 200, { ok: true });
  }

  if (req.method === "DELETE") {
    await requireAdmin(req, res);
    await dbQuery("DELETE FROM teachers WHERE id=$1", [id]);
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
});

