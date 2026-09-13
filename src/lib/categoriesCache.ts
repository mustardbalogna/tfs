import type { Category } from "./categories";

let cache: { data: Category[]; timestamp: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export function getCachedCategories(): Category[] | null {
  return cache && Date.now() - cache.timestamp < TTL_MS ? cache.data : null;
}

/** Fetches categories, reusing a fresh in-memory cache instead of hitting the API every time. */
export async function fetchCategoriesCached(): Promise<Category[]> {
  const cached = getCachedCategories();
  if (cached) return cached;
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to load categories");
  const data = await res.json();
  const categories = (data.categories ?? []) as Category[];
  cache = { data: categories, timestamp: Date.now() };
  return categories;
}

/** Call after admin create/update/delete so the public site doesn't show stale data. */
export function invalidateCategoriesCache(): void {
  cache = null;
}
