import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseClient } from "./_lib/supabase.js";
import { sendContactNotification } from "./_lib/email.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { limited, retryAfterSeconds } = await checkRateLimit(
    `contact:${getClientIp(req)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );
  if (limited) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ error: "Too many messages sent. Please try again later." });
  }

  const { name, email, phone, service, message } = req.body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !EMAIL_PATTERN.test(email.trim()) ||
    typeof message !== "string" ||
    !message.trim()
  ) {
    return res.status(400).json({ error: "Name, a valid email, and a message are required" });
  }

  const record = {
    name: name.trim().slice(0, 200),
    email: email.trim().slice(0, 200),
    phone: typeof phone === "string" ? phone.trim().slice(0, 50) : "",
    service: typeof service === "string" ? service.trim().slice(0, 100) : "",
    message: message.trim().slice(0, 1000),
  };

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("messages").insert(record);
    if (error) throw error;
  } catch (err) {
    console.error("Failed to save contact message", err);
    return res.status(500).json({ error: "Failed to save your message. Please try again." });
  }

  try {
    await sendContactNotification(record);
  } catch (err) {
    console.error("Failed to send notification email", err);
  }

  return res.status(200).json({ success: true });
}
