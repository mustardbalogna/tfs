import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  Loader2,
  Monitor,
  PanelRight,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BLOCK_LIBRARY,
  createBlock,
  DEFAULT_SITE_CONTENT,
  fetchSiteContent,
  moveItem,
  newBlockId,
  PAGE_KEYS,
  PAGE_META,
  saveSiteContent,
  setAtPath,
  getAtPath,
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
import AdminShell from "@/components/admin/AdminShell";
import PreviewFrame from "@/components/admin/PreviewFrame";
import Inspector from "@/components/admin/Inspector";
import BlockLibrary from "@/components/admin/BlockLibrary";
import MediaPicker from "@/components/admin/MediaPicker";
import { EditableContentProvider, type EditorApi } from "@/components/site/content-context";
import PageBlocks from "@/components/site/PageBlocks";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { attachSortable } from "@/components/site/sortable";

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTHS: Record<Device, number | "100%"> = {
  desktop: "100%",
  tablet: 834,
  mobile: 390,
};

const HISTORY_LIMIT = 60;
const COALESCE_MS = 900;

function isPageKey(v: string | null): v is PageKey {
  return v !== null && (PAGE_KEYS as string[]).includes(v);
}

export default function AdminEditor() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const page: PageKey = isPageKey(params.get("page")) ? (params.get("page") as PageKey) : "home";

  const [saved, setSaved] = useState<SiteContent | null>(null);
  const [draft, setDraft] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loadError, setLoadError] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [selected, setSelected] = useState<string | null>(null);
  const [iconPickerPath, setIconPickerPath] = useState<string | null>(null);
  const [libraryTarget, setLibraryTarget] = useState<{ page: PageKey; index: number } | null>(null);
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Undo/redo -------------------------------------------------------------
  const pastRef = useRef<SiteContent[]>([]);
  const futureRef = useRef<SiteContent[]>([]);
  const lastEditRef = useRef<{ path: string; time: number } | null>(null);
  const previewDocRef = useRef<Document | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  const commit = useCallback((produce: (prev: SiteContent) => SiteContent, path?: string) => {
    setDraft((prev) => {
      const next = produce(prev);
      if (next === prev) return prev;
      const now = Date.now();
      const last = lastEditRef.current;
      // Rapid edits to the same field (typing) collapse into one undo step.
      const coalesce = path && last && last.path === path && now - last.time < COALESCE_MS;
      if (!coalesce) {
        pastRef.current.push(prev);
        if (pastRef.current.length > HISTORY_LIMIT) pastRef.current.shift();
      }
      futureRef.current = [];
      lastEditRef.current = path ? { path, time: now } : null;
      return next;
    });
    setHistoryVersion((v) => v + 1);
  }, []);

  const undo = useCallback(() => {
    setDraft((prev) => {
      const target = pastRef.current.pop();
      if (!target) return prev;
      futureRef.current.push(prev);
      lastEditRef.current = null;
      return target;
    });
    setHistoryVersion((v) => v + 1);
  }, []);

  const redo = useCallback(() => {
    setDraft((prev) => {
      const target = futureRef.current.pop();
      if (!target) return prev;
      pastRef.current.push(prev);
      lastEditRef.current = null;
      return target;
    });
    setHistoryVersion((v) => v + 1);
  }, []);

  // Loading ---------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    fetchSiteContent({ fresh: true })
      .then((c) => {
        if (cancelled) return;
        setSaved(c);
        setDraft(c);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load the current site content.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = useMemo(
    () => saved !== null && JSON.stringify(saved) !== JSON.stringify(draft),
    [saved, draft],
  );

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Actions ---------------------------------------------------------------
  const update = useCallback(
    (path: string, value: unknown) => commit((prev) => setAtPath(prev, path, value), path),
    [commit],
  );

  const reorder = useCallback(
    (listPath: string, from: number, to: number) =>
      commit((prev) => {
        const list = getAtPath(prev, listPath);
        if (!Array.isArray(list)) return prev;
        const next = moveItem(list, from, to);
        return next === list ? prev : setAtPath(prev, listPath, next);
      }),
    [commit],
  );

  const updateBlocks = useCallback(
    (pg: PageKey, fn: (blocks: Block[]) => Block[]) =>
      commit((prev) => {
        const next = fn(prev.pages[pg]);
        return next === prev.pages[pg] ? prev : { ...prev, pages: { ...prev.pages, [pg]: next } };
      }),
    [commit],
  );

  const toggleBlock = useCallback(
    (pg: PageKey, id: string) =>
      updateBlocks(pg, (blocks) =>
        blocks.map((b) => (b.id === id ? ({ ...b, visible: !b.visible } as Block) : b)),
      ),
    [updateBlocks],
  );

  const removeBlock = useCallback(
    (pg: PageKey, id: string) => {
      updateBlocks(pg, (blocks) => blocks.filter((b) => b.id !== id));
      setSelected((s) => (s === id ? null : s));
    },
    [updateBlocks],
  );

  const duplicateBlock = useCallback(
    (pg: PageKey, id: string) => {
      const copyId = newBlockId();
      updateBlocks(pg, (blocks) => {
        const i = blocks.findIndex((b) => b.id === id);
        if (i < 0) return blocks;
        const copy = { ...structuredClone(blocks[i]), id: copyId } as Block;
        return [...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)];
      });
      setSelected(copyId);
    },
    [updateBlocks],
  );

  const insertBlock = useCallback(
    (pg: PageKey, index: number, type: BlockType) => {
      const block = createBlock(type);
      updateBlocks(pg, (blocks) => [...blocks.slice(0, index), block, ...blocks.slice(index)]);
      setSelected(block.id);
      setLibraryTarget(null);
      // Bring the new section into view once it has rendered.
      setTimeout(() => {
        previewDocRef.current
          ?.querySelector(`[data-block="${block.id}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    },
    [updateBlocks],
  );

  const applyImage = useCallback(
    (image: ImageRef) => {
      if (mediaTarget) update(mediaTarget, image);
      setMediaTarget(null);
    },
    [mediaTarget, update],
  );

  const resetPage = useCallback(
    (pg: PageKey) => {
      commit((prev) => ({
        ...prev,
        pages: { ...prev.pages, [pg]: structuredClone(DEFAULT_SITE_CONTENT.pages[pg]) },
      }));
      setSelected(null);
    },
    [commit],
  );

  const discard = useCallback(() => {
    if (!saved) return;
    commit(() => saved);
    setSelected(null);
  }, [saved, commit]);

  const save = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const clean = await saveSiteContent(draft);
      setSaved(clean);
      setDraft(clean);
      setSavedAt(Date.now());
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        navigate("/admin/login");
        return;
      }
      setSaveError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }, [draft, saving, navigate]);

  const selectBlock = useCallback((id: string | null, options?: { openPanel?: boolean }) => {
    setSelected(id);
    setIconPickerPath(null);
    if (options?.openPanel) setPanelOpen(true);
  }, []);

  const openLibrary = useCallback((pg: PageKey, index: number) => {
    setLibraryTarget({ page: pg, index });
  }, []);

  const pickImage = useCallback((path: string) => setMediaTarget(path), []);

  // Drag & drop: one sorter for the admin chrome (inspector list) and one for
  // the preview document, both feeding the same reorder action.
  const reorderRef = useRef(reorder);
  reorderRef.current = reorder;
  useEffect(
    () => attachSortable(document, (path, from, to) => reorderRef.current(path, from, to)),
    [],
  );
  const detachPreviewSortable = useRef<(() => void) | null>(null);
  const handlePreviewDocument = useCallback((doc: Document | null) => {
    previewDocRef.current = doc;
    detachPreviewSortable.current?.();
    detachPreviewSortable.current = doc
      ? attachSortable(doc, (path, from, to) => reorderRef.current(path, from, to))
      : null;
  }, []);
  useEffect(() => () => detachPreviewSortable.current?.(), []);

  function changePage(next: PageKey) {
    setParams({ page: next }, { replace: true });
    setSelected(null);
    setIconPickerPath(null);
  }

  // Keyboard shortcuts (work both in the admin chrome and inside the preview
  // because portal events bubble through the React tree).
  function handleKeyDown(e: React.KeyboardEvent) {
    const meta = e.metaKey || e.ctrlKey;
    if (!meta) return;
    const target = e.target as HTMLElement;
    const inEditable = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
    if (e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (dirty) void save();
      return;
    }
    if (inEditable) return; // let the browser handle native text undo while typing
    if (e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }
  }

  // Keep the preview inert: links/buttons in the mirrored site must not
  // navigate away or submit, but editor controls (data-editor-ui) still work.
  function handleCanvasClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("[data-editor-ui]")) return;
    if (target.closest("a")) e.preventDefault();
    const button = target.closest("button");
    if (button && !target.closest("[data-editable]")) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const editorApi: EditorApi = useMemo(
    () => ({
      update,
      reorder,
      selectedBlock: selected,
      selectBlock,
      toggleBlock,
      removeBlock,
      duplicateBlock,
      openLibrary,
      pickImage,
      iconPickerPath,
      setIconPickerPath,
    }),
    [
      update,
      reorder,
      selected,
      selectBlock,
      toggleBlock,
      removeBlock,
      duplicateBlock,
      openLibrary,
      pickImage,
      iconPickerPath,
    ],
  );

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;
  void historyVersion; // read so the undo/redo button state re-renders

  const inspector = (
    <Inspector
      page={page}
      content={draft}
      selectedBlock={selected}
      onSelect={(id) => selectBlock(id)}
      onUpdate={update}
      onToggle={toggleBlock}
      onRemove={removeBlock}
      onDuplicate={duplicateBlock}
      onAddSection={openLibrary}
      onPickImage={pickImage}
      onResetPage={resetPage}
      onClose={() => setPanelOpen(false)}
    />
  );

  return (
    <AdminShell
      fullBleed
      title="Site editor"
      description="Click any text to edit it — what you see here is what visitors see."
      actions={
        <>
          <div className="hidden items-center gap-0.5 rounded-md border border-border bg-background p-0.5 sm:flex">
            <IconButton title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
              <Undo2 className="h-4 w-4" />
            </IconButton>
            <IconButton title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
              <Redo2 className="h-4 w-4" />
            </IconButton>
          </div>
          <span className="hidden text-xs text-muted-foreground md:inline">
            {saving ? "Saving…" : dirty ? "Unsaved changes" : savedAt ? "All changes saved" : ""}
          </span>
          {dirty && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={saving}>
                  Discard
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Everything you changed since the last save will be thrown away.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep editing</AlertDialogCancel>
                  <AlertDialogAction onClick={discard}>Discard</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button size="sm" onClick={save} disabled={!dirty || saving || !saved}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !dirty && savedAt ? (
              <Check className="h-4 w-4" />
            ) : null}
            {saving ? "Saving" : "Save & publish"}
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col" onKeyDownCapture={handleKeyDown}>
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-3 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {PAGE_KEYS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => changePage(p)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  p === page
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {PAGE_META[p].label}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-0.5 rounded-md border border-border bg-background p-0.5 md:flex">
            <IconButton
              title="Desktop"
              active={device === "desktop"}
              onClick={() => setDevice("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </IconButton>
            <IconButton
              title="Tablet"
              active={device === "tablet"}
              onClick={() => setDevice("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </IconButton>
            <IconButton
              title="Mobile"
              active={device === "mobile"}
              onClick={() => setDevice("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </IconButton>
          </div>
          <IconButton
            title="Layout panel"
            active={panelOpen}
            onClick={() => setPanelOpen((v) => !v)}
            className="lg:hidden"
          >
            <PanelRight className="h-4 w-4" />
          </IconButton>
        </div>

        {(saveError || loadError) && (
          <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {saveError || loadError}
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 bg-muted/60 p-3 sm:p-4">
            <div
              className="flex h-full justify-center"
              onClickCapture={handleCanvasClick}
              onSubmitCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {saved ? (
                <PreviewFrame
                  width={DEVICE_WIDTHS[device]}
                  className="h-full rounded-lg border border-border bg-background shadow-sm"
                  onDocument={handlePreviewDocument}
                >
                  <EditableContentProvider content={draft} editor={editorApi}>
                    <div className="flex min-h-screen flex-col">
                      <SiteHeader activePath={PAGE_META[page].path} />
                      <main className="flex-1">
                        <PageBlocks page={page} />
                      </main>
                      <SiteFooter />
                    </div>
                  </EditableContentProvider>
                </PreviewFrame>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-border bg-background">
                  {loadError ? (
                    <p className="text-sm text-destructive">{loadError}</p>
                  ) : (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="hidden w-80 shrink-0 border-l border-border bg-card lg:block">
            {inspector}
          </aside>

          {panelOpen && (
            <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
              <button
                type="button"
                aria-label="Close panel"
                className="flex-1 bg-foreground/40"
                onClick={() => setPanelOpen(false)}
              />
              <div className="w-80 max-w-[85vw] bg-card shadow-xl">{inspector}</div>
            </div>
          )}
        </div>
      </div>

      <BlockLibrary
        open={libraryTarget !== null}
        onClose={() => setLibraryTarget(null)}
        onPick={(type) =>
          libraryTarget && insertBlock(libraryTarget.page, libraryTarget.index, type)
        }
      />
      <MediaPicker
        open={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={applyImage}
      />
    </AdminShell>
  );
}

function IconButton({
  title,
  active,
  disabled,
  onClick,
  className,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent",
        active && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
        className,
      )}
    >
      {children}
    </button>
  );
}
