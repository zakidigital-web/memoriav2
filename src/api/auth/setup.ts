import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "../_lib/http";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  json(res, 410, { error: "Create users via Supabase Auth and insert admins via SQL" });
});
