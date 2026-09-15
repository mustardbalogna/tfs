import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/categories";
import { fetchCategoriesCached, getCachedCategories } from "@/lib/categoriesCache";
import type { BlockOf, PageKey } from "@/lib/siteContent";
import Lightbox from "@/components/Lightbox";
import { BlockSection, EditableText } from "../editable";
import { useIsEditing } from "../content-context";
import Reveal from "../Reveal";
import { Container } from "./shared";

export default function CategoriesGridBlock({
  page,
  block,
  path,
}: {
  page: PageKey;
  block: BlockOf<"categoriesGrid">;
  path: string;
}) {
  const p = block.props;
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
    <BlockSection page={page} block={block} label="Category gallery" className="py-14 sm:py-20">
      <Container>
        {editing && (
          <div
            data-editor-ui
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-foreground"
          >
            <span>Categories, their photos and descriptions are managed on their own page.</span>
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
            path={`${path}.props.emptyMessage`}
            as="p"
            className="text-center text-muted-foreground"
          />
        )}

        <div
          className={cn(
            "grid gap-8",
            p.columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {categories.map((cat, i) => (
            <Reveal key={cat.id} delay={Math.min(i, 5) * 60}>
              <div className="group h-full overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
                {cat.images[0] ? (
                  <button
                    type="button"
                    onClick={() => !editing && setLightbox({ categoryId: cat.id, index: 0 })}
                    className="relative block w-full cursor-zoom-in overflow-hidden"
                    aria-label={`View photos for ${cat.heading}`}
                  >
                    <img
                      src={cat.images[0].url}
                      alt={cat.heading}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
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
            </Reveal>
          ))}
        </div>
      </Container>

      {lightbox && lightboxCategory && (
        <Lightbox
          images={lightboxCategory.images}
          index={lightbox.index}
          onIndexChange={(index) => setLightbox({ categoryId: lightboxCategory.id, index })}
          onClose={() => setLightbox(null)}
        />
      )}
    </BlockSection>
  );
}
