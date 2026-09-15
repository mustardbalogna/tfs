import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsEditing } from "./content-context";

/**
 * Fades/slides children in the first time they scroll into view. Disabled in
 * the editor (everything is visible immediately) and for users who prefer
 * reduced motion.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const editing = useIsEditing();
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(editing);

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    const win = el.ownerDocument.defaultView ?? window;
    if (
      win.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in win)
    ) {
      setShown(true);
      return;
    }
    const observer = new win.IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);

  const Component = Tag as "div";
  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(!editing && "tfs-reveal", shown && "tfs-in", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
