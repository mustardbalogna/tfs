import {
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BLOCK_LIBRARY,
  getAtPath,
  INTERNAL_ROUTES,
  type Block,
  type BlockType,
  type ImageRef,
  type PageKey,
  type SiteContent,
} from "@/lib/siteContent";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BLOCK_GLYPHS } from "./BlockLibrary";

// ---------------------------------------------------------------------------
// Control definitions — layout/structure choices per block type. Text and
// list items are edited inline in the preview, so they don't appear here.
// Paths are relative to the block's `props`.
// ---------------------------------------------------------------------------

type Option = { value: string | number; label: string };

type Control =
  | {
      type: "choice";
      label: string;
      path: string;
      options: Option[];
      hint?: string;
      when?: (props: Record<string, unknown>) => boolean;
    }
  | {
      type: "select";
      label: string;
      path: string;
      options: Option[];
      hint?: string;
      when?: (props: Record<string, unknown>) => boolean;
    }
  | {
      type: "image";
      label: string;
      path: string;
      hint?: string;
      when?: (props: Record<string, unknown>) => boolean;
    };

const ALIGN: Option[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Centre" },
];
const TONE: Option[] = [
  { value: "plain", label: "Plain" },
  { value: "card", label: "White" },
  { value: "tinted", label: "Tan" },
  { value: "dark", label: "Dark" },
];
const COLUMNS: Option[] = [
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];
const SIDE: Option[] = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];
const ROUTES: Option[] = INTERNAL_ROUTES.map((r) => ({ value: r.value, label: r.label }));

const CONTROLS: Record<BlockType, Control[]> = {
  hero: [
    {
      type: "image",
      label: "Background photo",
      path: "image",
      hint: "Leave empty to use the default workshop photo.",
    },
    {
      type: "choice",
      label: "Photo overlay",
      path: "overlay",
      options: [
        { value: "light", label: "Light" },
        { value: "medium", label: "Medium" },
        { value: "dark", label: "Dark" },
      ],
    },
    { type: "choice", label: "Text alignment", path: "align", options: ALIGN },
    {
      type: "choice",
      label: "Height",
      path: "height",
      options: [
        { value: "compact", label: "Compact" },
        { value: "regular", label: "Regular" },
        { value: "tall", label: "Tall" },
      ],
    },
    { type: "select", label: "Primary button links to", path: "primaryCta.to", options: ROUTES },
    {
      type: "select",
      label: "Secondary button links to",
      path: "secondaryCta.to",
      options: ROUTES,
    },
  ],
  intro: [
    { type: "choice", label: "Alignment", path: "align", options: ALIGN },
    {
      type: "choice",
      label: "Heading size",
      path: "level",
      options: [
        { value: "h1", label: "Page title" },
        { value: "h2", label: "Section" },
      ],
    },
  ],
  cards: [
    {
      type: "choice",
      label: "Card style",
      path: "style",
      options: [
        { value: "icon", label: "Icon" },
        { value: "image", label: "Photo" },
      ],
      hint: "Photo cards show an image on top; click a card's photo area to add one.",
    },
    { type: "choice", label: "Cards per row", path: "columns", options: COLUMNS },
    { type: "choice", label: "Heading alignment", path: "align", options: ALIGN },
    { type: "choice", label: "Background", path: "tone", options: TONE },
    { type: "select", label: "Link below cards goes to", path: "cta.to", options: ROUTES },
  ],
  textImage: [
    {
      type: "choice",
      label: "Beside the text",
      path: "aside",
      options: [
        { value: "image", label: "Photo" },
        { value: "list", label: "Bullet list" },
      ],
    },
    { type: "image", label: "Photo", path: "image", when: (p) => p.aside === "image" },
    { type: "choice", label: "Position", path: "asideSide", options: SIDE },
    { type: "choice", label: "Background", path: "tone", options: TONE },
    { type: "select", label: "Button links to", path: "cta.to", options: ROUTES },
  ],
  tags: [
    { type: "choice", label: "Alignment", path: "align", options: ALIGN },
    { type: "choice", label: "Background", path: "tone", options: TONE },
    { type: "select", label: "Link goes to", path: "cta.to", options: ROUTES },
  ],
  gallery: [
    { type: "choice", label: "Photos per row", path: "columns", options: COLUMNS },
    { type: "choice", label: "Background", path: "tone", options: TONE },
  ],
  stats: [{ type: "choice", label: "Background", path: "tone", options: TONE }],
  testimonials: [
    {
      type: "choice",
      label: "Per row",
      path: "columns",
      options: COLUMNS.filter((c) => c.value !== 4),
    },
    { type: "choice", label: "Background", path: "tone", options: TONE },
  ],
  faq: [{ type: "choice", label: "Background", path: "tone", options: TONE }],
  cta: [
    {
      type: "image",
      label: "Background photo",
      path: "image",
      hint: "Optional — shown behind the green banner.",
    },
    { type: "select", label: "Button links to", path: "button.to", options: ROUTES },
  ],
  categoriesGrid: [
    {
      type: "choice",
      label: "Cards per row",
      path: "columns",
      options: COLUMNS.filter((c) => c.value !== 4),
    },
  ],
  contact: [{ type: "choice", label: "Details column", path: "infoSide", options: SIDE }],
};

