import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "../_lib/http";
import { dbQuery, dbQueryOne } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";
import { AlumniSchema } from "../_lib/validation";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const rows = await dbQuery(
      "SELECT id, name, ttl, message, photo_url, graduation_year, class_name, instagram, twitter, linkedin FROM alumni ORDER BY graduation_year DESC, class_name ASC, name ASC",
      []
    );
    return json(res, 200, rows.map((a: any) => ({
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
    })));
  }

  if (req.method === "POST") {
    await requireAdmin(req, res);
    const parsed = AlumniSchema.safeParse(req.body);
    if (!parsed.success) return json(res, 400, { error: "Invalid body" });
    const d = parsed.data;

    const row = await dbQueryOne<any>(
      "INSERT INTO alumni (name, ttl, message, photo_url, graduation_year, class_name, instagram, twitter, linkedin) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
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
      ]
    );

    return json(res, 201, { ok: true, id: row?.id ?? null });
  }

  return methodNotAllowed(res, ["GET", "POST"]);
});

