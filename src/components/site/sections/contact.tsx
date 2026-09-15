import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsEditing, useSiteContent } from "../content-context";
import { AddItem, EditableText, ListItem, Section } from "../editable";

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
const MAX_LENGTHS = { name: 200, email: 200, phone: 50, message: 1000 };

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const submitClass =
  "inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50";

export function ContactIntro() {
  return (
    <Section page="contact" id="intro" label="Intro" className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <EditableText
            path="contact.intro.eyebrow"
            as="p"
            className="text-sm font-semibold uppercase tracking-widest text-primary"
            placeholder="Eyebrow (optional)"
          />
          <EditableText
            path="contact.intro.heading"
            as="h1"
            className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl"
          />
          <EditableText
            path="contact.intro.blurb"
            as="p"
            multiline
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
            placeholder="Intro paragraph (optional)"
          />
        </div>
      </div>
    </Section>
  );
}

export function ContactMain() {
  const { contact } = useSiteContent();
  const s = contact.main;
  const editing = useIsEditing();
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
    <Section page="contact" id="main" label="Form & details" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className={cn("lg:col-span-3", s.infoSide === "left" && "lg:order-2")}>
            <div className="rounded-xl border border-border bg-card p-8">
              <EditableText
                path="contact.main.formHeading"
                as="h2"
                className="font-serif text-2xl text-foreground"
              />
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      maxLength={MAX_LENGTHS.name}
                      className={inputClass}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      maxLength={MAX_LENGTHS.email}
                      className={inputClass}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={MAX_LENGTHS.phone}
                    className={inputClass}
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Service Interest
                  </label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className={inputClass}
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
                  <label className="mb-1 block text-sm font-medium text-foreground">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    maxLength={MAX_LENGTHS.message}
                    className={inputClass}
                    placeholder="Tell us about your project..."
                  ></textarea>
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {form.message.length}/{MAX_LENGTHS.message}
                  </p>
                </div>
                {status === "success" && <p className="text-sm text-primary">{s.successMessage}</p>}
                {status === "error" && <p className="text-sm text-destructive">{error}</p>}
                {editing ? (
                  // contentEditable inside a real <button> is unreliable, so the
                  // preview swaps in a look-alike element for label editing.
                  <div className={submitClass}>
                    <EditableText path="contact.main.submitLabel" />
                  </div>
                ) : (
                  <button type="submit" disabled={status === "submitting"} className={submitClass}>
                    {status === "submitting" ? "Sending..." : s.submitLabel}
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className={cn("space-y-8 lg:col-span-2", s.infoSide === "left" && "lg:order-1")}>
            <div className="rounded-xl border border-border bg-card p-8">
              <EditableText
                path="contact.main.areasHeading"
                as="h3"
                className="font-serif text-xl text-foreground"
              />
              <ul className="mt-4 space-y-2 text-muted-foreground">
                {s.serviceAreas.map((_, i) => (
                  <ListItem
                    key={i}
                    listPath="contact.main.serviceAreas"
                    index={i}
                    as="li"
                    direction="column"
                  >
                    <EditableText path={`contact.main.serviceAreas.${i}`} placeholder="Area" />
                  </ListItem>
                ))}
              </ul>
              <AddItem
                listPath="contact.main.serviceAreas"
                template="New area"
                label="Add area"
                className="mt-3 w-full py-1.5 text-xs"
              />
            </div>
            <div className="rounded-xl border border-border bg-card p-8">
              <EditableText
                path="contact.main.hoursHeading"
                as="h3"
                className="font-serif text-xl text-foreground"
              />
              <ul className="mt-4 space-y-2 text-muted-foreground">
                {s.hours.map((_, i) => (
                  <ListItem
                    key={i}
                    listPath="contact.main.hours"
                    index={i}
                    as="li"
                    direction="column"
                    className="flex justify-between gap-4"
                  >
                    <EditableText path={`contact.main.hours.${i}.label`} placeholder="Days" />
                    <EditableText
                      path={`contact.main.hours.${i}.value`}
                      className="text-right"
                      placeholder="Hours"
                    />
                  </ListItem>
                ))}
              </ul>
              <AddItem
                listPath="contact.main.hours"
                template={{ label: "Day", value: "9:00 AM – 5:00 PM" }}
                label="Add row"
                className="mt-3 w-full py-1.5 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export const CONTACT_SECTIONS = {
  intro: ContactIntro,
  main: ContactMain,
} as const;
