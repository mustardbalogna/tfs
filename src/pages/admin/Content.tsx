import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import {
  DEFAULT_SITE_CONTENT,
  fetchSiteContent,
  saveSiteContent,
  type SiteContent,
} from "@/lib/siteContent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-xl text-foreground">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function AdminContent() {
  const { checking } = useRequireAdmin();
  const navigate = useNavigate();
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (checking) return;
    fetchSiteContent()
      .then(setContent)
      .finally(() => setLoading(false));
  }, [checking]);

  function updateArrayItem<T>(list: T[], index: number, patch: Partial<T>): T[] {
    return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
  }

  function updateStringItem(list: string[], index: number, value: string): string[] {
    return list.map((item, i) => (i === index ? value : item));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await saveSiteContent(content);
      setSuccess("Content saved.");
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        navigate("/admin/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to save content");
    } finally {
      setSaving(false);
    }
  }

  if (checking || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Site Content</h1>
        <Button variant="outline" asChild>
          <Link to="/admin">Back to dashboard</Link>
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Edit the text shown across the public site. Changes are live as soon as you save.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <Section title="Home — Categories We Service">
          <p className="text-sm text-muted-foreground">
            These 4 cards are fixed — edit their headings and blurbs only.
          </p>
          {content.homeCategories.map((c, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
              <Field label="Heading">
                <Input
                  value={c.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      homeCategories: updateArrayItem(prev.homeCategories, i, {
                        title: e.target.value,
                      }),
                    }))
                  }
                />
              </Field>
              <Field label="Blurb">
                <Textarea
                  rows={2}
                  value={c.desc}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      homeCategories: updateArrayItem(prev.homeCategories, i, {
                        desc: e.target.value,
                      }),
                    }))
                  }
                />
              </Field>
            </div>
          ))}
        </Section>

        <Section title="Home — About Preview">
          <Field label="Heading">
            <Input
              value={content.homeAbout.heading}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  homeAbout: { ...prev.homeAbout, heading: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Paragraph 1">
            <Textarea
              rows={3}
              value={content.homeAbout.paragraph1}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  homeAbout: { ...prev.homeAbout, paragraph1: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Paragraph 2">
            <Textarea
              rows={3}
              value={content.homeAbout.paragraph2}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  homeAbout: { ...prev.homeAbout, paragraph2: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Services box heading">
            <Input
              value={content.homeServices.heading}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  homeServices: { ...prev.homeServices, heading: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Services box items">
            <div className="grid gap-2 sm:grid-cols-2">
              {content.homeServices.items.map((item, i) => (
                <Input
                  key={i}
                  value={item}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      homeServices: {
                        ...prev.homeServices,
                        items: updateStringItem(prev.homeServices.items, i, e.target.value),
                      },
                    }))
                  }
                />
              ))}
            </div>
          </Field>
        </Section>

        <Section title="Home &amp; Contact — Areas We Service">
          <Field label="Heading">
            <Input
              value={content.homeAreas.heading}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  homeAreas: { ...prev.homeAreas, heading: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Blurb">
            <Textarea
              rows={2}
              value={content.homeAreas.blurb}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  homeAreas: { ...prev.homeAreas, blurb: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Suburbs">
            <div className="grid gap-2 sm:grid-cols-2">
              {content.homeAreas.suburbs.map((s, i) => (
                <Input
                  key={i}
                  value={s}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      homeAreas: {
                        ...prev.homeAreas,
                        suburbs: updateStringItem(prev.homeAreas.suburbs, i, e.target.value),
                      },
                    }))
                  }
                />
              ))}
            </div>
          </Field>
          <Field label="Contact page service areas">
            <div className="grid gap-2 sm:grid-cols-2">
              {content.contact.serviceAreas.map((s, i) => (
                <Input
                  key={i}
                  value={s}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        serviceAreas: updateStringItem(
                          prev.contact.serviceAreas,
                          i,
                          e.target.value,
                        ),
                      },
                    }))
                  }
                />
              ))}
            </div>
          </Field>
        </Section>

        <Section title="About Page">
          <Field label="Heading">
            <Input
              value={content.aboutPage.heading}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  aboutPage: { ...prev.aboutPage, heading: e.target.value },
                }))
              }
            />
          </Field>
          {content.aboutPage.paragraphs.map((p, i) => (
            <Field key={i} label={`Paragraph ${i + 1}`}>
              <Textarea
                rows={2}
                value={p}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    aboutPage: {
                      ...prev.aboutPage,
                      paragraphs: updateStringItem(prev.aboutPage.paragraphs, i, e.target.value),
                    },
                  }))
                }
              />
            </Field>
          ))}
          <p className="text-sm text-muted-foreground">
            The 3 highlight cards below are fixed — edit their text only.
          </p>
          {content.aboutPage.values.map((v, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={v.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        values: updateArrayItem(prev.aboutPage.values, i, {
                          title: e.target.value,
                        }),
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={2}
                  value={v.desc}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        values: updateArrayItem(prev.aboutPage.values, i, { desc: e.target.value }),
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ))}
        </Section>

        <Section title="Services Page">
          <Field label="Heading">
            <Input
              value={content.servicesPage.heading}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  servicesPage: { ...prev.servicesPage, heading: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Intro">
            <Textarea
              rows={2}
              value={content.servicesPage.intro}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  servicesPage: { ...prev.servicesPage, intro: e.target.value },
                }))
              }
            />
          </Field>
          <p className="text-sm text-muted-foreground">
            The service cards below are fixed — edit their text only.
          </p>
          {content.servicesPage.items.map((item, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={item.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      servicesPage: {
                        ...prev.servicesPage,
                        items: updateArrayItem(prev.servicesPage.items, i, {
                          title: e.target.value,
                        }),
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={2}
                  value={item.desc}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      servicesPage: {
                        ...prev.servicesPage,
                        items: updateArrayItem(prev.servicesPage.items, i, {
                          desc: e.target.value,
                        }),
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ))}
        </Section>

        <Section title="Contact Page">
          <Field label="Intro">
            <Textarea
              rows={2}
              value={content.contact.intro}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, intro: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Business hours">
            <div className="space-y-2">
              {content.contact.hours.map((row, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Days"
                    value={row.label}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          hours: updateArrayItem(prev.contact.hours, i, { label: e.target.value }),
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Hours"
                    value={row.value}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          hours: updateArrayItem(prev.contact.hours, i, { value: e.target.value }),
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </Field>
        </Section>

        {success && <p className="text-sm text-primary">{success}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
