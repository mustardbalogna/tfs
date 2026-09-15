import { ICON_NAMES, type IconName } from "@/components/site/icons";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export type SectionTone = "plain" | "card" | "tinted" | "dark";
export type Align = "left" | "center";
export type Columns = 2 | 3 | 4;
export type Side = "left" | "right";
export type InternalRoute = "/" | "/about" | "/services" | "/categories" | "/contact";

export const INTERNAL_ROUTES: { value: InternalRoute; label: string }[] = [
  { value: "/", label: "Home" },
  { value: "/about", label: "About" },
  { value: "/services", label: "Services" },
  { value: "/categories", label: "Categories" },
  { value: "/contact", label: "Contact" },
];

export interface CtaLink {
  label: string;
  to: InternalRoute;
}

/** An uploaded image. `null` means "no image set". */
export interface ImageRef {
  url: string;
  alt: string;
}

export interface CardItem {
  icon: IconName;
  image: ImageRef | null;
  title: string;
  desc: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HoursRow {
  label: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Block props
// ---------------------------------------------------------------------------

export interface HeroProps {
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  image: ImageRef | null;
  overlay: "light" | "medium" | "dark";
  align: Align;
  height: "compact" | "regular" | "tall";
}

export interface IntroProps {
  eyebrow: string;
  heading: string;
  blurb: string;
  align: Align;
  level: "h1" | "h2";
}

export interface CardsProps {
  eyebrow: string;
  heading: string;
  blurb: string;
  items: CardItem[];
  columns: Columns;
  style: "icon" | "image";
  tone: SectionTone;
  align: Align;
  cta: CtaLink;
}

export interface TextImageProps {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  cta: CtaLink;
  aside: "image" | "list";
  image: ImageRef | null;
  listHeading: string;
  listItems: string[];
  asideSide: Side;
  tone: SectionTone;
}

export interface TagsProps {
  heading: string;
  blurb: string;
  items: string[];
  cta: CtaLink;
  tone: SectionTone;
  align: Align;
}

export interface GalleryProps {
  eyebrow: string;
  heading: string;
  blurb: string;
  images: ImageRef[];
  columns: Columns;
  tone: SectionTone;
}

export interface StatsProps {
  items: StatItem[];
  tone: SectionTone;
}

export interface TestimonialsProps {
  eyebrow: string;
  heading: string;
  items: Testimonial[];
  columns: 2 | 3;
  tone: SectionTone;
}

export interface FaqProps {
  eyebrow: string;
  heading: string;
  blurb: string;
  items: FaqItem[];
  tone: SectionTone;
}

export interface CtaProps {
  heading: string;
  blurb: string;
  button: CtaLink;
  image: ImageRef | null;
}

export interface CategoriesGridProps {
  columns: 2 | 3;
  emptyMessage: string;
}

export interface ContactProps {
  formHeading: string;
  submitLabel: string;
  successMessage: string;
  areasHeading: string;
  serviceAreas: string[];
  hoursHeading: string;
  hours: HoursRow[];
  infoSide: Side;
}

export type BlockPropsMap = {
  hero: HeroProps;
  intro: IntroProps;
  cards: CardsProps;
  textImage: TextImageProps;
  tags: TagsProps;
  gallery: GalleryProps;
  stats: StatsProps;
  testimonials: TestimonialsProps;
  faq: FaqProps;
  cta: CtaProps;
  categoriesGrid: CategoriesGridProps;
  contact: ContactProps;
};

export type BlockType = keyof BlockPropsMap;

export type Block = {
  [T in BlockType]: { id: string; type: T; visible: boolean; props: BlockPropsMap[T] };
}[BlockType];

export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;

// ---------------------------------------------------------------------------
// Library — what the admin can insert. Defaults double as the normaliser's
// fallbacks, so every prop always has a value.
// ---------------------------------------------------------------------------

export interface BlockMeta<T extends BlockType = BlockType> {
  type: T;
  label: string;
  description: string;
  defaults: () => BlockPropsMap[T];
}

const NO_LINK: CtaLink = { label: "", to: "/contact" };

export const BLOCK_LIBRARY: { [T in BlockType]: BlockMeta<T> } = {
  hero: {
    type: "hero",
    label: "Hero banner",
    description: "Full-width photo with a headline and buttons.",
    defaults: () => ({
      eyebrow: "Welcome",
      heading: "A bold headline\nfor this page.",
      subheading: "A short sentence that explains what you do and why it matters.",
      primaryCta: { label: "Get a Free Quote", to: "/contact" },
      secondaryCta: { label: "Our Services", to: "/services" },
      image: null,
      overlay: "medium",
      align: "left",
      height: "regular",
    }),
  },
  intro: {
    type: "intro",
    label: "Heading",
    description: "Eyebrow, heading and an optional paragraph.",
    defaults: () => ({
      eyebrow: "Section",
      heading: "Section heading",
      blurb: "",
      align: "center",
      level: "h2",
    }),
  },
  cards: {
    type: "cards",
    label: "Cards",
    description: "A grid of cards with an icon or photo, title and text.",
    defaults: () => ({
      eyebrow: "",
      heading: "What we offer",
      blurb: "",
      items: [
        { icon: "hammer", image: null, title: "First card", desc: "Describe this item." },
        { icon: "ruler", image: null, title: "Second card", desc: "Describe this item." },
        { icon: "sparkles", image: null, title: "Third card", desc: "Describe this item." },
      ],
      columns: 3,
      style: "icon",
      tone: "card",
      align: "center",
      cta: NO_LINK,
    }),
  },
  textImage: {
    type: "textImage",
    label: "Text & image",
    description: "Paragraphs beside a photo or a bullet list.",
    defaults: () => ({
      eyebrow: "About",
      heading: "Tell your story",
      paragraphs: ["Add a paragraph or two about your business, your craft and your customers."],
      cta: { label: "Learn more", to: "/about" },
      aside: "image",
      image: null,
      listHeading: "Highlights",
      listItems: ["First point", "Second point", "Third point", "Fourth point"],
      asideSide: "right",
      tone: "plain",
    }),
  },
  tags: {
    type: "tags",
    label: "Tag cloud",
    description: "A heading with a row of pills — great for suburbs or materials.",
    defaults: () => ({
      heading: "Areas We Service",
      blurb: "",
      items: ["Suburb one", "Suburb two", "Suburb three"],
      cta: NO_LINK,
      tone: "tinted",
      align: "center",
    }),
  },
  gallery: {
    type: "gallery",
    label: "Photo gallery",
    description: "A grid of photos visitors can click to enlarge.",
    defaults: () => ({
      eyebrow: "",
      heading: "Recent work",
      blurb: "",
      images: [],
      columns: 3,
      tone: "plain",
    }),
  },
  stats: {
    type: "stats",
    label: "Numbers",
    description: "Big figures with short labels.",
    defaults: () => ({
      items: [
        { value: "20+", label: "Years of experience" },
        { value: "100%", label: "Custom made" },
        { value: "Local", label: "Sydney workshop" },
      ],
      tone: "dark",
    }),
  },
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    description: "Quotes from happy customers.",
    defaults: () => ({
      eyebrow: "Testimonials",
      heading: "What our customers say",
      items: [
        { quote: "Add a customer quote here.", name: "Customer name", role: "Suburb" },
        { quote: "Add another quote here.", name: "Customer name", role: "Suburb" },
      ],
      columns: 2,
      tone: "card",
    }),
  },
  faq: {
    type: "faq",
    label: "FAQ",
    description: "Expandable questions and answers.",
    defaults: () => ({
      eyebrow: "FAQ",
      heading: "Common questions",
      blurb: "",
      items: [
        { question: "How long does a custom piece take?", answer: "Add your answer here." },
        { question: "Do you deliver and install?", answer: "Add your answer here." },
      ],
      tone: "plain",
    }),
  },
  cta: {
    type: "cta",
    label: "Call to action",
    description: "A coloured banner with a button.",
    defaults: () => ({
      heading: "Ready to start your project?",
      blurb: "Get in touch for a free, no-obligation quote.",
      button: { label: "Contact Us", to: "/contact" },
      image: null,
    }),
  },
  categoriesGrid: {
    type: "categoriesGrid",
    label: "Category gallery",
    description: "Your categories and their photo galleries, managed under Categories.",
    defaults: () => ({ columns: 3, emptyMessage: "No categories to display yet." }),
  },
  contact: {
    type: "contact",
    label: "Contact form",
    description: "Enquiry form with service areas and opening hours.",
    defaults: () => ({
      formHeading: "Send us a message",
      submitLabel: "Send Enquiry",
      successMessage: "Thanks! Your message has been sent.",
      areasHeading: "Service Areas",
      serviceAreas: ["Suburb, NSW"],
      hoursHeading: "Business Hours",
      hours: [{ label: "Monday – Friday", value: "9:00 AM – 5:00 PM" }],
      infoSide: "right",
    }),
  },
};

export const BLOCK_TYPES = Object.keys(BLOCK_LIBRARY) as BlockType[];

export function newBlockId(): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return uuid.replace(/-/g, "").slice(0, 12);
}

