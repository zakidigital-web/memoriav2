import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "../_lib/http";
import { dbQuery, dbQueryOne } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";
import { YearbookCreateSchema } from "../_lib/validation";

const YearbookUpdateSchema = YearbookCreateSchema.omit({ pdfUrl: true, pageImageUrls: true });

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
    const y = await dbQueryOne<any>(
      "SELECT id, year, title, pdf_url, cover_image_url, background_music_url, total_students, total_classes, page_count FROM yearbooks WHERE id=$1 LIMIT 1",
      [id]
    );
    if (!y) return json(res, 404, { error: "Not found" });

    const pages = await dbQuery<any>(
      "SELECT page_number, image_url FROM yearbook_pages WHERE yearbook_id=$1 ORDER BY page_number ASC",
      [id]
    );

    return json(res, 200, {
      id: y.id,
      year: y.year,
      title: y.title,
      pdfUrl: y.pdf_url,
      coverImage: y.cover_image_url ?? "",
      backgroundMusic: y.background_music_url ?? "",
      totalStudents: y.total_students,
      totalClasses: y.total_classes,
      pageCount: y.page_count ?? null,
      pages: pages.map((p: any) => p.image_url),
    });
  }

  if (req.method === "PUT") {
    await requireAdmin(req, res);
    const parsed = YearbookUpdateSchema.safeParse(req.body);
    if (!parsed.success) return json(res, 400, { error: "Invalid body" });
    const d = parsed.data as any;

    await dbQuery(
      "UPDATE yearbooks SET year=$1, title=$2, cover_image_url=$3, background_music_url=$4, total_students=$5, total_classes=$6, updated_at=now() WHERE id=$7",
      [
        d.year,
        d.title,
        d.coverImageUrl ?? null,
        d.backgroundMusicUrl ?? null,
        d.totalStudents ?? 0,
        d.totalClasses ?? 0,
        id,
      ]
    );

    return json(res, 200, { ok: true });
  }

  if (req.method === "DELETE") {
    await requireAdmin(req, res);
    await dbQuery("DELETE FROM yearbooks WHERE id=$1", [id]);
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
});
