import { Fragment, type ComponentType } from "react";
import { Plus } from "lucide-react";
import type { Block, BlockType, PageKey } from "@/lib/siteContent";
import { useEditor, useSiteContent } from "./content-context";
import HeroBlock from "./blocks/hero";
import CardsBlock from "./blocks/cards";
import TextImageBlock from "./blocks/textImage";
import { CtaBlock, IntroBlock, StatsBlock, TagsBlock } from "./blocks/simple";
import { FaqBlock, GalleryBlock, TestimonialsBlock } from "./blocks/gallery";
import CategoriesGridBlock from "./blocks/categoriesGrid";
import ContactBlock from "./blocks/contact";

// Each renderer narrows `block` itself; the registry is typed loosely so the
// lookup stays a single line.
type AnyBlockComponent = ComponentType<{ page: PageKey; block: never; path: string }>;

const RENDERERS: Record<BlockType, AnyBlockComponent> = {
  hero: HeroBlock as AnyBlockComponent,
  intro: IntroBlock as AnyBlockComponent,
  cards: CardsBlock as AnyBlockComponent,
  textImage: TextImageBlock as AnyBlockComponent,
  tags: TagsBlock as AnyBlockComponent,
  gallery: GalleryBlock as AnyBlockComponent,
  stats: StatsBlock as AnyBlockComponent,
  testimonials: TestimonialsBlock as AnyBlockComponent,
  faq: FaqBlock as AnyBlockComponent,
  cta: CtaBlock as AnyBlockComponent,
  categoriesGrid: CategoriesGridBlock as AnyBlockComponent,
  contact: ContactBlock as AnyBlockComponent,
};

/** Renders a page's blocks in order. In the editor, adds drop-sorting and "+" insert points. */
export default function PageBlocks({ page }: { page: PageKey }) {
  const content = useSiteContent();
  const editor = useEditor();
  const blocks = content.pages[page];

  const rendered = blocks.map((block: Block, i) => {
    const Renderer = RENDERERS[block.type];
    return (
      <Renderer key={block.id} page={page} block={block as never} path={`pages.${page}.${i}`} />
    );
  });

  if (!editor) return <>{rendered}</>;

  return (
    <div data-sortable={`pages.${page}`} data-sortable-axis="y">
      <InsertPoint page={page} index={0} />
      {rendered.map((node, i) => (
        <Fragment key={blocks[i].id}>
          {node}
          <InsertPoint page={page} index={i + 1} />
        </Fragment>
      ))}
      {blocks.length === 0 && (
        <div className="px-4 py-24 text-center text-sm text-muted-foreground">
          This page is empty — add a section to get started.
        </div>
      )}
    </div>
  );
}

function InsertPoint({ page, index }: { page: PageKey; index: number }) {
  const editor = useEditor();
  if (!editor) return null;
  return (
    <div
      data-editor-ui
      className="group/insert relative z-20 h-0"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-x-0 -top-3 flex h-6 items-center justify-center opacity-0 transition-opacity group-hover/insert:opacity-100 focus-within:opacity-100">
        <div className="absolute inset-x-6 top-1/2 h-px bg-primary/50" />
        <button
          type="button"
          data-editor-ui
          onClick={() => editor.openLibrary(page, index)}
          title="Add a section here"
          className="relative flex h-7 items-center gap-1 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground shadow-md transition-transform hover:scale-105"
        >
          <Plus className="h-3.5 w-3.5" /> Add section
        </button>
      </div>
    </div>
  );
}
