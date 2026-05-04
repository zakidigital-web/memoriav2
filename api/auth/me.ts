import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "../_lib/http";
import { getUserFromRequest } from "../_lib/auth";
import { dbQueryOne } from "../_lib/db";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const user = await getUserFromRequest(req);
    if (!user) return json(res, 200, { isAuthenticated: false, isAdmin: false, user: null });

    const row = await dbQueryOne<{ ok: boolean, username: string, requires_password_change: boolean }>(
      "SELECT true AS ok, username, requires_password_change FROM admins WHERE user_id=$1 LIMIT 1", [user.id]
    );
    return json(res, 200, {
      isAuthenticated: true,
      isAdmin: Boolean(row?.ok),
      requiresPasswordChange: Boolean(row?.requires_password_change),
      user: { id: user.id, email: user.email, username: row?.username ?? null },
    });
  }

  if (req.method === "PUT") {
    const user = await getUserFromRequest(req);
    if (!user) return json(res, 401, { error: "Unauthorized" });

    const { username } = req.body || {};
    if (!username || typeof username !== "string") {
      return json(res, 400, { error: "Invalid username" });
    }

    const row = await dbQueryOne<{ ok: boolean }>("SELECT true AS ok FROM admins WHERE user_id=$1 LIMIT 1", [user.id]);
    if (!row?.ok) return json(res, 403, { error: "Forbidden" });

    // Check if username is taken
    const existing = await dbQueryOne<{ id: string }>("SELECT user_id AS id FROM admins WHERE username=$1 AND user_id != $2 LIMIT 1", [username, user.id]);
    if (existing) {
      return json(res, 400, { error: "Username already taken" });
    }

    await dbQueryOne("UPDATE admins SET username=$1 WHERE user_id=$2", [username, user.id]);
    return json(res, 200, { ok: true, username });
  }

  return methodNotAllowed(res, ["GET", "PUT"]);
});
