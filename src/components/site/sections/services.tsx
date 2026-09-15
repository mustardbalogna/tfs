import { cn } from "@/lib/utils";
import { useSiteContent } from "../content-context";
import { AddItem, EditableIcon, EditableText, ListItem, Section } from "../editable";
import { COLUMN_CLASSES } from "../layout";

export function ServicesIntro() {
  const { services } = useSiteContent();
  const center = services.intro.align === "center";
  return (
    <Section page="services" id="intro" label="Intro" className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
          <EditableText
            path="services.intro.eyebrow"
            as="p"
            className="text-sm font-semibold uppercase tracking-widest text-primary"
            placeholder="Eyebrow (optional)"
          />
          <EditableText
            path="services.intro.heading"
            as="h1"
            className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl"
          />
          <EditableText
            path="services.intro.blurb"
            as="p"
            multiline
            className={cn("mt-4 max-w-2xl text-muted-foreground", center && "mx-auto")}
            placeholder="Intro paragraph (optional)"
          />
        </div>
      </div>
    </Section>
  );
}

export function ServicesGrid() {
  const { services } = useSiteContent();
  const s = services.grid;
  return (
    <Section page="services" id="grid" label="Service cards" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("grid gap-8", COLUMN_CLASSES[s.columns])}>
          {s.items.map((item, i) => (
            <ListItem
              key={i}
              listPath="services.grid.items"
              index={i}
              className="rounded-xl border border-border bg-card p-8 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <EditableIcon
                itemPath={`services.grid.items.${i}`}
                name={item.icon}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
                iconClassName="h-6 w-6"
              />
              <EditableText
                path={`services.grid.items.${i}.title`}
                as="h3"
                className="mt-4 font-serif text-xl text-foreground"
                placeholder="Service name"
              />
              <EditableText
                path={`services.grid.items.${i}.desc`}
                as="p"
                multiline
                className="mt-2 text-sm leading-relaxed text-muted-foreground"
                placeholder="Description"
              />
            </ListItem>
          ))}
          <AddItem
            listPath="services.grid.items"
            template={{ icon: "hammer", title: "New service", desc: "Describe this service." }}
            label="Add service"
            className="min-h-44 p-8"
          />
        </div>
      </div>
    </Section>
  );
}

export const SERVICES_SECTIONS = {
  intro: ServicesIntro,
  grid: ServicesGrid,
} as const;
