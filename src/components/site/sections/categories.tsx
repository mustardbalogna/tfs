import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/categories";
import { fetchCategoriesCached, getCachedCategories } from "@/lib/categoriesCache";
import Lightbox from "@/components/Lightbox";
import { useIsEditing, useSiteContent } from "../content-context";
import { EditableText, Section } from "../editable";

export function CategoriesIntro() {
  const { categories } = useSiteContent();
  const center = categories.intro.align === "center";
  return (
    <Section page="categories" id="intro" label="Intro" className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
          <EditableText
            path="categories.intro.eyebrow"
            as="p"
            className="text-sm font-semibold uppercase tracking-widest text-primary"
            placeholder="Eyebrow (optional)"
          />
          <EditableText
            path="categories.intro.heading"
            as="h1"
            className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl"
          />
          <EditableText
            path="categories.intro.blurb"
            as="p"
            multiline
            className={cn("mt-4 max-w-2xl text-muted-foreground", center && "mx-auto")}
            placeholder="Intro paragraph (optional)"
          />
        </div>
      </div>
    </Section>
  );
}

export function CategoriesGrid() {
  const { categories: cfg } = useSiteContent();
  const editing = useIsEditing();
  const [categories, setCategories] = useState<Category[]>(() => getCachedCategories() ?? []);
  const [loading, setLoading] = useState(() => getCachedCategories() === null);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<{ categoryId: string; index: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategoriesCached();
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) setError("Unable to load categories right now. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lightboxCategory = categories.find((c) => c.id === lightbox?.categoryId);

  return (
    <Section page="categories" id="grid" label="Category gallery" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {editing && (
          <div
            data-editor-ui
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-foreground"
          >
            <span>
              Categories, their photos and descriptions are managed separately so they can hold
              image galleries.
            </span>
            <Link
              to="/admin/categories"
              target="_top"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Manage categories
            </Link>
          </div>
        )}

        {loading && <p className="text-center text-muted-foreground">Loading...</p>}
        {error && <p className="text-center text-destructive">{error}</p>}
        {!loading && !error && categories.length === 0 && (
          <EditableText
            path="categories.grid.emptyMessage"
            as="p"
            className="text-center text-muted-foreground"
          />
        )}

        <div
          className={cn(
            "grid gap-8",
            cfg.grid.columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {cat.images[0] ? (
                <button
                  type="button"
                  onClick={() => !editing && setLightbox({ categoryId: cat.id, index: 0 })}
                  className="relative block w-full cursor-pointer"
                  aria-label={`View photos for ${cat.heading}`}
                >
                  <img
                    src={cat.images[0].url}
                    alt={cat.heading}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  {cat.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
                      +{cat.images.length - 1} more
                    </span>
                  )}
                </button>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-primary/10">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </div>
              )}
              <div className="p-6">
                <h3 className="font-serif text-xl text-foreground">{cat.heading}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightbox && lightboxCategory && (
        <Lightbox
          images={lightboxCategory.images}
          index={lightbox.index}
          onIndexChange={(index) => setLightbox({ categoryId: lightboxCategory.id, index })}
          onClose={() => setLightbox(null)}
        />
      )}
    </Section>
  );
}

export const CATEGORIES_SECTIONS = {
  intro: CategoriesIntro,
  grid: CategoriesGrid,
} as const;
