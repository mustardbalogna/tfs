import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  readSessionCookie,
  verifySessionToken,
  createSessionToken,
  buildSessionCookie,
} from "./_lib/session.js";
import { getSupabaseClient } from "./_lib/supabase.js";

const DAYS = 30;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifySessionToken(readSessionCookie(req.headers.cookie))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Sliding session: extend expiry on activity, still capped by the token's max age.
  res.setHeader("Set-Cookie", buildSessionCookie(createSessionToken()));

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("page_views")
    .select("path, visitor_id, created_at")
    .gte("created_at", since)
    .limit(20000);

  if (error) {
    console.error("Failed to load stats", error);
    return res.status(500).json({ error: "Failed to load stats" });
  }

  const rows = data ?? [];
  const uniqueVisitors = new Set(rows.map((r) => r.visitor_id)).size;

  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, views: 0 }));
  const byDayMap = new Map<string, number>();
  const byPathMap = new Map<string, number>();

  for (const row of rows) {
    const date = new Date(row.created_at);
    byHour[date.getHours()].views += 1;

    const dayKey = date.toISOString().slice(0, 10);
    byDayMap.set(dayKey, (byDayMap.get(dayKey) ?? 0) + 1);
    byPathMap.set(row.path, (byPathMap.get(row.path) ?? 0) + 1);
  }

  const byDay = Array.from(byDayMap.entries())
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const topPages = Array.from(byPathMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return res.status(200).json({
    totalViews: rows.length,
    uniqueVisitors,
    byHour,
    byDay,
    topPages,
  });
}
