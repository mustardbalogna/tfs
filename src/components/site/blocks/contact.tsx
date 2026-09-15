import { useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockOf, PageKey } from "@/lib/siteContent";
import { AddItem, BlockSection, EditableText, ListItem, SortableList } from "../editable";
import { useIsEditing } from "../content-context";
import Reveal from "../Reveal";
import { Container } from "./shared";

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

export default function ContactBlock({
  page,
  block,
  path,
}: {
  page: PageKey;
  block: BlockOf<"contact">;
  path: string;
}) {
  const p = block.props;
  const base = `${path}.props`;
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
    <BlockSection page={page} block={block} label="Contact form" className="py-14 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-5">
          <Reveal className={cn("lg:col-span-3", p.infoSide === "left" && "lg:order-2")}>
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <EditableText
                path={`${base}.formHeading`}
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
                {status === "success" && <p className="text-sm text-primary">{p.successMessage}</p>}
                {status === "error" && <p className="text-sm text-destructive">{error}</p>}
                {editing ? (
                  // contentEditable inside a real <button> is unreliable, so the
                  // preview swaps in a look-alike element for label editing.
                  <div className={submitClass}>
                    <EditableText path={`${base}.submitLabel`} />
                  </div>
                ) : (
                  <button type="submit" disabled={status === "submitting"} className={submitClass}>
                    {status === "submitting" ? "Sending..." : p.submitLabel}
                  </button>
                )}
              </form>
            </div>
          </Reveal>

          <Reveal
            delay={100}
            className={cn("space-y-6 lg:col-span-2", p.infoSide === "left" && "lg:order-1")}
          >
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <EditableText
                  path={`${base}.areasHeading`}
                  as="h3"
                  className="font-serif text-xl text-foreground"
                />
              </div>
              <SortableList
                listPath={`${base}.serviceAreas`}
                as="ul"
                axis="y"
                className="mt-4 space-y-2 text-muted-foreground"
              >
                {p.serviceAreas.map((_, i) => (
                  <ListItem
                    key={i}
                    listPath={`${base}.serviceAreas`}
                    index={i}
                    as="li"
                    controls="inside"
                  >
                    <EditableText path={`${base}.serviceAreas.${i}`} placeholder="Area" />
                  </ListItem>
                ))}
              </SortableList>
              <AddItem
                listPath={`${base}.serviceAreas`}
                template="New area"
                label="Add area"
                className="mt-3 w-full py-1.5 text-xs"
              />
            </div>
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <EditableText
                  path={`${base}.hoursHeading`}
                  as="h3"
                  className="font-serif text-xl text-foreground"
                />
              </div>
              <SortableList
                listPath={`${base}.hours`}
                as="ul"
                axis="y"
                className="mt-4 space-y-2 text-muted-foreground"
              >
                {p.hours.map((_, i) => (
                  <ListItem
                    key={i}
                    listPath={`${base}.hours`}
                    index={i}
                    as="li"
                    controls="inside"
                    className="flex justify-between gap-4"
                  >
                    <EditableText path={`${base}.hours.${i}.label`} placeholder="Days" />
                    <EditableText
                      path={`${base}.hours.${i}.value`}
                      className={cn("text-right", editing && "mr-16")}
                      placeholder="Hours"
                    />
                  </ListItem>
                ))}
              </SortableList>
              <AddItem
                listPath={`${base}.hours`}
                template={{ label: "Day", value: "9:00 AM – 5:00 PM" }}
                label="Add row"
                className="mt-3 w-full py-1.5 text-xs"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </BlockSection>
  );
}
