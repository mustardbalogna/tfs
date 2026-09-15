import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_KEYS, PAGE_META } from "@/lib/siteContent";
import { useIsEditing, useSiteContent } from "./content-context";
import { EditableText } from "./editable";

const NAV_ITEMS = PAGE_KEYS.map((k) => ({ to: PAGE_META[k].path, label: PAGE_META[k].label }));

export default function SiteHeader({ activePath }: { activePath?: string }) {
  const { brand } = useSiteContent();
  const editing = useIsEditing();
  const location = useLocation();
  const current = activePath ?? location.pathname;
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => (to === "/" ? current === "/" : current.startsWith(to));

  return (
    <header
      className={cn(
        "sticky top-0 w-full border-b border-border bg-background/95 backdrop-blur",
        // Sits below editor popovers (z-50) while editing so they aren't clipped.
        editing ? "z-30" : "z-50",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <EditableText
            path="brand.name"
            className="font-serif text-xl font-normal tracking-tight text-primary"
          />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(item.to)
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to={brand.navCta.to}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <EditableText path="brand.navCta.label" />
          </Link>
        </nav>
        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-foreground"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          {open && (
            <div className="absolute inset-x-4 top-16 z-50 rounded-lg border border-border bg-card p-2 shadow-lg">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition-colors",
                    isActive(item.to)
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to={brand.navCta.to}
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
              >
                {brand.navCta.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
