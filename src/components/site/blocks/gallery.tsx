import { useState } from "react";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockOf, PageKey } from "@/lib/siteContent";
import Lightbox from "@/components/Lightbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AddItem,
  BlockSection,
  EditableImage,
  EditableText,
  ListItem,
  SortableList,
} from "../editable";
import { useEditor, useIsEditing } from "../content-context";
import Reveal from "../Reveal";
import { BlockHeader, COLUMN_CLASSES, Container, toneStyles } from "./shared";

interface Props<T> {
  page: PageKey;
  block: T;
  path: string;
}

export function GalleryBlock({ page, block, path }: Props<BlockOf<"gallery">>) {
  const p = block.props;
  const base = `${path}.props`;
  const tone = toneStyles(p.tone);
  const editor = useEditor();
  const editing = editor !== null;
  const [lightbox, setLightbox] = useState<number | null>(null);
  const hasHeader = Boolean(p.eyebrow || p.heading || p.blurb) || editing;

  return (
    <BlockSection
      page={page}
      block={block}
      label="Gallery"
      className={cn("py-16 sm:py-24", tone.section)}
    >
      <Container>
        {hasHeader && (
          <Reveal>
            <BlockHeader base={base} align="center" tone={tone} />
          </Reveal>
        )}
        <SortableList
          listPath={`${base}.images`}
          className={cn("grid gap-4", COLUMN_CLASSES[p.columns], hasHeader && "mt-12")}
        >
          {p.images.map((img, i) => (
            <ListItem key={img.url + i} listPath={`${base}.images`} index={i}>
              <Reveal delay={Math.min(i, 5) * 50}>
                <EditableImage
                  path={`${base}.images.${i}`}
                  image={img}
                  onZoom={() => setLightbox(i)}
                  className="aspect-square w-full rounded-xl shadow-sm"
                  imgClassName="transition-transform duration-500 hover:scale-[1.04]"
                />
              </Reveal>
            </ListItem>
          ))}
          {editing && (
            <button
              type="button"
              data-editor-ui
              onClick={(e) => {
                e.stopPropagation();
                editor.pickImage(`${base}.images.${p.images.length}`);
              }}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10"
            >
              + Add photo
            </button>
          )}
        </SortableList>
        {!editing && p.images.length === 0 && (
          <p className={cn("text-center text-sm", tone.body)}>No photos yet.</p>
        )}
      </Container>
      {lightbox !== null && (
        <Lightbox
          images={p.images.map((img, i) => ({ id: String(i), url: img.url }))}
          index={lightbox}
          onIndexChange={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </BlockSection>
  );
}

export function TestimonialsBlock({ page, block, path }: Props<BlockOf<"testimonials">>) {
  const p = block.props;
  const base = `${path}.props`;
  const tone = toneStyles(p.tone);
  return (
    <BlockSection
      page={page}
      block={block}
      label="Testimonials"
      className={cn("py-16 sm:py-24", tone.section)}
    >
      <Container>
        <Reveal>
          <BlockHeader base={base} align="center" tone={tone} blurb={false} />
        </Reveal>
        <SortableList
          listPath={`${base}.items`}
          className={cn("mt-12 grid gap-6", COLUMN_CLASSES[p.columns])}
        >
          {p.items.map((_, i) => (
            <ListItem
              key={i}
              listPath={`${base}.items`}
              index={i}
              className={cn("flex flex-col rounded-xl border p-8", tone.card)}
            >
              <Reveal delay={i * 80} className="flex h-full flex-col">
                <Quote className="h-6 w-6 text-primary/60" />
                <EditableText
                  path={`${base}.items.${i}.quote`}
                  as="p"
                  multiline
                  className={cn("mt-4 flex-1 text-base leading-relaxed", tone.heading)}
                  placeholder="Quote"
                />
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif text-sm text-primary">
                    {(p.items[i].name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <EditableText
                      path={`${base}.items.${i}.name`}
                      as="p"
                      className={cn("text-sm font-semibold", tone.heading)}
                      placeholder="Name"
                    />
                    <EditableText
                      path={`${base}.items.${i}.role`}
                      as="p"
                      className={cn("text-xs", tone.body)}
                      placeholder="Suburb or role (optional)"
                    />
                  </div>
                </div>
              </Reveal>
            </ListItem>
          ))}
          <AddItem
            listPath={`${base}.items`}
            template={{ quote: "Add a customer quote here.", name: "Customer name", role: "" }}
            label="Add testimonial"
            className="min-h-40 p-8"
            max={9}
          />
        </SortableList>
      </Container>
    </BlockSection>
  );
}

export function FaqBlock({ page, block, path }: Props<BlockOf<"faq">>) {
  const p = block.props;
  const base = `${path}.props`;
  const tone = toneStyles(p.tone);
  const editing = useIsEditing();
  return (
    <BlockSection
      page={page}
      block={block}
      label="FAQ"
      className={cn("py-16 sm:py-24", tone.section)}
    >
      <Container className="max-w-3xl">
        <Reveal>
          <BlockHeader base={base} align="center" tone={tone} />
        </Reveal>
        <Reveal delay={100}>
          {editing ? (
            // Always expanded while editing so every answer is reachable.
            <SortableList listPath={`${base}.items`} axis="y" className="mt-10 space-y-3">
              {p.items.map((_, i) => (
                <ListItem
                  key={i}
                  listPath={`${base}.items`}
                  index={i}
                  className={cn("rounded-lg border p-5", tone.card)}
                >
                  <EditableText
                    path={`${base}.items.${i}.question`}
                    as="p"
                    className={cn("pr-16 text-sm font-medium", tone.heading)}
                    placeholder="Question"
                  />
                  <EditableText
                    path={`${base}.items.${i}.answer`}
                    as="p"
                    multiline
                    className={cn("mt-2 text-sm leading-relaxed", tone.body)}
                    placeholder="Answer"
                  />
                </ListItem>
              ))}
              <AddItem
                listPath={`${base}.items`}
                template={{ question: "New question?", answer: "Add your answer here." }}
                label="Add question"
                className="w-full py-3"
                max={20}
              />
            </SortableList>
          ) : (
            <Accordion type="single" collapsible className="mt-10">
              {p.items.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={String(i)}
                  className={tone.dark ? "border-background/15" : ""}
                >
                  <AccordionTrigger className={cn("text-base hover:no-underline", tone.heading)}>
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent
                    className={cn("whitespace-pre-line leading-relaxed", tone.body)}
                  >
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </Reveal>
      </Container>
    </BlockSection>
  );
}
