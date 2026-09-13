import { useEffect, useState } from "react";
import { Puzzle, Frame, Armchair, Table, Coffee, Tv, Gem, FlaskConical } from "lucide-react";
import { DEFAULT_SITE_CONTENT, fetchSiteContent, type SiteContent } from "@/lib/siteContent";

const SERVICE_ICONS = [Puzzle, Frame, Armchair, Table, Coffee, Tv, Gem, FlaskConical, Gem];

export default function Services() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    fetchSiteContent().then(setContent);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">What We Do</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          {content.servicesPage.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{content.servicesPage.intro}</p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {content.servicesPage.items.map((s, i) => {
          const Icon = SERVICE_ICONS[i] ?? Gem;
          return (
            <div
              key={s.title}
              className="rounded-lg border border-border bg-card p-8 transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif text-xl text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
