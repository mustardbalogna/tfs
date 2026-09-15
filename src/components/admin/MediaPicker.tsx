import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageRef } from "@/lib/siteContent";
import {
  deleteMedia,
  listMedia,
  type MediaItem,
  uploadMedia,
  validateImageFile,
} from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Uploading {
  key: string;
  name: string;
  progress: number;
  error?: string;
}

function nameToAlt(name: string): string {
  return name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (image: ImageRef) => void;
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<Uploading[]>([]);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setAlt("");
    setConfirmDelete(null);
    setError("");
    let cancelled = false;
    listMedia()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.message === "Unauthorized") navigate("/admin/login");
        else setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [open, navigate]);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    setError("");
    for (const file of files) {
      const key = `${Date.now()}-${file.name}-${Math.random()}`;
      const validationError = validateImageFile(file);
      if (validationError) {
        setUploading((prev) => [
          ...prev,
          { key, name: file.name, progress: 0, error: validationError },
        ]);
        continue;
      }
      setUploading((prev) => [...prev, { key, name: file.name, progress: 0 }]);
      try {
        const item = await uploadMedia(file, (percent) =>
          setUploading((prev) =>
            prev.map((u) => (u.key === key ? { ...u, progress: percent } : u)),
          ),
        );
        setItems((prev) => [item, ...(prev ?? [])]);
        setUploading((prev) => prev.filter((u) => u.key !== key));
        // Uploading a single photo almost always means "use this one".
        if (files.length === 1) choose(item);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          navigate("/admin/login");
          return;
        }
        setUploading((prev) =>
          prev.map((u) =>
            u.key === key
              ? { ...u, error: err instanceof Error ? err.message : "Upload failed" }
              : u,
          ),
        );
      }
    }
  }

  function choose(item: MediaItem) {
    setSelected(item);
    setAlt(nameToAlt(item.name));
    setConfirmDelete(null);
  }

  async function handleDelete(item: MediaItem) {
    try {
      await deleteMedia(item.path);
      setItems((prev) => (prev ?? []).filter((i) => i.path !== item.path));
      if (selected?.path === item.path) setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Choose an image</DialogTitle>
          <DialogDescription>
            Upload a new photo or pick one you&apos;ve used before. JPG, PNG or WebP up to 2MB.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <Button type="button" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Upload photos
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 py-1">
          {items === null && !error && (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          {items !== null && items.length === 0 && uploading.length === 0 && (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              No photos uploaded yet.
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {uploading.map((u) => (
              <div
                key={u.key}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border p-2 text-center"
              >
                <span className="w-full truncate text-xs text-muted-foreground">{u.name}</span>
                {u.error ? (
                  <span className="text-xs text-destructive">{u.error}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">{u.progress}%</span>
                )}
              </div>
            ))}
            {(items ?? []).map((item) => {
              const isSelected = selected?.path === item.path;
              return (
                <div key={item.path} className="group relative">
                  <button
                    type="button"
                    onClick={() => choose(item)}
                    title={item.name}
                    className={cn(
                      "block aspect-square w-full overflow-hidden rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-primary/50",
                    )}
                  >
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  </button>
                  {isSelected && (
                    <span className="pointer-events-none absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  {confirmDelete === item.path ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="absolute inset-x-1 bottom-1 rounded-md bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground"
                    >
                      Delete permanently?
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(item.path)}
                      title="Delete from library"
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-card/90 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="items-end gap-3 border-t border-border pt-4 sm:justify-between">
          <div className="min-w-0 flex-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Description for screen readers &amp; search engines
            </label>
            <Input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder={
                selected ? "e.g. Walnut dining table with six chairs" : "Select an image first"
              }
              disabled={!selected}
              maxLength={300}
              className="mt-1"
            />
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selected}
              onClick={() => selected && onSelect({ url: selected.url, alt: alt.trim() })}
            >
              Use image
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
