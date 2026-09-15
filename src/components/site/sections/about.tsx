import { cn } from "@/lib/utils";
import { useSiteContent } from "../content-context";
import { AddItem, EditableIcon, EditableText, ListItem, Section } from "../editable";
import { COLUMN_CLASSES } from "../layout";

export function AboutIntro() {
  const { about } = useSiteContent();
  const s = about.intro;
  const center = s.align === "center";
  return (
    <Section page="about" id="intro" label="Intro" className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
          <EditableText
            path="about.intro.eyebrow"
            as="p"
            className="text-sm font-semibold uppercase tracking-widest text-primary"
            placeholder="Eyebrow (optional)"
          />
          <EditableText
            path="about.intro.heading"
            as="h1"
            className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl"
          />
        </div>
        <div className={cn("mt-12 max-w-3xl space-y-6", center && "mx-auto text-center")}>
          {s.paragraphs.map((_, i) => (
            <ListItem key={i} listPath="about.intro.paragraphs" index={i} direction="column">
              <EditableText
                path={`about.intro.paragraphs.${i}`}
                as="p"
                multiline
                className="leading-relaxed text-muted-foreground"
                placeholder="Paragraph"
              />
            </ListItem>
          ))}
          <AddItem
            listPath="about.intro.paragraphs"
            template="New paragraph."
            label="Add paragraph"
            className="w-full py-3"
            max={8}
          />
        </div>
      </div>
    </Section>
  );
}

export function AboutValues() {
  const { about } = useSiteContent();
  const s = about.values;
  return (
    <Section page="about" id="values" label="Highlights" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("grid gap-8", COLUMN_CLASSES[s.columns])}>
          {s.items.map((v, i) => (
            <ListItem
              key={i}
              listPath="about.values.items"
              index={i}
              className="rounded-xl border border-border bg-card p-8 text-center transition-shadow hover:shadow-md"
            >
              <div className="flex justify-center">
                <EditableIcon
                  itemPath={`about.values.items.${i}`}
                  name={v.icon}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
                  iconClassName="h-6 w-6"
                />
              </div>
              <EditableText
                path={`about.values.items.${i}.title`}
                as="h3"
                className="mt-4 font-serif text-xl text-foreground"
                placeholder="Title"
              />
              <EditableText
                path={`about.values.items.${i}.desc`}
                as="p"
                multiline
                className="mt-2 text-sm leading-relaxed text-muted-foreground"
                placeholder="Description"
              />
            </ListItem>
          ))}
          <AddItem
            listPath="about.values.items"
            template={{ icon: "star", title: "New highlight", desc: "Describe this value." }}
            label="Add card"
            className="min-h-44 p-8"
          />
        </div>
      </div>
    </Section>
  );
}

export const ABOUT_SECTIONS = {
  intro: AboutIntro,
  values: AboutValues,
} as const;
