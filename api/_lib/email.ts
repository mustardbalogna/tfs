import { Resend } from "resend";

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export async function sendContactNotification(payload: ContactMessagePayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!apiKey || !ownerEmail) return; // Message is already saved; email is best-effort.

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Top Furniture Supplies <onboarding@resend.dev>",
    to: ownerEmail,
    replyTo: payload.email,
    subject: `New enquiry from ${payload.name}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone || "-"}`,
      `Service: ${payload.service || "-"}`,
      "",
      payload.message,
    ].join("\n"),
  });
}
