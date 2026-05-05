import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEnv } from "./env";
import { dbQueryOne } from "./db";

export type AuthUser = {
  id: string;
  email: string | null;
};

function getBearerToken(req: VercelRequest) {
  const header = req.headers.authorization;
  const queryToken = req.query.token as string;

  if (header?.startsWith("Bearer ")) {
    return header.substring(7);
  } else if (queryToken) {
    return queryToken;
  }
  return null;
}

export async function getUserFromRequest(req: VercelRequest): Promise<AuthUser | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort("auth timeout"), 5_000);
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        authorization: `Bearer ${token}`,
      },
      signal: ac.signal,
    });
    if (!res.ok) return null;
    const body: any = await res.json();
    if (!body?.id) return null;
    return { id: String(body.id), email: body.email ? String(body.email) : null };
  } finally {
    clearTimeout(t);
  }
}

export async function requireUser(req: VercelRequest, _res: VercelResponse): Promise<AuthUser> {
  const user = await getUserFromRequest(req);
  if (!user) {
    const err = new Error("Unauthorized");
    (err as any).status = 401;
    throw err;
  }
  return user;
}

export async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const user = await requireUser(req, res);
  const row = await dbQueryOne<{ ok: boolean }>("SELECT true AS ok FROM admins WHERE user_id = $1 LIMIT 1", [
    user.id,
  ]);
  if (!row?.ok) {
    const err = new Error("Forbidden");
    (err as any).status = 403;
    throw err;
  }
  return user;
}
