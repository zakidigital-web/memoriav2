import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { withErrorHandling, json, methodNotAllowed } from "../_lib/http";
import { dbQueryOne } from "../_lib/db";
import { requireUser } from "../_lib/auth";

const BodySchema = z.object({
  themeMode: z.enum(["system", "light", "dark"]),
});

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const user = await requireUser(req, res);
    const row = await dbQueryOne<{ theme_mode: "system" | "light" | "dark" }>(
      "SELECT theme_mode FROM user_preferences WHERE user_id=$1 LIMIT 1",
      [user.id]
    );
    return json(res, 200, { themeMode: row?.theme_mode ?? null });
  }

  if (req.method === "PUT") {
    const user = await requireUser(req, res);
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) return json(res, 400, { error: "Invalid body" });

    const row = await dbQueryOne<{ theme_mode: "system" | "light" | "dark" }>(
      "INSERT INTO user_preferences (user_id, theme_mode, updated_at) VALUES ($1,$2,now()) ON CONFLICT (user_id) DO UPDATE SET theme_mode=excluded.theme_mode, updated_at=now() RETURNING theme_mode",
      [user.id, parsed.data.themeMode]
    );

    return json(res, 200, { ok: true, themeMode: row?.theme_mode ?? parsed.data.themeMode });
  }

  return methodNotAllowed(res, ["GET", "PUT"]);
});