export function createBlock<T extends BlockType>(
  type: T,
  overrides: Partial<BlockPropsMap[T]> = {},
  id = newBlockId(),
): BlockOf<T> {
  return {
    id,
    type,
    visible: true,
    props: { ...BLOCK_LIBRARY[type].defaults(), ...overrides },
  } as unknown as BlockOf<T>;
}

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

export const LIMITS = { text: 2000, listItems: 40, url: 2000 } as const;

type Rec = Record<string, unknown>;

export function isRec(v: unknown): v is Rec {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v.slice(0, LIMITS.text) : fallback;
}

export function oneOf<T extends string | number>(
  v: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly unknown[]).includes(v) ? (v as T) : fallback;
}

export function strList(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  return v
    .filter((x): x is string => typeof x === "string")
    .slice(0, LIMITS.listItems)
    .map((s) => s.slice(0, LIMITS.text));
}

function recList<T>(v: unknown, fallback: T[], map: (x: Rec, i: number) => T): T[] {
  if (!Array.isArray(v)) return fallback;
  return v.filter(isRec).slice(0, LIMITS.listItems).map(map);
}

/** Only https URLs are accepted so a stored value can never become a javascript: or data: src. */
export function imageRef(v: unknown): ImageRef | null {
  if (!isRec(v) || typeof v.url !== "string") return null;
  const url = v.url.trim();
  if (!/^https:\/\/[^\s"'<>]+$/i.test(url) || url.length > LIMITS.url) return null;
  return { url, alt: str(v.alt, "").slice(0, 300) };
}

function imageList(v: unknown): ImageRef[] {
  if (!Array.isArray(v)) return [];
  return v
    .map(imageRef)
    .filter((x): x is ImageRef => x !== null)
    .slice(0, LIMITS.listItems);
}

export function route(v: unknown, fallback: InternalRoute): InternalRoute {
  return oneOf(
    v,
    INTERNAL_ROUTES.map((r) => r.value),
    fallback,
  );
}

export function cta(v: unknown, fallback: CtaLink): CtaLink {
  if (!isRec(v)) return fallback;
  return { label: str(v.label, fallback.label), to: route(v.to, fallback.to) };
}

const ALIGN: readonly Align[] = ["left", "center"];
const TONE: readonly SectionTone[] = ["plain", "card", "tinted", "dark"];
const SIDE: readonly Side[] = ["left", "right"];
const COLS: readonly Columns[] = [2, 3, 4];

function cardItems(v: unknown, fallback: CardItem[]): CardItem[] {
  return recList(v, fallback, (x, i) => ({
    icon: oneOf(x.icon, ICON_NAMES, fallback[i]?.icon ?? "gem"),
    image: imageRef(x.image),
    title: str(x.title, ""),
    desc: str(x.desc, ""),
  }));
}

function normalizeProps<T extends BlockType>(type: T, raw: unknown): BlockPropsMap[T] {
  const d = BLOCK_LIBRARY[type].defaults();
  const p = isRec(raw) ? raw : {};
  switch (type) {
    case "hero": {
      const dd = d as HeroProps;
      const out: HeroProps = {
        eyebrow: str(p.eyebrow, dd.eyebrow),
        heading: str(p.heading, dd.heading),
        subheading: str(p.subheading, dd.subheading),
        primaryCta: cta(p.primaryCta, dd.primaryCta),
        secondaryCta: cta(p.secondaryCta, dd.secondaryCta),
        image: imageRef(p.image),
        overlay: oneOf(p.overlay, ["light", "medium", "dark"] as const, dd.overlay),
        align: oneOf(p.align, ALIGN, dd.align),
        height: oneOf(p.height, ["compact", "regular", "tall"] as const, dd.height),
      };
      return out as BlockPropsMap[T];
    }
    case "intro": {
      const dd = d as IntroProps;
      const out: IntroProps = {
        eyebrow: str(p.eyebrow, dd.eyebrow),
        heading: str(p.heading, dd.heading),
        blurb: str(p.blurb, dd.blurb),
        align: oneOf(p.align, ALIGN, dd.align),
        level: oneOf(p.level, ["h1", "h2"] as const, dd.level),
      };
      return out as BlockPropsMap[T];
    }
    case "cards": {
      const dd = d as CardsProps;
      const out: CardsProps = {
        eyebrow: str(p.eyebrow, dd.eyebrow),
        heading: str(p.heading, dd.heading),
        blurb: str(p.blurb, dd.blurb),
        items: cardItems(p.items, dd.items),
        columns: oneOf(p.columns, COLS, dd.columns),
        style: oneOf(p.style, ["icon", "image"] as const, dd.style),
        tone: oneOf(p.tone, TONE, dd.tone),
        align: oneOf(p.align, ALIGN, dd.align),
        cta: cta(p.cta, dd.cta),
      };
      return out as BlockPropsMap[T];
    }
    case "textImage": {
      const dd = d as TextImageProps;
      const out: TextImageProps = {
        eyebrow: str(p.eyebrow, dd.eyebrow),
        heading: str(p.heading, dd.heading),
        paragraphs: strList(p.paragraphs, dd.paragraphs),
        cta: cta(p.cta, dd.cta),
        aside: oneOf(p.aside, ["image", "list"] as const, dd.aside),
        image: imageRef(p.image),
        listHeading: str(p.listHeading, dd.listHeading),
        listItems: strList(p.listItems, dd.listItems),
        asideSide: oneOf(p.asideSide, SIDE, dd.asideSide),
        tone: oneOf(p.tone, TONE, dd.tone),
      };
      return out as BlockPropsMap[T];
    }
    case "tags": {
      const dd = d as TagsProps;
      const out: TagsProps = {
        heading: str(p.heading, dd.heading),
        blurb: str(p.blurb, dd.blurb),
        items: strList(p.items, dd.items),
        cta: cta(p.cta, dd.cta),
        tone: oneOf(p.tone, TONE, dd.tone),
        align: oneOf(p.align, ALIGN, dd.align),
      };
      return out as BlockPropsMap[T];
    }
    case "gallery": {
      const dd = d as GalleryProps;
      const out: GalleryProps = {
        eyebrow: str(p.eyebrow, dd.eyebrow),
        heading: str(p.heading, dd.heading),
        blurb: str(p.blurb, dd.blurb),
        images: imageList(p.images),
        columns: oneOf(p.columns, COLS, dd.columns),
        tone: oneOf(p.tone, TONE, dd.tone),
      };
      return out as BlockPropsMap[T];
    }
    case "stats": {
      const dd = d as StatsProps;
      const out: StatsProps = {
        items: recList(p.items, dd.items, (x) => ({
          value: str(x.value, ""),
          label: str(x.label, ""),
        })),
        tone: oneOf(p.tone, TONE, dd.tone),
      };
      return out as BlockPropsMap[T];
    }
    case "testimonials": {
      const dd = d as TestimonialsProps;
      const out: TestimonialsProps = {
        eyebrow: str(p.eyebrow, dd.eyebrow),
        heading: str(p.heading, dd.heading),
        items: recList(p.items, dd.items, (x) => ({
          quote: str(x.quote, ""),
          name: str(x.name, ""),
          role: str(x.role, ""),
        })),
        columns: oneOf(p.columns, [2, 3] as const, dd.columns),
        tone: oneOf(p.tone, TONE, dd.tone),
      };
      return out as BlockPropsMap[T];
    }
    case "faq": {
      const dd = d as FaqProps;
      const out: FaqProps = {
        eyebrow: str(p.eyebrow, dd.eyebrow),
        heading: str(p.heading, dd.heading),
        blurb: str(p.blurb, dd.blurb),
        items: recList(p.items, dd.items, (x) => ({
          question: str(x.question, ""),
          answer: str(x.answer, ""),
        })),
        tone: oneOf(p.tone, TONE, dd.tone),
      };
      return out as BlockPropsMap[T];
    }
    case "cta": {
      const dd = d as CtaProps;
      const out: CtaProps = {
        heading: str(p.heading, dd.heading),
        blurb: str(p.blurb, dd.blurb),
        button: cta(p.button, dd.button),
        image: imageRef(p.image),
      };
      return out as BlockPropsMap[T];
    }
    case "categoriesGrid": {
      const dd = d as CategoriesGridProps;
      const out: CategoriesGridProps = {
        columns: oneOf(p.columns, [2, 3] as const, dd.columns),
        emptyMessage: str(p.emptyMessage, dd.emptyMessage),
      };
      return out as BlockPropsMap[T];
    }
    case "contact": {
      const dd = d as ContactProps;
      const out: ContactProps = {
        formHeading: str(p.formHeading, dd.formHeading),
        submitLabel: str(p.submitLabel, dd.submitLabel),
        successMessage: str(p.successMessage, dd.successMessage),
        areasHeading: str(p.areasHeading, dd.areasHeading),
        serviceAreas: strList(p.serviceAreas, dd.serviceAreas),
        hoursHeading: str(p.hoursHeading, dd.hoursHeading),
        hours: recList(p.hours, dd.hours, (x) => ({
          label: str(x.label, ""),
          value: str(x.value, ""),
        })),
        infoSide: oneOf(p.infoSide, SIDE, dd.infoSide),
      };
      return out as BlockPropsMap[T];
    }
  }
  return d;
}

/** Returns a fully-populated block, or null if the type is unknown. */
export function normalizeBlock(raw: unknown): Block | null {
  if (!isRec(raw)) return null;
  const type = raw.type;
  if (typeof type !== "string" || !(type in BLOCK_LIBRARY)) return null;
  const t = type as BlockType;
  const id =
    typeof raw.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(raw.id) ? raw.id : newBlockId();
  return {
    id,
    type: t,
    visible: raw.visible !== false,
    props: normalizeProps(t, raw.props),
  } as Block;
}

export function normalizeBlocks(raw: unknown, fallback: Block[]): Block[] {
  if (!Array.isArray(raw)) return fallback;
  const seen = new Set<string>();
  const out: Block[] = [];
  for (const item of raw.slice(0, 60)) {
    const block = normalizeBlock(item);
    if (!block) continue;
    if (seen.has(block.id)) block.id = newBlockId();
    seen.add(block.id);
    out.push(block);
  }
  return out;
}
