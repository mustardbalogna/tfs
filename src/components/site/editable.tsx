import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Eye,
  EyeOff,
  Plus,
  Settings2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAtPath, type PageKey } from "@/lib/siteContent";
import { useEditor, useSiteContent } from "./content-context";
import { getIcon, ICON_NAMES } from "./icons";

// ---------------------------------------------------------------------------
// EditableText — renders plain text on the public site; inside the admin
// editor it becomes a click-to-edit contentEditable that keeps the exact same
// tag/classes so the preview is a true mirror of the live page.
// ---------------------------------------------------------------------------

interface EditableTextProps {
  path: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  style?: CSSProperties;
}

export function EditableText({
  path,
  as = "span",
  className,
  multiline = false,
  placeholder = "Click to edit",
  style,
}: EditableTextProps) {
  const content = useSiteContent();
  const editor = useEditor();
  const raw = getAtPath(content, path);
  const value = typeof raw === "string" ? raw : "";
  const classes = cn(multiline && "whitespace-pre-line", className);

  if (!editor) {
    if (!value) return null;
    return createElement(as, { className: classes, style }, value);
  }
  return (
    <EditableTextField
      as={as}
      className={classes}
      style={style}
      value={value}
      multiline={multiline}
      placeholder={placeholder}
      onChange={(next) => editor.update(path, next)}
    />
  );
}

function EditableTextField({
  as,
  className,
  style,
  value,
  multiline,
  placeholder,
  onChange,
}: {
  as: ElementType;
  className?: string;
  style?: CSSProperties;
  value: string;
  multiline: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const editingRef = useRef(false);

  // Only push external value changes into the DOM while not focused so the
  // caret never jumps mid-typing (undo/redo, discard, etc. still sync).
  useEffect(() => {
    const el = ref.current;
    if (!el || editingRef.current) return;
    if (readText(el) !== value) el.textContent = value;
  }, [value]);

  function readText(el: HTMLElement): string {
    // innerText turns <br>/<div> line breaks into "\n"; strip the trailing one
    // browsers add after a final <br>.
    return el.innerText.replace(/\n$/, "");
  }

  return createElement(as, {
    ref,
    className: cn("tfs-editable", className),
    style,
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: true,
    "data-editable": "",
    "data-placeholder": placeholder,
    role: "textbox",
    "aria-multiline": multiline,
    onFocus: () => {
      editingRef.current = true;
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      editingRef.current = false;
      const next = readText(e.currentTarget);
      if (next !== value) onChange(next);
      // Normalise any <div>/<br> soup the browser left behind.
      e.currentTarget.textContent = next;
    },
    onInput: (e: React.FormEvent<HTMLElement>) => {
      onChange(readText(e.currentTarget));
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.currentTarget.blur();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (!multiline) {
          e.currentTarget.blur();
          return;
        }
        e.currentTarget.ownerDocument.execCommand("insertLineBreak");
      }
    },
    onPaste: (e: React.ClipboardEvent<HTMLElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      const clean = multiline ? text : text.replace(/\s*\n\s*/g, " ");
      e.currentTarget.ownerDocument.execCommand("insertText", false, clean);
    },
  });
}

// ---------------------------------------------------------------------------
// Section — a page section that can be reordered / hidden from the editor.
// ---------------------------------------------------------------------------

interface SectionProps {
  page: PageKey;
  id: string;
  label: string;
  className?: string;
  children: ReactNode;
}

