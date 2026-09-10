export const CATEGORY_LIMITS = { name: 100, heading: 150, description: 2000 } as const;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export interface CategoryImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  heading: string;
  description: string;
  created_at: string;
  updated_at: string;
  images: CategoryImage[];
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPG, PNG and WebP images are allowed";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `Images must be ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))}MB or smaller`;
  }
  return null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function uploadCategoryImage(
  categoryId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<CategoryImage> {
  const dataBase64 = await fileToBase64(file);
  return new Promise<CategoryImage>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/category-images");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: { image?: CategoryImage; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText || "{}");
      } catch {
        // ignore parse errors, handled by the status check below
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.image) {
        resolve(data.image);
      } else {
        reject(new Error(data.error || "Failed to upload image"));
      }
    };
    xhr.onerror = () => reject(new Error("Failed to upload image"));
    xhr.send(
      JSON.stringify({ categoryId, fileName: file.name, contentType: file.type, dataBase64 }),
    );
  });
}

export async function deleteCategoryImage(id: string): Promise<void> {
  const res = await fetch("/api/category-images", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete image");
  }
}

export async function reorderCategoryImages(categoryId: string, order: string[]): Promise<void> {
  const res = await fetch("/api/category-images", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categoryId, order }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to reorder images");
  }
}
