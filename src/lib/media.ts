import { validateImageFile } from "./categories";

export interface MediaItem {
  path: string;
  url: string;
  name: string;
  size?: number;
  createdAt?: string;
}

export { validateImageFile };

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

async function parseError(res: Response, fallback: string): Promise<Error> {
  if (res.status === 401) return new Error("Unauthorized");
  const data = await res.json().catch(() => ({}));
  return new Error(data.error || fallback);
}

export async function listMedia(): Promise<MediaItem[]> {
  const res = await fetch("/api/media", { cache: "no-store" });
  if (!res.ok) throw await parseError(res, "Failed to load media library");
  const data = await res.json();
  return data.items ?? [];
}

export async function uploadMedia(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<MediaItem> {
  const dataBase64 = await fileToBase64(file);
  return new Promise<MediaItem>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: { item?: MediaItem; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText || "{}");
      } catch {
        // handled by the status check below
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.item) resolve(data.item);
      else reject(new Error(xhr.status === 401 ? "Unauthorized" : data.error || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(JSON.stringify({ fileName: file.name, contentType: file.type, dataBase64 }));
  });
}

export async function deleteMedia(path: string): Promise<void> {
  const res = await fetch("/api/media", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw await parseError(res, "Failed to delete image");
}
