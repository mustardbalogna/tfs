import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAtPath, INTERNAL_ROUTES, type PageKey, type SiteContent } from "@/lib/siteContent";
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

// ---------------------------------------------------------------------------
// Control definitions — what the side panel offers for each section. Text is
// edited inline in the preview, so this only covers structure/layout choices.
// ---------------------------------------------------------------------------

type Option = { value: string | number; label: string };

type Control =
  | { type: "choice"; label: string; path: string; options: Option[]; hint?: string }
  | { type: "select"; label: string; path: string; options: Option[]; hint?: string };

const ALIGN: Option[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Centre" },
];
const TONE: Option[] = [
  { value: "plain", label: "Plain" },
  { value: "card", label: "White" },
  { value: "tinted", label: "Tan" },
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

const SECTION_LABELS: Record<string, string> = {
  "home:hero": "Hero",
  "home:categories": "Categories preview",
  "home:about": "About preview",
  "home:areas": "Areas we service",
  "home:cta": "Call to action",
  "about:intro": "Intro",
  "about:values": "Highlights",
  "services:intro": "Intro",
  "services:grid": "Service cards",
  "categories:intro": "Intro",
  "categories:grid": "Category gallery",
  "contact:intro": "Intro",
  "contact:main": "Form & details",
};

const SECTION_CONTROLS: Record<string, Control[]> = {
  "home:hero": [
    {
      type: "choice",
      label: "Image overlay",
      path: "home.hero.overlay",
      options: [
        { value: "light", label: "Light" },
        { value: "medium", label: "Medium" },
        { value: "dark", label: "Dark" },
      ],
      hint: "Darker overlays make the text easier to read over the photo.",
    },
    {
      type: "select",
      label: "Primary button links to",
      path: "home.hero.primaryCta.to",
      options: ROUTES,
    },
    {
      type: "select",
      label: "Secondary button links to",
      path: "home.hero.secondaryCta.to",
      options: ROUTES,
    },
  ],
  "home:categories": [
    { type: "choice", label: "Cards per row", path: "home.categories.columns", options: COLUMNS },
    { type: "choice", label: "Heading alignment", path: "home.categories.align", options: ALIGN },
    { type: "choice", label: "Background", path: "home.categories.tone", options: TONE },
  ],
  "home:about": [
    { type: "choice", label: "Services box position", path: "home.about.boxSide", options: SIDE },
    { type: "choice", label: "Background", path: "home.about.tone", options: TONE },
  ],
  "home:areas": [
    { type: "choice", label: "Alignment", path: "home.areas.align", options: ALIGN },
    { type: "choice", label: "Background", path: "home.areas.tone", options: TONE },
  ],
  "home:cta": [
    { type: "select", label: "Button links to", path: "home.cta.button.to", options: ROUTES },
  ],
  "about:intro": [
    { type: "choice", label: "Alignment", path: "about.intro.align", options: ALIGN },
  ],
  "about:values": [
    { type: "choice", label: "Cards per row", path: "about.values.columns", options: COLUMNS },
  ],
  "services:intro": [
    { type: "choice", label: "Alignment", path: "services.intro.align", options: ALIGN },
  ],
  "services:grid": [
    { type: "choice", label: "Cards per row", path: "services.grid.columns", options: COLUMNS },
  ],
  "categories:intro": [
    { type: "choice", label: "Alignment", path: "categories.intro.align", options: ALIGN },
  ],
  "categories:grid": [
    {
      type: "choice",
      label: "Cards per row",
      path: "categories.grid.columns",
      options: COLUMNS.filter((c) => c.value !== 4),
    },
  ],
  "contact:intro": [],
  "contact:main": [
    { type: "choice", label: "Details column", path: "contact.main.infoSide", options: SIDE },
  ],
};

const GLOBAL_CONTROLS: Control[] = [
  { type: "select", label: "Header button links to", path: "brand.navCta.to", options: ROUTES },
];

// ---------------------------------------------------------------------------

interface InspectorProps {
  page: PageKey;
  content: SiteContent;
  selected: string | null;
  onSelect: (key: string | null) => void;
  onUpdate: (path: string, value: unknown) => void;
  onMoveSection: (page: PageKey, id: string, dir: -1 | 1) => void;
  onToggleSection: (page: PageKey, id: string) => void;
  onResetPage: (page: PageKey) => void;
  onClose?: () => void;
}

export default function Inspector({
  page,
  content,
  selected,
  onSelect,
  onUpdate,
  onMoveSection,
  onToggleSection,
  onResetPage,
  onClose,
}: InspectorProps) {
  const sections = content[page].sections as { id: string; visible: boolean }[];
  const selectedOnPage = selected?.startsWith(`${page}:`) ? selected : null;
  const controls = selectedOnPage ? (SECTION_CONTROLS[selectedOnPage] ?? []) : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-sm font-semibold text-foreground">
          {selectedOnPage ? (SECTION_LABELS[selectedOnPage] ?? "Section") : "Page layout"}
        </span>
        <div className="flex items-center gap-1">
          {selectedOnPage && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Back
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
        {selectedOnPage && controls ? (
          <>
            {controls.length === 0 && (
              <p className="text-sm text-muted-foreground">
                This section has no layout options. Click any text in the preview to edit it.
              </p>
            )}
            {controls.map((c) => (
              <ControlField key={c.path} control={c} content={content} onUpdate={onUpdate} />
            ))}
            <SectionVisibility
              page={page}
              id={selectedOnPage.split(":")[1]}
              sections={sections}
              onToggle={onToggleSection}
            />
          </>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sections
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Reorder or hide sections. Hidden sections stay editable here but won&apos;t appear
                on the live site.
              </p>
              <ul className="mt-3 space-y-1.5">
                {sections.map((s, i) => {
                  const key = `${page}:${s.id}`;
                  return (
                    <li
                      key={s.id}
                      className={cn(
                        "flex items-center gap-1 rounded-lg border border-border bg-background p-1.5",
                        !s.visible && "opacity-60",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(key)}
                        className="min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-sm text-foreground hover:bg-muted"
                      >
                        {SECTION_LABELS[key] ?? s.id}
                      </button>
                      <IconBtn
                        title="Move up"
                        disabled={i === 0}
                        onClick={() => onMoveSection(page, s.id, -1)}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn
                        title="Move down"
                        disabled={i === sections.length - 1}
                        onClick={() => onMoveSection(page, s.id, 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn
                        title={s.visible ? "Hide" : "Show"}
                        onClick={() => onToggleSection(page, s.id)}
                      >
                        {s.visible ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </IconBtn>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Header &amp; footer
              </p>
              <div className="mt-3 space-y-4">
                {GLOBAL_CONTROLS.map((c) => (
                  <ControlField key={c.path} control={c} content={content} onUpdate={onUpdate} />
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">Tips</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>Click any text in the preview to edit it. Press Enter to finish.</li>
                <li>Hover a card or list item for move and remove buttons.</li>
                <li>Click a card&apos;s icon to swap it.</li>
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

function SectionVisibility({
  page,
  id,
  sections,
  onToggle,
}: {
  page: PageKey;
  id: string;
  sections: { id: string; visible: boolean }[];
  onToggle: (page: PageKey, id: string) => void;
}) {
  const visible = sections.find((s) => s.id === id)?.visible ?? true;
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <p className="text-sm font-medium text-foreground">Show on live site</p>
        <p className="text-xs text-muted-foreground">
          {visible ? "Visitors can see this section." : "Hidden from visitors."}
        </p>
      </div>
      <Button
        size="sm"
        variant={visible ? "outline" : "default"}
        onClick={() => onToggle(page, id)}
      >
        {visible ? "Hide" : "Show"}
      </Button>
    </div>
  );
}

function ControlField({
  control,
  content,
  onUpdate,
}: {
  control: Control;
  content: SiteContent;
  onUpdate: (path: string, value: unknown) => void;
}) {
  const value = getAtPath(content, control.path) as string | number | undefined;
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{control.label}</label>
      {control.type === "choice" ? (
        <div className="mt-1.5 grid auto-cols-fr grid-flow-col rounded-md border border-border bg-background p-0.5">
          {control.options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onUpdate(control.path, o.value)}
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
      ) : (
        <select
          value={String(value ?? "")}
          onChange={(e) => onUpdate(control.path, e.target.value)}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {control.options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      )}
      {control.hint && <p className="mt-1 text-xs text-muted-foreground">{control.hint}</p>}
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
            All text, layout and section settings on this page will return to the original defaults.
            Nothing is published until you press Save, so you can still discard this.
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
