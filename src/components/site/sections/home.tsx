import { Link } from "react-router-dom";
import bgimage from "@/assets/image.jpg";
import { cn } from "@/lib/utils";
import { useIsEditing, useSiteContent } from "../content-context";
import { AddItem, EditableIcon, EditableText, ListItem, Section } from "../editable";
import { COLUMN_CLASSES, TONE_CLASSES } from "../layout";

const OVERLAY_CLASSES = {
  light: "from-background/80 via-background/50 to-background/10",
  medium: "from-background/90 via-background/70 to-background/30",
  dark: "from-background/95 via-background/85 to-background/50",
} as const;

export function HomeHero() {
  const { home } = useSiteContent();
  const hero = home.hero;
  return (
    <Section page="home" id="hero" label="Hero" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={bgimage}
          alt="Custom furniture workshop with timber pieces"
          className="h-full w-full object-cover"
        />
        <div className={cn("absolute inset-0 bg-gradient-to-r", OVERLAY_CLASSES[hero.overlay])} />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="max-w-2xl">
          <EditableText
            path="home.hero.eyebrow"
            as="p"
            className="text-sm font-semibold uppercase tracking-widest text-primary"
          />
          <EditableText
            path="home.hero.heading"
            as="h1"
            multiline
            className="mt-4 font-serif text-4xl leading-tight font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          />
          <EditableText
            path="home.hero.subheading"
            as="p"
            multiline
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={hero.primaryCta.to}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <EditableText path="home.hero.primaryCta.label" />
            </Link>
            <Link
              to={hero.secondaryCta.to}
              className="inline-flex items-center justify-center rounded-md border border-border bg-background/80 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-accent"
            >
              <EditableText path="home.hero.secondaryCta.label" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function HomeCategories() {
  const { home } = useSiteContent();
  const s = home.categories;
  const editing = useIsEditing();
  const center = s.align === "center";
  return (
    <Section
      page="home"
      id="categories"
      label="Categories preview"
      className={cn("py-16 sm:py-24", TONE_CLASSES[s.tone])}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn(center ? "text-center" : "text-left", "max-w-3xl", center && "mx-auto")}>
          <EditableText
            path="home.categories.eyebrow"
            as="p"
            className="text-sm font-semibold uppercase tracking-widest text-primary"
            placeholder="Eyebrow (optional)"
          />
          <EditableText
            path="home.categories.heading"
            as="h2"
            className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
          />
          <EditableText
            path="home.categories.blurb"
            as="p"
            multiline
            className="mt-3 text-muted-foreground"
          />
        </div>
        <div className={cn("mt-10 grid gap-6", COLUMN_CLASSES[s.columns])}>
          {s.items.map((c, i) => (
            <ListItem
              key={i}
              listPath="home.categories.items"
              index={i}
              className="group rounded-xl border border-border bg-background p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <EditableIcon
                itemPath={`home.categories.items.${i}`}
                name={c.icon}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"
                iconClassName="h-5 w-5"
              />
              <EditableText
                path={`home.categories.items.${i}.title`}
                as="h3"
                className="mt-4 font-serif text-lg text-foreground"
                placeholder="Title"
              />
              <EditableText
                path={`home.categories.items.${i}.desc`}
                as="p"
                multiline
                className="mt-2 text-sm leading-relaxed text-muted-foreground"
                placeholder="Short description"
              />
            </ListItem>
          ))}
          <AddItem
            listPath="home.categories.items"
            template={{ icon: "gem", title: "New category", desc: "Describe this category." }}
            label="Add card"
            className="min-h-40 p-6"
          />
        </div>
        {(s.ctaLabel || editing) && (
          <div className={cn("mt-10", center ? "text-center" : "text-left")}>
            <Link
              to="/categories"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              <EditableText path="home.categories.ctaLabel" placeholder="Link text (optional)" />
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}

export function HomeAbout() {
  const { home } = useSiteContent();
  const s = home.about;
  return (
    <Section
      page="home"
      id="about"
      label="About preview"
      className={cn("py-16 sm:py-24", TONE_CLASSES[s.tone])}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className={cn(s.boxSide === "left" && "lg:order-2")}>
            <EditableText
              path="home.about.eyebrow"
              as="p"
              className="text-sm font-semibold uppercase tracking-widest text-primary"
              placeholder="Eyebrow (optional)"
            />
            <EditableText
              path="home.about.heading"
              as="h2"
              className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
            />
            <div className="mt-4 space-y-4">
              {s.paragraphs.map((_, i) => (
                <ListItem key={i} listPath="home.about.paragraphs" index={i} direction="column">
                  <EditableText
                    path={`home.about.paragraphs.${i}`}
                    as="p"
                    multiline
                    className="leading-relaxed text-muted-foreground"
                    placeholder="Paragraph"
                  />
                </ListItem>
              ))}
              <AddItem
                listPath="home.about.paragraphs"
                template="New paragraph."
                label="Add paragraph"
                className="w-full py-3"
                max={6}
              />
            </div>
            <div className="mt-8">
              <Link
                to="/about"
                className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <EditableText path="home.about.ctaLabel" />
              </Link>
            </div>
          </div>
          <div
            className={cn(
              "rounded-2xl border border-border/60 bg-muted p-8",
              s.boxSide === "left" && "lg:order-1",
            )}
          >
            <EditableText
              path="home.about.servicesHeading"
              as="h3"
              className="font-serif text-xl text-foreground"
            />
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {s.services.map((_, i) => (
                <ListItem
                  key={i}
                  listPath="home.about.services"
                  index={i}
                  as="li"
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <EditableText path={`home.about.services.${i}`} placeholder="Service" />
                </ListItem>
              ))}
              <AddItem
                listPath="home.about.services"
                template="New service"
                label="Add"
                className="py-1.5 text-xs"
              />
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function HomeAreas() {
  const { home } = useSiteContent();
  const s = home.areas;
  const editing = useIsEditing();
  const center = s.align === "center";
  return (
    <Section
      page="home"
      id="areas"
      label="Areas we service"
      className={cn("py-16 sm:py-24", TONE_CLASSES[s.tone])}
    >
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", center && "text-center")}>
        <EditableText
          path="home.areas.heading"
          as="h2"
          className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
        />
        <EditableText
          path="home.areas.blurb"
          as="p"
          multiline
          className={cn("mt-3 max-w-2xl text-muted-foreground", center && "mx-auto")}
        />
        <div className={cn("mt-8 flex flex-wrap gap-3", center && "justify-center")}>
          {s.suburbs.map((_, i) => (
            <ListItem
              key={i}
              listPath="home.areas.suburbs"
              index={i}
              className="inline-flex items-center rounded-full border border-border bg-background px-4 py-1.5 text-sm text-foreground"
            >
              <EditableText path={`home.areas.suburbs.${i}`} placeholder="Suburb" />
            </ListItem>
          ))}
          <AddItem
            listPath="home.areas.suburbs"
            template="New suburb"
            label="Add suburb"
            className="rounded-full px-4 py-1.5 text-xs"
          />
        </div>
        {(s.ctaLabel || editing) && (
          <div className="mt-8">
            <Link to="/contact" className="text-sm font-medium text-primary hover:underline">
              <EditableText path="home.areas.ctaLabel" placeholder="Link text (optional)" />
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}

export function HomeCta() {
  const { home } = useSiteContent();
  return (
    <Section page="home" id="cta" label="Call to action" className="bg-primary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <EditableText
          path="home.cta.heading"
          as="h2"
          className="font-serif text-3xl tracking-tight text-primary-foreground sm:text-4xl"
        />
        <EditableText
          path="home.cta.blurb"
          as="p"
          multiline
          className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80"
        />
        <div className="mt-8">
          <Link
            to={home.cta.button.to}
            className="inline-flex items-center justify-center rounded-md bg-background px-8 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-background/90"
          >
            <EditableText path="home.cta.button.label" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

export const HOME_SECTIONS = {
  hero: HomeHero,
  categories: HomeCategories,
  about: HomeAbout,
  areas: HomeAreas,
  cta: HomeCta,
} as const;
