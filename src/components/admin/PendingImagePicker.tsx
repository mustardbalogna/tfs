import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { validateImageFile } from "@/lib/categories";

export interface PendingImage {
  key: string;
  file: File;
  previewUrl: string;
  error?: string;
}

export default function PendingImagePicker({
  value,
  onChange,
  disabled,
}: {
  value: PendingImage[];
  onChange: (value: PendingImage[]) => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    const additions: PendingImage[] = files.map((file) => ({
      key: `${Date.now()}-${file.name}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      error: validateImageFile(file) ?? undefined,
    }));
    onChange([...value, ...additions]);
  }

  function handleRemove(key: string) {
    const target = value.find((v) => v.key === key);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(value.filter((v) => v.key !== key));
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((img) => (
            <div key={img.key} className="relative overflow-hidden rounded-md border border-border">
              <img src={img.previewUrl} alt="" className="aspect-square w-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={() => handleRemove(img.key)}
                disabled={disabled}
                aria-label="Remove image"
              >
                ×
              </Button>
              {img.error && (
                <p className="absolute inset-x-0 bottom-0 bg-destructive/90 p-1 text-center text-[10px] text-destructive-foreground">
                  {img.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        Add images
      </Button>
      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or WebP, up to 2MB each.</p>
    </div>
  );
}
