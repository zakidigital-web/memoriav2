import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "./_lib/http";
import { dbQuery, dbQueryOne } from "./_lib/db";
import { requireAdmin } from "./_lib/auth";
import { SchoolSchema } from "./_lib/validation";

const DEFAULT_SCHOOL = {
  name: "SMP Negeri 1 Jakarta",
  logo: "",
  defaultTheme: "light" as const,
  history: "Didirikan pada tahun 1950...",
  vision: "Menjadi sekolah unggulan dalam IPTEK dan IMTAK.",
  mission: "1. Meningkatkan kualitas pembelajaran...",
  facilities: "Lab Komputer, Perpustakaan Digital, GOR.",
};

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const row = await dbQueryOne<any>(
      "SELECT id, name, logo_url, favicon_url, tagline, contact_email, contact_phone, contact_address, default_theme, history, vision, mission, facilities FROM schools ORDER BY created_at ASC LIMIT 1",
      []
    );
    return json(res, 200, row ? {
      id: row.id,
      name: row.name,
      logoUrl: row.logo_url ?? "",
      faviconUrl: row.favicon_url ?? "",
      tagline: row.tagline ?? "",
      contactEmail: row.contact_email ?? "",
      contactPhone: row.contact_phone ?? "",
      contactAddress: row.contact_address ?? "",
      defaultTheme: row.default_theme,
      history: row.history ?? "",
      vision: row.vision ?? "",
      mission: row.mission ?? "",
      facilities: row.facilities ?? "",
    } : DEFAULT_SCHOOL);
  }

  if (req.method === "PUT") {
    await requireAdmin(req, res);
    const parsed = SchoolSchema.safeParse(req.body);
    if (!parsed.success) return json(res, 400, { error: "Invalid body", details: parsed.error });

    const existing = await dbQueryOne<{ id: string }>("SELECT id FROM schools ORDER BY created_at ASC LIMIT 1", []);
    const d = parsed.data;

    if (existing) {
      await dbQuery(
        "UPDATE schools SET name=$1, logo_url=$2, favicon_url=$3, tagline=$4, contact_email=$5, contact_phone=$6, contact_address=$7, history=$8, vision=$9, mission=$10, facilities=$11, default_theme=$12, updated_at=now() WHERE id=$13",
        [d.name, d.logoUrl ?? null, d.faviconUrl ?? null, d.tagline ?? null, d.contactEmail ?? null, d.contactPhone ?? null, d.contactAddress ?? null, d.history ?? null, d.vision ?? null, d.mission ?? null, d.facilities ?? null, d.defaultTheme, existing.id]
      );
      return json(res, 200, { ok: true });
    }

    const inserted = await dbQueryOne<{ id: string }>(
      "INSERT INTO schools (name, logo_url, favicon_url, tagline, contact_email, contact_phone, contact_address, history, vision, mission, facilities, default_theme) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id",
      [d.name, d.logoUrl ?? null, d.faviconUrl ?? null, d.tagline ?? null, d.contactEmail ?? null, d.contactPhone ?? null, d.contactAddress ?? null, d.history ?? null, d.vision ?? null, d.mission ?? null, d.facilities ?? null, d.defaultTheme]
    );

    json(res, 201, { ok: true, id: inserted?.id ?? null });
    return;
  }

  return methodNotAllowed(res, ["GET", "PUT"]);
});
