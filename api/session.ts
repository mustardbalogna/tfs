import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  readSessionCookie,
  verifySessionToken,
  createSessionToken,
  buildSessionCookie,
} from "./_lib/session.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

// Lightweight, side-effect-free (besides refreshing the cookie) endpoint used
// by admin pages to check auth before rendering. The real authorization
// boundary is still each mutating API route's own session check.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { limited, retryAfterSeconds } = await checkRateLimit(
    `session:${getClientIp(req)}`,
    120,
    60 * 1000,
  );
  if (limited) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }

  if (!verifySessionToken(readSessionCookie(req.headers.cookie))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.setHeader("Set-Cookie", buildSessionCookie(createSessionToken()));
  return res.status(200).json({ authenticated: true });
}
