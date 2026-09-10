import { useEffect, useState } from "react";
import type { Category } from "@/lib/categories";
import Lightbox from "@/components/Lightbox";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<{ categoryId: string; index: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        setCategories(data.categories ?? []);
      } catch {
        setError("Unable to load categories right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const lightboxCategory = categories.find((c) => c.id === lightbox?.categoryId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          What We Cover
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Categories Previously Serviced
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Please note some of these categories may require a trade licence.
        </p>
      </div>

      {loading && <p className="mt-14 text-center text-muted-foreground">Loading...</p>}
      {error && <p className="mt-14 text-center text-destructive">{error}</p>}
      {!loading && !error && categories.length === 0 && (
        <p className="mt-14 text-center text-muted-foreground">No categories to display yet.</p>
      )}

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
          >
            {cat.images[0] ? (
              <button
                type="button"
                onClick={() => setLightbox({ categoryId: cat.id, index: 0 })}
                className="group relative block w-full cursor-pointer"
                aria-label={`View photos for ${cat.heading}`}
              >
                <img
                  src={cat.images[0].url}
                  alt={cat.heading}
                  className="aspect-video w-full object-cover transition-transform group-hover:scale-[1.02]"
                />
                {cat.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
                    +{cat.images.length - 1} more
                  </span>
                )}
              </button>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-primary/10">
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
            )}
            <div className="p-6">
              <h3 className="font-serif text-xl text-foreground">{cat.heading}</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {cat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {lightbox && lightboxCategory && (
        <Lightbox
          images={lightboxCategory.images}
          index={lightbox.index}
          onIndexChange={(index) => setLightbox({ categoryId: lightboxCategory.id, index })}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}


