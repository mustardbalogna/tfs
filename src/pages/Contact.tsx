import { useState } from "react";

const SERVICE_OPTIONS = [
  { value: "cabinet-making", label: "Cabinet Making" },
  { value: "custom-furniture", label: "Custom Furniture" },
  { value: "joinery", label: "Joinery" },
  { value: "wardrobes", label: "Wardrobes" },
  { value: "outdoor-furniture", label: "Outdoor Furniture" },
  { value: "office-fitouts", label: "Office Fitouts" },
  { value: "other", label: "Other" },
];

const EMPTY_FORM = { name: "", email: "", phone: "", service: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send your message. Please try again.");
      }
      setForm(EMPTY_FORM);
      setStatus("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send your message. Please try again.",
      );
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Get in Touch</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Contact Us
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          For all enquiries, contact us today. We'd welcome the opportunity to earn your trust and
          deliver the best service in the industry.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="font-serif text-2xl text-foreground">Send us a message</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Service Interest
                </label>
                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a service</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>
              {status === "success" && (
                <p className="text-sm text-primary">Thanks! Your message has been sent.</p>
              )}
              {status === "error" && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitting" ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="font-serif text-xl text-foreground">Service Areas</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>Condell Park, NSW</li>
              <li>Bankstown, NSW</li>
              <li>Greenacre, NSW</li>
              <li>Yagoona, NSW</li>
              <li>Surrounding Sydney suburbs</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="font-serif text-xl text-foreground">Business Hours</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li className="flex justify-between">
                <span>Monday – Friday</span> <span>8:00 AM – 5:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span> <span>9:00 AM – 2:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span> <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
