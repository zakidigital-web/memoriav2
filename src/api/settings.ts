import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "./_lib/http";
import { dbQuery, dbQueryOne } from "./_lib/db";
import { requireAdmin } from "./_lib/auth";
import { SettingsSchema } from "./_lib/validation";

const DEFAULT_SETTINGS = {
  primaryColor: "#2563eb",
  isAlumniVisible: true,
  yearbookSettings: {
    sortBy: "year-desc" as const,
    gridColumns: 4,
    showStudentCount: true,
  },
};

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const row = await dbQueryOne<{ value_json: any }>("SELECT value_json FROM app_settings WHERE key=$1 LIMIT 1", ["app"]);
    return json(res, 200, row?.value_json ?? DEFAULT_SETTINGS);
  }

  if (req.method === "PUT") {
    await requireAdmin(req, res);
    const parsed = SettingsSchema.safeParse(req.body);
    if (!parsed.success) return json(res, 400, { error: "Invalid body" });

    const existing = await dbQueryOne<{ id: string }>("SELECT id FROM app_settings WHERE key=$1 LIMIT 1", ["app"]);
    if (existing) {
      await dbQuery("UPDATE app_settings SET value_json=$1, updated_at=now() WHERE id=$2", [parsed.data, existing.id]);
      return json(res, 200, { ok: true });
    }

    await dbQuery("INSERT INTO app_settings (key, value_json) VALUES ($1,$2)", ["app", parsed.data]);
    return json(res, 201, { ok: true });
  }

  return methodNotAllowed(res, ["GET", "PUT"]);
});

