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
  Copy,
  Eye,
  EyeOff,
  GripHorizontal,
  GripVertical,
  ImagePlus,
  Plus,
  Replace,
  Settings2,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAtPath, type Block, type ImageRef, type PageKey } from "@/lib/siteContent";
import Lightbox from "@/components/Lightbox";
import { useEditor, useSiteContent } from "./content-context";
import { getIcon, ICON_NAMES } from "./icons";

// ---------------------------------------------------------------------------
// EditableText — plain text on the public site; click-to-edit in the editor,
// keeping the exact same tag/classes so the preview mirrors the live page.
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
// BlockSection — wraps every block. Public: a plain <section>. Editor: adds
// selection outline, drag handle, hide/duplicate/delete and a settings button.
// ---------------------------------------------------------------------------

interface BlockSectionProps {
  page: PageKey;
  block: Block;
  label: string;
  className?: string;
  children: ReactNode;
}

export function BlockSection({ page, block, label, className, children }: BlockSectionProps) {
  const editor = useEditor();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  if (!editor) {
    if (!block.visible) return null;
    return <section className={className}>{children}</section>;
  }

  const selected = editor.selectedBlock === block.id;

  return (
    <section
      data-block={block.id}
      data-sortable-item
      className={cn("tfs-section group/section relative", className, selected && "tfs-selected")}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-editor-ui]")) return;
        editor.selectBlock(block.id);
      }}
    >
      {!block.visible && (
        <div className="tfs-hidden-overlay pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-14">
          <span className="rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-background shadow">
            Hidden on the live site
          </span>
        </div>
      )}
      <div
        data-editor-ui
        className={cn(
          "absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-lg border border-border bg-card/95 p-1 text-foreground shadow-md backdrop-blur transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover/section:opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          data-editor-ui
          data-drag-handle
          title="Drag to reorder"
          aria-label="Drag to reorder section"
          className="flex h-7 cursor-grab items-center gap-1.5 rounded-md px-2 text-xs font-medium hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
        </button>
        <ToolbarButton
          title={block.visible ? "Hide section" : "Show section"}
          onClick={() => editor.toggleBlock(page, block.id)}
        >
          {block.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </ToolbarButton>
        <ToolbarButton
          title="Duplicate section"
          onClick={() => editor.duplicateBlock(page, block.id)}
        >
          <Copy className="h-3.5 w-3.5" />
        </ToolbarButton>
        {confirmDelete ? (
          <button
            type="button"
            data-editor-ui
            onClick={() => editor.removeBlock(page, block.id)}
            className="h-7 rounded-md bg-destructive px-2 text-xs font-medium text-destructive-foreground"
          >
            Delete?
          </button>
        ) : (
          <ToolbarButton
            title="Delete section"
            onClick={() => setConfirmDelete(true)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </ToolbarButton>
        )}
        <ToolbarButton
          title="Section settings"
          onClick={() => editor.selectBlock(block.id, { openPanel: true })}
        >
          <Settings2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <div className={cn(!block.visible && "opacity-40 grayscale")}>{children}</div>
    </section>
  );
}

export function ToolbarButton({
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
// Lists — drag to reorder, remove, add.
// ---------------------------------------------------------------------------

interface SortableListProps {
  listPath: string;
  axis?: "y" | "xy";
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/** Container for ListItems; carries the data attributes the drag manager needs. */
export function SortableList({
  listPath,
  axis = "xy",
  as = "div",
  className,
  children,
}: SortableListProps) {
  const editor = useEditor();
  return createElement(
    as,
    editor ? { className, "data-sortable": listPath, "data-sortable-axis": axis } : { className },
    children,
  );
}

interface ListItemProps {
  listPath: string;
  index: number;
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Where the hover controls sit; "inside" keeps them within the item bounds (for pills/rows). */
  controls?: "corner" | "inside";
}

export function ListItem({
  listPath,
  index,
  as = "div",
  className,
  children,
  controls = "corner",
}: ListItemProps) {
  const content = useSiteContent();
  const editor = useEditor();

  if (!editor) return createElement(as, { className }, children);

  function remove() {
    const list = getAtPath(content, listPath);
    if (!Array.isArray(list)) return;
    editor!.update(
      listPath,
      list.filter((_, i) => i !== index),
    );
  }

  return createElement(
    as,
    { className: cn("tfs-list-item group/item relative", className), "data-sortable-item": "" },
    children,
    <div
      data-editor-ui
      className={cn(
        "absolute z-10 flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5 opacity-0 shadow-sm transition-opacity group-hover/item:opacity-100 focus-within:opacity-100",
        controls === "corner" ? "-right-2 -top-2" : "right-1 top-1/2 -translate-y-1/2",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        data-editor-ui
        data-drag-handle
        title="Drag to reorder"
        aria-label="Drag to reorder"
        className="flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
      >
        <GripHorizontal className="h-3 w-3" />
      </button>
      <ToolbarButton
        title="Remove"
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
// EditableImage — shows an uploaded image (click to enlarge on the live site);
// in the editor offers add / replace / remove via the media library.
// ---------------------------------------------------------------------------

interface EditableImageProps {
  /** Path to the ImageRef | null value */
  path: string;
  image: ImageRef | null;
  className?: string;
  imgClassName?: string;
  /** Visitors can click to open a lightbox */
  zoomable?: boolean;
  /** Called instead of the built-in lightbox (galleries share one) */
  onZoom?: () => void;
  /** Rendered when there is no image on the public site (e.g. a fallback asset) */
  fallback?: ReactNode;
  /** Hide the "Add image" placeholder in the editor when empty */
  optional?: boolean;
  placeholderLabel?: string;
}

export function EditableImage({
  path,
  image,
  className,
  imgClassName,
  zoomable = true,
  onZoom,
  fallback = null,
  optional = false,
  placeholderLabel = "Add image",
}: EditableImageProps) {
  const editor = useEditor();
  const [open, setOpen] = useState(false);

  if (!editor) {
    if (!image) return <>{fallback}</>;
    const img = (
      <img
        src={image.url}
        alt={image.alt}
        loading="lazy"
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    );
    if (!zoomable && !onZoom) return <div className={className}>{img}</div>;
    return (
      <>
        <button
          type="button"
          onClick={() => (onZoom ? onZoom() : setOpen(true))}
          className={cn("group/img relative block cursor-zoom-in overflow-hidden", className)}
          aria-label={image.alt ? `Enlarge image: ${image.alt}` : "Enlarge image"}
        >
          {img}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/img:bg-black/20">
            <ZoomIn className="h-6 w-6 text-white opacity-0 drop-shadow transition-opacity group-hover/img:opacity-100" />
          </span>
        </button>
        {open && (
          <Lightbox
            images={[{ id: path, url: image.url }]}
            index={0}
            onIndexChange={() => {}}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  }

  if (!image) {
    if (optional && fallback) {
      return (
        <div className={cn("group/img relative", className)}>
          {fallback}
          <ImageOverlayButton path={path} label={placeholderLabel} />
        </div>
      );
    }
    return (
      <button
        type="button"
        data-editor-ui
        onClick={(e) => {
          e.stopPropagation();
          editor.pickImage(path);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-primary/40 bg-primary/5 text-xs font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10",
          className,
        )}
      >
        <ImagePlus className="h-5 w-5" />
        {placeholderLabel}
      </button>
    );
  }

  return (
    <div className={cn("group/img relative overflow-hidden", className)}>
      <img
        src={image.url}
        alt={image.alt}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
      <div
        data-editor-ui
        className="absolute inset-x-2 bottom-2 z-10 flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover/img:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => editor.pickImage(path)}
          className="flex items-center gap-1 rounded-md bg-card/95 px-2 py-1 text-xs font-medium text-foreground shadow hover:bg-card"
        >
          <Replace className="h-3 w-3" /> Replace
        </button>
        <button
          type="button"
          onClick={() => editor.update(path, null)}
          className="flex items-center gap-1 rounded-md bg-card/95 px-2 py-1 text-xs font-medium text-destructive shadow hover:bg-card"
        >
          <X className="h-3 w-3" /> Remove
        </button>
      </div>
    </div>
  );
}

function ImageOverlayButton({ path, label }: { path: string; label: string }) {
  const editor = useEditor();
  if (!editor) return null;
  return (
    <button
      type="button"
      data-editor-ui
      onClick={(e) => {
        e.stopPropagation();
        editor.pickImage(path);
      }}
      className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-md bg-card/95 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md hover:bg-card"
    >
      <ImagePlus className="h-3.5 w-3.5" /> {label}
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
  /** Path to the item object, e.g. "pages.home.1.props.items.0" */
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

  // Portalled to the preview body so it escapes card transforms / sticky headers.
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
