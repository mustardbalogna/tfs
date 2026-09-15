import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Align, Columns, SectionTone } from "@/lib/siteContent";
import { EditableText } from "../editable";

export const COLUMN_CLASSES: Record<Columns, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export interface ToneStyles {
  section: string;
  eyebrow: string;
  heading: string;
  body: string;
  card: string;
  pill: string;
  dark: boolean;
}

export function toneStyles(tone: SectionTone): ToneStyles {
  switch (tone) {
    case "dark":
      return {
        section: "bg-foreground text-background",
        eyebrow: "text-primary-foreground/70",
        heading: "text-background",
        body: "text-background/75",
        card: "border-background/15 bg-background/5",
        pill: "border-background/20 bg-background/10 text-background",
        dark: true,
      };
    case "card":
      return {
        section: "bg-card",
        eyebrow: "text-primary",
        heading: "text-foreground",
        body: "text-muted-foreground",
        card: "border-border bg-background",
        pill: "border-border bg-background text-foreground",
        dark: false,
      };
    case "tinted":
      return {
        section: "bg-secondary/30",
        eyebrow: "text-primary",
        heading: "text-foreground",
        body: "text-muted-foreground",
        card: "border-border bg-card",
        pill: "border-border bg-background text-foreground",
        dark: false,
      };
    default:
      return {
        section: "",
        eyebrow: "text-primary",
        heading: "text-foreground",
        body: "text-muted-foreground",
        card: "border-border bg-card",
        pill: "border-border bg-background text-foreground",
        dark: false,
      };
  }
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

interface BlockHeaderProps {
  /** Props path, e.g. "pages.home.1.props" */
  base: string;
  align: Align;
  tone: ToneStyles;
  eyebrow?: boolean;
  blurb?: boolean;
  level?: "h1" | "h2";
  className?: string;
}

/** Eyebrow / heading / blurb trio used at the top of most blocks. */
export function BlockHeader({
  base,
  align,
  tone,
  eyebrow = true,
  blurb = true,
  level = "h2",
  className,
}: BlockHeaderProps) {
  const center = align === "center";
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <EditableText
          path={`${base}.eyebrow`}
          as="p"
          className={cn("text-sm font-semibold uppercase tracking-widest", tone.eyebrow)}
          placeholder="Eyebrow (optional)"
        />
      )}
      <EditableText
        path={`${base}.heading`}
        as={level}
        className={cn(
          "mt-3 font-serif tracking-tight",
          level === "h1" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl",
          tone.heading,
        )}
        placeholder="Heading"
      />
      {blurb && (
        <EditableText
          path={`${base}.blurb`}
          as="p"
          multiline
          className={cn("mt-4 text-lg leading-relaxed", tone.body, center && "mx-auto")}
          placeholder="Short paragraph (optional)"
        />
      )}
    </div>
  );
}
