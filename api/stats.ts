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
    .select("path, visitor_id, session_id, created_at")
    .gte("created_at", since)
    .limit(20000);

  if (error) {
    console.error("Failed to load stats", error);
    return res.status(500).json({ error: "Failed to load stats" });
  }

  const rows = data ?? [];
  const uniqueVisitors = new Set(rows.map((r) => r.visitor_id)).size;
  const uniqueSessions = new Set(rows.map((r) => r.session_id).filter(Boolean)).size;

  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, views: 0 }));
  const byDayMap = new Map<
    string,
    { views: number; visitors: Set<string>; sessions: Set<string> }
  >();
  const byPathMap = new Map<string, number>();
  const heatmapMap = new Map<string, number[]>();

  for (const row of rows) {
    const date = new Date(row.created_at);
    const hour = date.getHours();
    byHour[hour].views += 1;

    const dayKey = date.toISOString().slice(0, 10);
    const day = byDayMap.get(dayKey) ?? { views: 0, visitors: new Set(), sessions: new Set() };
    day.views += 1;
    day.visitors.add(row.visitor_id);
    if (row.session_id) day.sessions.add(row.session_id);
    byDayMap.set(dayKey, day);

    byPathMap.set(row.path, (byPathMap.get(row.path) ?? 0) + 1);

    const dayHours = heatmapMap.get(dayKey) ?? Array.from({ length: 24 }, () => 0);
    dayHours[hour] += 1;
    heatmapMap.set(dayKey, dayHours);
  }

  const byDay = Array.from(byDayMap.entries())
    .map(([date, day]) => ({
      date,
      views: day.views,
      sessions: day.sessions.size,
      visitors: day.visitors.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const topPages = Array.from(byPathMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const heatmap = Array.from(heatmapMap.entries())
    .map(([date, hours]) => ({ date, hours }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return res.status(200).json({
    totalViews: rows.length,
    uniqueVisitors,
    uniqueSessions,
    byHour,
    byDay,
    topPages,
    heatmap,
  });
}
