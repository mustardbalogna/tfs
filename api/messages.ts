import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  readSessionCookie,
  verifySessionToken,
  createSessionToken,
  buildSessionCookie,
} from "./_lib/session.js";
import { getSupabaseClient } from "./_lib/supabase.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

const RATE_LIMIT = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifySessionToken(readSessionCookie(req.headers.cookie))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Sliding session: extend expiry on activity, still capped by the token's max age.
  res.setHeader("Set-Cookie", buildSessionCookie(createSessionToken()));

  const { limited, retryAfterSeconds } = await checkRateLimit(
    `messages:${getClientIp(req)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );
  if (limited) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }

  const supabase = getSupabaseClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load messages", error);
      return res.status(500).json({ error: "Failed to load messages" });
    }
    return res.status(200).json({ messages: data });
  }

  if (req.method === "PATCH") {
    const { id, read } = req.body ?? {};
    if (typeof id !== "string" && typeof id !== "number") {
      return res.status(400).json({ error: "Message id is required" });
    }
    const { error } = await supabase
      .from("messages")
      .update({ read: Boolean(read) })
      .eq("id", id);
    if (error) {
      console.error("Failed to update message", error);
      return res.status(500).json({ error: "Failed to update message" });
    }
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
