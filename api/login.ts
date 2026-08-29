import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { createSessionToken, buildSessionCookie } from "./_lib/session.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { limited, retryAfterSeconds } = await checkRateLimit(
    `login:${getClientIp(req)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );
  if (limited) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ error: "Too many login attempts. Please try again later." });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: "Admin login is not configured" });
  }

  const { password } = req.body ?? {};
  if (typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Password is required" });
  }

  const providedBuf = Buffer.from(password);
  const expectedBuf = Buffer.from(adminPassword);
  const isValid =
    providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf);
  if (!isValid) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  res.setHeader("Set-Cookie", buildSessionCookie(createSessionToken()));
  return res.status(200).json({ success: true });
}
