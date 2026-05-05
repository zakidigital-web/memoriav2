import { VercelRequest, VercelResponse } from "@vercel/node";
import { json, methodNotAllowed, withErrorHandling } from "../_lib/http";
import { dbQuery, dbQueryOne } from "../_lib/db";
import { requireAdmin } from "../_lib/auth";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  await requireAdmin(req, res);

  const { range = "7days" } = req.query;
  let interval = "7 days";
  if (range === "30days") interval = "30 days";
  else if (range === "today") interval = "1 day";

  // Total visits
  const totalVisitsRow = await dbQueryOne<{ count: string }>(
    `SELECT COUNT(DISTINCT session_id) as count FROM visitor_stats WHERE visited_at >= now() - interval $1`,
    [interval]
  );

  // Daily pattern
  const dailyPattern = await dbQuery(
    `SELECT date_trunc('day', visited_at) as date, COUNT(DISTINCT session_id) as visitors, SUM(duration) as total_duration
     FROM visitor_stats 
     WHERE visited_at >= now() - interval $1
     GROUP BY date ORDER BY date ASC`,
    [interval]
  );

  // Source distribution
  const sources = await dbQuery(
    `SELECT source, COUNT(DISTINCT session_id) as count 
     FROM visitor_stats 
     WHERE visited_at >= now() - interval $1
     GROUP BY source ORDER BY count DESC LIMIT 10`,
    [interval]
  );

  // Avg duration
  const durationRow = await dbQueryOne<{ avg: string }>(
    `SELECT AVG(duration) as avg FROM visitor_stats WHERE visited_at >= now() - interval $1`,
    [interval]
  );

  return json(res, 200, {
    totalVisits: parseInt(totalVisitsRow?.count || "0", 10),
    avgDuration: Math.round(parseFloat(durationRow?.avg || "0")),
    dailyPattern,
    sources,
  });
});