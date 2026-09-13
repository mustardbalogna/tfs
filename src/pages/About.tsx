import { useEffect, useState } from "react";
import { HeartHandshake, Wrench, Shield } from "lucide-react";
import { DEFAULT_SITE_CONTENT, fetchSiteContent, type SiteContent } from "@/lib/siteContent";

const VALUE_ICONS = [HeartHandshake, Wrench, Shield];

export default function About() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    fetchSiteContent().then(setContent);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">About Us</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          {content.aboutPage.heading}
        </h1>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-6 text-center text-muted-foreground">
        {content.aboutPage.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {content.aboutPage.values.map((v, i) => {
          const Icon = VALUE_ICONS[i] ?? HeartHandshake;
          return (
            <div key={v.title} className="rounded-lg border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif text-xl text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
