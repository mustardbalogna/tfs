import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseClient } from "./_lib/supabase.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

const RATE_LIMIT = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  // Pageview tracking is best-effort: never surface failures to the visitor.
  const { limited } = await checkRateLimit(
    `track:${getClientIp(req)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );
  if (limited) {
    return res.status(204).end();
  }

  const { path, visitorId, sessionId } = req.body ?? {};
  if (
    typeof path === "string" &&
    path.trim() &&
    typeof visitorId === "string" &&
    visitorId.trim()
  ) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from("page_views").insert({
        path: path.trim().slice(0, 300),
        visitor_id: visitorId.trim().slice(0, 100),
        session_id: typeof sessionId === "string" ? sessionId.trim().slice(0, 100) : "",
      });
    } catch (err) {
      console.error("Failed to record page view", err);
    }
  }

  return res.status(204).end();
}