export function Section({ page, id, label, className, children }: SectionProps) {
  const content = useSiteContent();
  const editor = useEditor();
  const sections = content[page].sections as { id: string; visible: boolean }[];
  const index = sections.findIndex((s) => s.id === id);
  const config = sections[index];
  const visible = config?.visible ?? true;

  if (!editor) {
    if (!visible) return null;
    return <section className={className}>{children}</section>;
  }

  const key = `${page}:${id}`;
  const selected = editor.selectedSection === key;

  return (
    <section
      data-section={key}
      className={cn("tfs-section group/section relative", className, selected && "tfs-selected")}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-editor-ui]")) return;
        editor.selectSection(key);
      }}
    >
      {!visible && (
        <div className="tfs-hidden-overlay pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-14">
          <span className="rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-background shadow">
            Hidden on the live site
          </span>
        </div>
      )}
      <div
        data-editor-ui
        className={cn(
          "tfs-section-toolbar absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-lg border border-border bg-card/95 p-1 text-foreground shadow-md backdrop-blur transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover/section:opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="px-2 text-xs font-medium">{label}</span>
        <ToolbarButton
          title="Move up"
          disabled={index <= 0}
          onClick={() => editor.moveSection(page, id, -1)}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Move down"
          disabled={index >= sections.length - 1}
          onClick={() => editor.moveSection(page, id, 1)}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title={visible ? "Hide section" : "Show section"}
          onClick={() => editor.toggleSection(page, id)}
        >
          {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </ToolbarButton>
        <ToolbarButton
          title="Section settings"
          onClick={() => editor.selectSection(key, { openPanel: true })}
        >
          <Settings2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <div className={cn(!visible && "opacity-40 grayscale")}>{children}</div>
    </section>
  );
}

function ToolbarButton({
  title,
  disabled,
  onClick,
  children,
  className,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-editor-ui
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Lists — remove / reorder / add items directly in the preview.
// ---------------------------------------------------------------------------

interface ListItemProps {
  /** Path to the array, e.g. "home.categories.items" */
  listPath: string;
  index: number;
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Layout of the move buttons: horizontal for grids, vertical for stacked lists */
  direction?: "row" | "column";
}

export function ListItem({
  listPath,
  index,
  as = "div",
  className,
  children,
  direction = "row",
}: ListItemProps) {
  const content = useSiteContent();
  const editor = useEditor();
  const list = getAtPath(content, listPath);
  const count = Array.isArray(list) ? list.length : 0;

  if (!editor) return createElement(as, { className }, children);

  function move(dir: -1 | 1) {
    if (!Array.isArray(list)) return;
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = list.slice();
    [next[index], next[target]] = [next[target], next[index]];
    editor!.update(listPath, next);
  }
  function remove() {
    if (!Array.isArray(list)) return;
    editor!.update(
      listPath,
      list.filter((_, i) => i !== index),
    );
  }

  const Prev = direction === "row" ? ArrowLeft : ArrowUp;
  const Next = direction === "row" ? ArrowRight : ArrowDown;

  return createElement(
    as,
    { className: cn("tfs-list-item group/item relative", className) },
    children,
    <div
      data-editor-ui
      className="absolute -right-2 -top-2 z-10 flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5 opacity-0 shadow-sm transition-opacity group-hover/item:opacity-100 focus-within:opacity-100"
      onClick={(e) => e.stopPropagation()}
    >
      <ToolbarButton
        title="Move earlier"
        disabled={index === 0}
        onClick={() => move(-1)}
        className="h-6 w-6"
      >
        <Prev className="h-3 w-3" />
      </ToolbarButton>
      <ToolbarButton
        title="Move later"
        disabled={index >= count - 1}
        onClick={() => move(1)}
        className="h-6 w-6"
      >
        <Next className="h-3 w-3" />
      </ToolbarButton>
      <ToolbarButton
        title="Remove item"
        onClick={remove}
        className="h-6 w-6 text-destructive hover:bg-destructive/10"
      >
        <X className="h-3 w-3" />
      </ToolbarButton>
    </div>,
  );
}

interface AddItemProps {
  listPath: string;
  template: unknown;
  label?: string;
  className?: string;
  max?: number;
}

export function AddItem({
  listPath,
  template,
  label = "Add item",
  className,
  max = 40,
}: AddItemProps) {
  const content = useSiteContent();
  const editor = useEditor();
  if (!editor) return null;
  const list = getAtPath(content, listPath);
  const items = Array.isArray(list) ? list : [];
  if (items.length >= max) return null;
  return (
    <button
      type="button"
      data-editor-ui
      onClick={(e) => {
        e.stopPropagation();
        editor.update(listPath, [...items, structuredClone(template)]);
      }}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10",
        className,
      )}
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// EditableIcon — click to swap the lucide icon shown on a card.
// ---------------------------------------------------------------------------

export function EditableIcon({
  itemPath,
  name,
  className,
  iconClassName,
}: {
  /** Path to the item object, e.g. "home.categories.items.0" */
  itemPath: string;
  name: string;
  className?: string;
  iconClassName?: string;
}) {
  const editor = useEditor();
  const Icon = getIcon(name);
  const open = editor?.iconPickerPath === itemPath;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // The panel is portalled to the (preview) document body so it escapes card
  // hover transforms / sticky headers that would otherwise clip or cover it.
  useEffect(() => {
    if (!open || !editor) return;
    const el = buttonRef.current;
    if (!el) return;
    const doc = el.ownerDocument;
    const win = doc.defaultView ?? window;
    const rect = el.getBoundingClientRect();
    const panelWidth = 232;
    setPos({
      top: rect.bottom + win.scrollY + 8,
      left: Math.max(
        8,
        Math.min(rect.left + win.scrollX, doc.documentElement.clientWidth - panelWidth),
      ),
    });
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !el!.contains(t)) editor!.setIconPickerPath(null);
    }
    doc.addEventListener("mousedown", onDown);
    return () => doc.removeEventListener("mousedown", onDown);
  }, [open, editor]);

  if (!editor) {
    return (
      <div className={className}>
        <Icon className={iconClassName} />
      </div>
    );
  }

  const portalTarget = buttonRef.current?.ownerDocument.body;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-editor-ui
        title="Change icon"
        onClick={(e) => {
          e.stopPropagation();
          editor.setIconPickerPath(open ? null : itemPath);
        }}
        className={cn(
          className,
          "cursor-pointer ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-primary/60",
          open && "ring-2 ring-primary",
        )}
      >
        <Icon className={iconClassName} />
      </button>
      {open &&
        pos &&
        portalTarget &&
        createPortal(
          <div
            ref={panelRef}
            data-editor-ui
            onClick={(e) => e.stopPropagation()}
            style={{ top: pos.top, left: pos.left }}
            className="absolute z-[100] grid w-56 grid-cols-6 gap-1 rounded-lg border border-border bg-card p-2 shadow-xl"
          >
            {ICON_NAMES.map((n) => {
              const I = getIcon(n);
              return (
                <button
                  key={n}
                  type="button"
                  title={n}
                  onClick={() => {
                    editor.update(`${itemPath}.icon`, n);
                    editor.setIconPickerPath(null);
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                    n === name &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  )}
                >
                  <I className="h-4 w-4" />
                </button>
              );
            })}
          </div>,
          portalTarget,
        )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared layout helpers
// ---------------------------------------------------------------------------
