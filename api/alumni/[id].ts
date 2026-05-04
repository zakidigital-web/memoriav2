import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "../_lib/http";
import { dbQuery, dbQueryOne } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";
import { AlumniSchema } from "../_lib/validation";

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
    const a = await dbQueryOne<any>(
      "SELECT id, name, ttl, message, photo_url, graduation_year, class_name, instagram, twitter, linkedin FROM alumni WHERE id=$1 LIMIT 1",
      [id]
    );
    if (!a) return json(res, 404, { error: "Not found" });
    return json(res, 200, {
      id: a.id,
      name: a.name,
      ttl: a.ttl,
      message: a.message,
      photo: a.photo_url ?? "",
      graduationYear: a.graduation_year,
      class: a.class_name,
      socialMedia: {
        instagram: a.instagram ?? "",
        twitter: a.twitter ?? "",
        linkedin: a.linkedin ?? "",
      },
    });
  }

  if (req.method === "PUT") {
    await requireAdmin(req, res);
    const parsed = AlumniSchema.safeParse(req.body);
    if (!parsed.success) return json(res, 400, { error: "Invalid body" });
    const d = parsed.data;
    await dbQuery(
      "UPDATE alumni SET name=$1, ttl=$2, message=$3, photo_url=$4, graduation_year=$5, class_name=$6, instagram=$7, twitter=$8, linkedin=$9, updated_at=now() WHERE id=$10",
      [
        d.name,
        d.ttl ?? "",
        d.message ?? "",
        d.photoUrl ?? null,
        d.graduationYear,
        d.className,
        d.instagram || null,
        d.twitter || null,
        d.linkedin || null,
        id,
      ]
    );
    return json(res, 200, { ok: true });
  }

  if (req.method === "DELETE") {
    await requireAdmin(req, res);
    await dbQuery("DELETE FROM alumni WHERE id=$1", [id]);
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
});

