import { Link } from "react-router-dom";
import bgimage from "@/assets/image.jpg";
import { cn } from "@/lib/utils";
import type { BlockOf, PageKey } from "@/lib/siteContent";
import { BlockSection, EditableImage, EditableText } from "../editable";
import { useIsEditing } from "../content-context";
import Reveal from "../Reveal";

const OVERLAY = {
  light: "from-background/80 via-background/50 to-background/10",
  medium: "from-background/90 via-background/70 to-background/30",
  dark: "from-background/95 via-background/85 to-background/50",
} as const;

const HEIGHT = {
  compact: "py-16 sm:py-20 lg:py-24",
  regular: "py-24 sm:py-32 lg:py-40",
  tall: "py-32 sm:py-44 lg:py-56",
} as const;

export default function HeroBlock({
  page,
  block,
  path,
}: {
  page: PageKey;
  block: BlockOf<"hero">;
  path: string;
}) {
  const p = block.props;
  const base = `${path}.props`;
  const editing = useIsEditing();
  const center = p.align === "center";

  return (
    <BlockSection page={page} block={block} label="Hero" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <EditableImage
          path={`${base}.image`}
          image={p.image}
          zoomable={false}
          optional
          placeholderLabel="Change background photo"
          className="h-full w-full"
          imgClassName="h-full w-full object-cover"
          fallback={
            <img
              src={bgimage}
              alt="Custom furniture workshop with timber pieces"
              className="h-full w-full object-cover"
            />
          }
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-r",
            OVERLAY[p.overlay],
            center && "bg-gradient-to-b",
          )}
        />
      </div>
      <div className={cn("relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", HEIGHT[p.height])}>
        <Reveal className={cn("max-w-2xl", center && "mx-auto text-center")}>
          <EditableText
            path={`${base}.eyebrow`}
            as="p"
            className="text-sm font-semibold uppercase tracking-widest text-primary"
            placeholder="Eyebrow (optional)"
          />
          <EditableText
            path={`${base}.heading`}
            as="h1"
            multiline
            className="mt-4 font-serif text-4xl leading-tight font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          />
          <EditableText
            path={`${base}.subheading`}
            as="p"
            multiline
            className={cn("mt-6 max-w-xl text-lg text-muted-foreground", center && "mx-auto")}
          />
          {(p.primaryCta.label || p.secondaryCta.label || editing) && (
            <div className={cn("mt-8 flex flex-wrap gap-4", center && "justify-center")}>
              {(p.primaryCta.label || editing) && (
                <Link
                  to={p.primaryCta.to}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
                >
                  <EditableText path={`${base}.primaryCta.label`} placeholder="Button" />
                </Link>
              )}
              {(p.secondaryCta.label || editing) && (
                <Link
                  to={p.secondaryCta.to}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background/80 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-accent"
                >
                  <EditableText
                    path={`${base}.secondaryCta.label`}
                    placeholder="Second button (optional)"
                  />
                </Link>
              )}
            </div>
          )}
        </Reveal>
      </div>
    </BlockSection>
  );
}
