import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "../_lib/http";
import { dbQuery, dbQueryOne } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";
import { YearbookCreateSchema } from "../_lib/validation";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const rows = await dbQuery(
      "SELECT id, year, title, pdf_url, cover_image_url, background_music_url, total_students, total_classes, page_count FROM yearbooks ORDER BY year DESC",
      []
    );
    return json(res, 200, rows.map((y: any) => ({
      id: y.id,
      year: y.year,
      title: y.title,
      pdfUrl: y.pdf_url,
      coverImage: y.cover_image_url ?? "",
      backgroundMusic: y.background_music_url ?? "",
      totalStudents: y.total_students,
      totalClasses: y.total_classes,
      pageCount: y.page_count ?? null,
    })));
  }

  if (req.method === "POST") {
    await requireAdmin(req, res);
    const parsed = YearbookCreateSchema.safeParse(req.body);
    if (!parsed.success) return json(res, 400, { error: "Invalid body" });
    const d = parsed.data;

    const inserted = await dbQueryOne<{ id: string }>(
      "INSERT INTO yearbooks (year, title, pdf_url, cover_image_url, background_music_url, total_students, total_classes, page_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
      [
        d.year,
        d.title,
        d.pdfUrl,
        d.coverImageUrl ?? null,
        d.backgroundMusicUrl ?? null,
        d.totalStudents ?? 0,
        d.totalClasses ?? 0,
        d.pageImageUrls.length ? d.pageImageUrls.length + 2 : null,
      ]
    );

    if (!inserted?.id) return json(res, 500, { error: "Failed to create yearbook" });

    try {
      for (let i = 0; i < d.pageImageUrls.length; i++) {
        await dbQuery(
          "INSERT INTO yearbook_pages (yearbook_id, page_number, image_url) VALUES ($1,$2,$3)",
          [inserted.id, i + 1, d.pageImageUrls[i]]
        );
      }
    } catch (e) {
      await dbQuery("DELETE FROM yearbooks WHERE id=$1", [inserted.id]);
      throw e;
    }

    return json(res, 201, { ok: true, id: inserted.id });
  }

  return methodNotAllowed(res, ["GET", "POST"]);
});

