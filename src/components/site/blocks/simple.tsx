import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { BlockOf, PageKey } from "@/lib/siteContent";
import {
  AddItem,
  BlockSection,
  EditableImage,
  EditableText,
  ListItem,
  SortableList,
} from "../editable";
import { useIsEditing } from "../content-context";
import Reveal from "../Reveal";
import { BlockHeader, Container, toneStyles } from "./shared";

interface Props<T extends BlockOf<"intro" | "tags" | "stats" | "cta">> {
  page: PageKey;
  block: T;
  path: string;
}

export function IntroBlock({ page, block, path }: Props<BlockOf<"intro">>) {
  const p = block.props;
  return (
    <BlockSection page={page} block={block} label="Heading" className="pt-16 sm:pt-24">
      <Container>
        <Reveal>
          <BlockHeader
            base={`${path}.props`}
            align={p.align}
            tone={toneStyles("plain")}
            level={p.level}
          />
        </Reveal>
      </Container>
    </BlockSection>
  );
}

export function TagsBlock({ page, block, path }: Props<BlockOf<"tags">>) {
  const p = block.props;
  const base = `${path}.props`;
  const tone = toneStyles(p.tone);
  const editing = useIsEditing();
  const center = p.align === "center";
  return (
    <BlockSection
      page={page}
      block={block}
      label="Tag cloud"
      className={cn("py-16 sm:py-24", tone.section)}
    >
      <Container className={cn(center && "text-center")}>
        <Reveal>
          <BlockHeader base={base} align={p.align} tone={tone} eyebrow={false} />
        </Reveal>
        <SortableList
          listPath={`${base}.items`}
          className={cn("mt-8 flex flex-wrap gap-3", center && "justify-center")}
        >
          {p.items.map((_, i) => (
            <ListItem
              key={i}
              listPath={`${base}.items`}
              index={i}
              className={cn(
                "inline-flex items-center rounded-full border px-4 py-1.5 text-sm transition-colors hover:border-primary/50",
                tone.pill,
              )}
            >
              <EditableText path={`${base}.items.${i}`} placeholder="Tag" />
            </ListItem>
          ))}
          <AddItem
            listPath={`${base}.items`}
            template="New tag"
            label="Add"
            className="rounded-full px-4 py-1.5 text-xs"
          />
        </SortableList>
        {(p.cta.label || editing) && (
          <div className="mt-8">
            <Link
              to={p.cta.to}
              className={cn(
                "text-sm font-medium hover:underline",
                tone.dark ? "text-background" : "text-primary",
              )}
            >
              <EditableText path={`${base}.cta.label`} placeholder="Link text (optional)" />
            </Link>
          </div>
        )}
      </Container>
    </BlockSection>
  );
}

export function StatsBlock({ page, block, path }: Props<BlockOf<"stats">>) {
  const p = block.props;
  const base = `${path}.props`;
  const tone = toneStyles(p.tone);
  return (
    <BlockSection
      page={page}
      block={block}
      label="Numbers"
      className={cn("py-14 sm:py-20", tone.section)}
    >
      <Container>
        <SortableList
          listPath={`${base}.items`}
          className={cn(
            "grid gap-8 text-center",
            p.items.length <= 2 ? "sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4",
          )}
        >
          {p.items.map((_, i) => (
            <ListItem key={i} listPath={`${base}.items`} index={i}>
              <Reveal delay={i * 80}>
                <EditableText
                  path={`${base}.items.${i}.value`}
                  as="p"
                  className={cn("font-serif text-4xl sm:text-5xl", tone.heading)}
                  placeholder="0"
                />
                <EditableText
                  path={`${base}.items.${i}.label`}
                  as="p"
                  className={cn("mt-2 text-sm uppercase tracking-wider", tone.body)}
                  placeholder="Label"
                />
              </Reveal>
            </ListItem>
          ))}
          <AddItem
            listPath={`${base}.items`}
            template={{ value: "10+", label: "New figure" }}
            label="Add"
            className="py-6"
            max={6}
          />
        </SortableList>
      </Container>
    </BlockSection>
  );
}

export function CtaBlock({ page, block, path }: Props<BlockOf<"cta">>) {
  const p = block.props;
  const base = `${path}.props`;
  return (
    <BlockSection
      page={page}
      block={block}
      label="Call to action"
      className="relative overflow-hidden bg-primary py-16 sm:py-24"
    >
      <div className="absolute inset-0">
        <EditableImage
          path={`${base}.image`}
          image={p.image}
          zoomable={false}
          optional
          placeholderLabel="Add background photo"
          className="h-full w-full"
          imgClassName="h-full w-full object-cover"
          fallback={<div className="h-full w-full" />}
        />
        {p.image && <div className="pointer-events-none absolute inset-0 bg-primary/80" />}
      </div>
      <Container className="relative text-center">
        <Reveal>
          <EditableText
            path={`${base}.heading`}
            as="h2"
            className="font-serif text-3xl tracking-tight text-primary-foreground sm:text-4xl"
            placeholder="Heading"
          />
          <EditableText
            path={`${base}.blurb`}
            as="p"
            multiline
            className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80"
            placeholder="Short paragraph (optional)"
          />
          <div className="mt-8">
            <Link
              to={p.button.to}
              className="inline-flex items-center justify-center rounded-md bg-background px-8 py-3 text-sm font-semibold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-background/90 hover:shadow-md"
            >
              <EditableText path={`${base}.button.label`} placeholder="Button" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </BlockSection>
  );
}
