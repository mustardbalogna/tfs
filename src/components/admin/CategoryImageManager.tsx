import { useRef, useState } from "react";
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
import {
  type CategoryImage,
  deleteCategoryImage,
  reorderCategoryImages,
  uploadCategoryImage,
  validateImageFile,
} from "@/lib/categories";

interface UploadingFile {
  key: string;
  name: string;
  progress: number;
  error?: string;
}

export default function CategoryImageManager({
  categoryId,
  images,
  onImagesChange,
}: {
  categoryId: string;
  images: CategoryImage[];
  onImagesChange: (images: CategoryImage[]) => void;
}) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    setError("");

    for (const file of files) {
      const validationError = validateImageFile(file);
      const key = `${Date.now()}-${file.name}-${Math.random()}`;
      if (validationError) {
        setUploading((prev) => [
          ...prev,
          { key, name: file.name, progress: 0, error: validationError },
        ]);
        continue;
      }

      setUploading((prev) => [...prev, { key, name: file.name, progress: 0 }]);
      try {
        const image = await uploadCategoryImage(categoryId, file, (percent) => {
          setUploading((prev) =>
            prev.map((u) => (u.key === key ? { ...u, progress: percent } : u)),
          );
        });
        onImagesChange([...images, image]);
        setUploading((prev) => prev.filter((u) => u.key !== key));
      } catch (err) {
        setUploading((prev) =>
          prev.map((u) =>
            u.key === key
              ? { ...u, error: err instanceof Error ? err.message : "Failed to upload image" }
              : u,
          ),
        );
      }
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError("");
    try {
      await deleteCategoryImage(id);
      onImagesChange(images.filter((img) => img.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setBusyId(null);
    }
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = images.slice();
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const previous = images;
    onImagesChange(reordered);
    setError("");

    try {
      await reorderCategoryImages(
        categoryId,
        reordered.map((img) => img.id),
      );
    } catch (err) {
      onImagesChange(previous);
      setError(err instanceof Error ? err.message : "Failed to reorder images");
    }
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="group relative overflow-hidden rounded-md border border-border"
          >
            <img src={img.url} alt="" className="aspect-square w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/90 p-1">
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  disabled={index === 0 || busyId === img.id}
                  onClick={() => moveImage(index, -1)}
                  aria-label="Move image earlier"
                >
                  ←
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  disabled={index === images.length - 1 || busyId === img.id}
                  onClick={() => moveImage(index, 1)}
                  aria-label="Move image later"
                >
                  →
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6"
                    disabled={busyId === img.id}
                    aria-label="Delete image"
                  >
                    ×
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this image?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the image from storage. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(img.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}

        {uploading.map((u) => (
          <div
            key={u.key}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border p-2 text-center"
          >
            <span className="truncate text-xs text-muted-foreground">{u.name}</span>
            {u.error ? (
              <span className="text-xs text-destructive">{u.error}</span>
            ) : (
              <span className="text-xs text-muted-foreground">{u.progress}%</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          Add images
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG or WebP, up to {Math.round(MAX_IMAGE_MB)}MB each.
        </p>
      </div>
    </div>
  );
}

const MAX_IMAGE_MB = 2;
