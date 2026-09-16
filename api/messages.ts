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
const DELETED_RETENTION_DAYS = 30;

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
    // Lazy purge: anything in the bin for longer than the retention window goes
    // for good. Runs on admin load so no scheduled job is required.
    const cutoff = new Date(Date.now() - DELETED_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const { error: purgeError } = await supabase
      .from("messages")
      .delete()
      .lt("deleted_at", cutoff.toISOString());
    if (purgeError) console.error("Failed to purge old deleted messages", purgeError);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load messages", error);
      return res.status(500).json({ error: "Failed to load messages" });
    }
    return res.status(200).json({ messages: data, retentionDays: DELETED_RETENTION_DAYS });
  }

  if (req.method === "PATCH") {
    const { id, read, deleted } = req.body ?? {};
    if (typeof id !== "string" && typeof id !== "number") {
      return res.status(400).json({ error: "Message id is required" });
    }
    const patch: Record<string, unknown> = {};
    if (typeof read === "boolean") patch.read = read;
    // deleted:true moves to the bin, deleted:false restores.
    if (typeof deleted === "boolean") patch.deleted_at = deleted ? new Date().toISOString() : null;
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    const { error } = await supabase.from("messages").update(patch).eq("id", id);
    if (error) {
      console.error("Failed to update message", error);
      return res.status(500).json({ error: "Failed to update message" });
    }
    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    // Permanent removal — only allowed for messages already in the bin, so a
    // single mistaken click can never destroy an enquiry.
    const { id, all } = req.body ?? {};
    let query = supabase.from("messages").delete().not("deleted_at", "is", null);
    if (all === true) {
      // empty the whole bin
    } else if (typeof id === "string" || typeof id === "number") {
      query = query.eq("id", id);
    } else {
      return res.status(400).json({ error: "Message id is required" });
    }
    const { error } = await query;
    if (error) {
      console.error("Failed to delete message", error);
      return res.status(500).json({ error: "Failed to delete message" });
    }
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