const GLOBAL_CONTROLS: Control[] = [
  { type: "select", label: "Header button links to", path: "brand.navCta.to", options: ROUTES },
];

export function blockTitle(block: Block): string {
  const p = block.props as unknown as Record<string, unknown>;
  const text = [p.heading, p.formHeading, p.listHeading].find(
    (v) => typeof v === "string" && v.trim(),
  ) as string | undefined;
  return text ? text.replace(/\s+/g, " ").slice(0, 40) : BLOCK_LIBRARY[block.type].label;
}

// ---------------------------------------------------------------------------

interface InspectorProps {
  page: PageKey;
  content: SiteContent;
  selectedBlock: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (path: string, value: unknown) => void;
  onToggle: (page: PageKey, id: string) => void;
  onRemove: (page: PageKey, id: string) => void;
  onDuplicate: (page: PageKey, id: string) => void;
  onAddSection: (page: PageKey, index: number) => void;
  onPickImage: (path: string) => void;
  onResetPage: (page: PageKey) => void;
  onClose?: () => void;
}

export default function Inspector({
  page,
  content,
  selectedBlock,
  onSelect,
  onUpdate,
  onToggle,
  onRemove,
  onDuplicate,
  onAddSection,
  onPickImage,
  onResetPage,
  onClose,
}: InspectorProps) {
  const blocks = content.pages[page];
  const index = blocks.findIndex((b) => b.id === selectedBlock);
  const block = index >= 0 ? blocks[index] : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="truncate text-sm font-semibold text-foreground">
          {block ? BLOCK_LIBRARY[block.type].label : "Page layout"}
        </span>
        <div className="flex items-center gap-1">
          {block && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              All sections
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {block ? (
          <BlockPanel
            page={page}
            block={block}
            base={`pages.${page}.${index}.props`}
            onUpdate={onUpdate}
            onToggle={onToggle}
            onRemove={onRemove}
            onDuplicate={onDuplicate}
            onPickImage={onPickImage}
          />
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sections
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag to reorder. Hidden sections stay editable but won&apos;t appear on the live
                site.
              </p>
              <ul
                data-sortable={`pages.${page}`}
                data-sortable-axis="y"
                className="mt-3 space-y-1.5"
              >
                {blocks.map((b) => {
                  const Glyph = BLOCK_GLYPHS[b.type];
                  return (
                    <li
                      key={b.id}
                      data-sortable-item
                      className={cn(
                        "flex items-center gap-1 rounded-lg border border-border bg-background p-1.5",
                        !b.visible && "opacity-60",
                      )}
                    >
                      <button
                        type="button"
                        data-drag-handle
                        title="Drag to reorder"
                        aria-label="Drag to reorder"
                        className="flex h-7 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelect(b.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-foreground hover:bg-muted"
                      >
                        <Glyph className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{blockTitle(b)}</span>
                      </button>
                      <IconBtn
                        title={b.visible ? "Hide" : "Show"}
                        onClick={() => onToggle(page, b.id)}
                      >
                        {b.visible ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </IconBtn>
                    </li>
                  );
                })}
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => onAddSection(page, blocks.length)}
              >
                <Plus className="h-3.5 w-3.5" /> Add section
              </Button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Header &amp; footer
              </p>
              <div className="mt-3 space-y-4">
                {GLOBAL_CONTROLS.map((c) => (
                  <ControlField
                    key={c.path}
                    control={c}
                    value={getAtPath(content, c.path)}
                    onChange={(v) => onUpdate(c.path, v)}
                    onPickImage={() => onPickImage(c.path)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">Tips</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>Click any text in the preview to edit it. Press Enter to finish.</li>
                <li>Hover a section for its toolbar; drag the handle to move it.</li>
                <li>Hover cards and list items to drag, remove or swap their icon.</li>
                <li>Click a photo area to add or replace an image.</li>
                <li>Nothing goes live until you press Save.</li>
              </ul>
            </div>

            <ResetPageButton page={page} onReset={onResetPage} />
          </>
        )}
      </div>
    </div>
  );
}

function BlockPanel({
  page,
  block,
  base,
  onUpdate,
  onToggle,
  onRemove,
  onDuplicate,
  onPickImage,
}: {
  page: PageKey;
  block: Block;
  base: string;
  onUpdate: (path: string, value: unknown) => void;
  onToggle: (page: PageKey, id: string) => void;
  onRemove: (page: PageKey, id: string) => void;
  onDuplicate: (page: PageKey, id: string) => void;
  onPickImage: (path: string) => void;
}) {
  const props = block.props as unknown as Record<string, unknown>;
  const controls = CONTROLS[block.type].filter((c) => !c.when || c.when(props));
  return (
    <>
      <p className="text-xs text-muted-foreground">{BLOCK_LIBRARY[block.type].description}</p>
      {controls.length === 0 && (
        <p className="text-sm text-muted-foreground">
          This section has no layout options. Click its text in the preview to edit it.
        </p>
      )}
      {controls.map((c) => (
        <ControlField
          key={c.path}
          control={c}
          value={getAtPath(props, c.path)}
          onChange={(v) => onUpdate(`${base}.${c.path}`, v)}
          onPickImage={() => onPickImage(`${base}.${c.path}`)}
        />
      ))}

      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Show on live site</p>
            <p className="text-xs text-muted-foreground">
              {block.visible ? "Visitors can see this section." : "Hidden from visitors."}
            </p>
          </div>
          <Button
            size="sm"
            variant={block.visible ? "outline" : "default"}
            onClick={() => onToggle(page, block.id)}
          >
            {block.visible ? "Hide" : "Show"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onDuplicate(page, block.id)}>
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this section?</AlertDialogTitle>
                <AlertDialogDescription>
                  It will be removed from the page. You can undo this, and nothing is published
                  until you press Save.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRemove(page, block.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}

function ControlField({
  control,
  value,
  onChange,
  onPickImage,
}: {
  control: Control;
  value: unknown;
  onChange: (value: unknown) => void;
  onPickImage: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{control.label}</label>
      {control.type === "choice" && (
        <div className="mt-1.5 grid auto-cols-fr grid-flow-col rounded-md border border-border bg-background p-0.5">
          {control.options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded px-2 py-1.5 text-xs font-medium transition-colors",
                value === o.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      {control.type === "select" && (
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {control.options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      )}
      {control.type === "image" && (
        <ImageControl
          value={value as ImageRef | null}
          onPick={onPickImage}
          onClear={() => onChange(null)}
        />
      )}
      {control.hint && <p className="mt-1 text-xs text-muted-foreground">{control.hint}</p>}
    </div>
  );
}

function ImageControl({
  value,
  onPick,
  onClear,
}: {
  value: ImageRef | null;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-1.5 flex items-center gap-3 rounded-md border border-border p-2">
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-muted">
        {value ? (
          <img src={value.url} alt={value.alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Button type="button" size="sm" variant="outline" onClick={onPick}>
          {value ? "Replace" : "Choose photo"}
        </Button>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={onClear}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function ResetPageButton({ page, onReset }: { page: PageKey; onReset: (page: PageKey) => void }) {
  const label = page.charAt(0).toUpperCase() + page.slice(1);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset {label} page to defaults
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset the {label} page?</AlertDialogTitle>
          <AlertDialogDescription>
            All sections, text, photos and layout settings on this page will return to the original
            defaults. Nothing is published until you press Save, so you can still discard this.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onReset(page)}>Reset page</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
