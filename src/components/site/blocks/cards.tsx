import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { BlockOf, PageKey } from "@/lib/siteContent";
import {
  AddItem,
  BlockSection,
  EditableIcon,
  EditableImage,
  EditableText,
  ListItem,
  SortableList,
} from "../editable";
import { useIsEditing } from "../content-context";
import { getIcon } from "../icons";
import Reveal from "../Reveal";
import { BlockHeader, COLUMN_CLASSES, Container, toneStyles } from "./shared";

function CardIcon({ name }: { name: string }) {
  const Icon = getIcon(name);
  return <Icon className="h-8 w-8" />;
}

export default function CardsBlock({
  page,
  block,
  path,
}: {
  page: PageKey;
  block: BlockOf<"cards">;
  path: string;
}) {
  const p = block.props;
  const base = `${path}.props`;
  const tone = toneStyles(p.tone);
  const editing = useIsEditing();
  const hasHeader = Boolean(p.eyebrow || p.heading || p.blurb) || editing;
  const imageStyle = p.style === "image";

  return (
    <BlockSection
      page={page}
      block={block}
      label="Cards"
      className={cn("py-16 sm:py-24", tone.section)}
    >
      <Container>
        {hasHeader && (
          <Reveal>
            <BlockHeader base={base} align={p.align} tone={tone} />
          </Reveal>
        )}
        <SortableList
          listPath={`${base}.items`}
          className={cn("grid gap-6", COLUMN_CLASSES[p.columns], hasHeader && "mt-12")}
        >
          {p.items.map((item, i) => {
            const itemPath = `${base}.items.${i}`;
            return (
              <ListItem
                key={i}
                listPath={`${base}.items`}
                index={i}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg",
                  tone.card,
                )}
              >
                <Reveal delay={Math.min(i, 5) * 60} className="flex h-full flex-col">
                  {imageStyle && (
                    <EditableImage
                      path={`${itemPath}.image`}
                      image={item.image}
                      className="aspect-[4/3] w-full"
                      imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
                      placeholderLabel="Add photo"
                      fallback={
                        // Keeps the grid even when some cards have no photo yet.
                        <div className="flex aspect-[4/3] w-full items-center justify-center bg-primary/10 text-primary">
                          <CardIcon name={item.icon} />
                        </div>
                      }
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    {!imageStyle && (
                      <EditableIcon
                        itemPath={itemPath}
                        name={item.icon}
                        className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"
                        iconClassName="h-5 w-5"
                      />
                    )}
                    <EditableText
                      path={`${itemPath}.title`}
                      as="h3"
                      className={cn("font-serif text-lg", tone.heading, !imageStyle && "mt-4")}
                      placeholder="Title"
                    />
                    <EditableText
                      path={`${itemPath}.desc`}
                      as="p"
                      multiline
                      className={cn("mt-2 text-sm leading-relaxed", tone.body)}
                      placeholder="Short description"
                    />
                  </div>
                </Reveal>
              </ListItem>
            );
          })}
          <AddItem
            listPath={`${base}.items`}
            template={{ icon: "gem", image: null, title: "New card", desc: "Describe this card." }}
            label="Add card"
            className="min-h-40 p-6"
          />
        </SortableList>
        {(p.cta.label || editing) && (
          <div className={cn("mt-10", p.align === "center" ? "text-center" : "text-left")}>
            <Link
              to={p.cta.to}
              className={cn(
                "inline-flex items-center text-sm font-medium hover:underline",
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
