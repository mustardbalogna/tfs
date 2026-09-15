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
import { Container, toneStyles } from "./shared";

export default function TextImageBlock({
  page,
  block,
  path,
}: {
  page: PageKey;
  block: BlockOf<"textImage">;
  path: string;
}) {
  const p = block.props;
  const base = `${path}.props`;
  const tone = toneStyles(p.tone);
  const editing = useIsEditing();
  const asideFirst = p.asideSide === "left";

  return (
    <BlockSection
      page={page}
      block={block}
      label="Text & image"
      className={cn("py-16 sm:py-24", tone.section)}
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className={cn(asideFirst && "lg:order-2")}>
            <EditableText
              path={`${base}.eyebrow`}
              as="p"
              className={cn("text-sm font-semibold uppercase tracking-widest", tone.eyebrow)}
              placeholder="Eyebrow (optional)"
            />
            <EditableText
              path={`${base}.heading`}
              as="h2"
              className={cn("mt-3 font-serif text-3xl tracking-tight sm:text-4xl", tone.heading)}
              placeholder="Heading"
            />
            <SortableList listPath={`${base}.paragraphs`} axis="y" className="mt-5 space-y-4">
              {p.paragraphs.map((_, i) => (
                <ListItem key={i} listPath={`${base}.paragraphs`} index={i} controls="inside">
                  <EditableText
                    path={`${base}.paragraphs.${i}`}
                    as="p"
                    multiline
                    className={cn("leading-relaxed", tone.body)}
                    placeholder="Paragraph"
                  />
                </ListItem>
              ))}
              <AddItem
                listPath={`${base}.paragraphs`}
                template="New paragraph."
                label="Add paragraph"
                className="w-full py-3"
                max={8}
              />
            </SortableList>
            {(p.cta.label || editing) && (
              <div className="mt-8">
                <Link
                  to={p.cta.to}
                  className={cn(
                    "inline-flex items-center rounded-md px-6 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md",
                    tone.dark
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  <EditableText path={`${base}.cta.label`} placeholder="Button (optional)" />
                </Link>
              </div>
            )}
          </Reveal>

          <Reveal delay={120} className={cn(asideFirst && "lg:order-1")}>
            {p.aside === "image" ? (
              <EditableImage
                path={`${base}.image`}
                image={p.image}
                className="aspect-[4/3] w-full rounded-2xl shadow-lg lg:aspect-[5/4]"
                placeholderLabel="Add photo"
              />
            ) : (
              <div className={cn("rounded-2xl border p-8", tone.card)}>
                <EditableText
                  path={`${base}.listHeading`}
                  as="h3"
                  className={cn("font-serif text-xl", tone.heading)}
                  placeholder="List heading"
                />
                <SortableList
                  listPath={`${base}.listItems`}
                  as="ul"
                  className="mt-4 grid grid-cols-2 gap-3"
                >
                  {p.listItems.map((_, i) => (
                    <ListItem
                      key={i}
                      listPath={`${base}.listItems`}
                      index={i}
                      as="li"
                      controls="inside"
                      className={cn("flex items-center gap-2 text-sm", tone.body)}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <EditableText path={`${base}.listItems.${i}`} placeholder="Item" />
                    </ListItem>
                  ))}
                  <AddItem
                    listPath={`${base}.listItems`}
                    template="New item"
                    label="Add"
                    className="py-1.5 text-xs"
                  />
                </SortableList>
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </BlockSection>
  );
}
