import {
  type Block,
  type BlockType,
  type CtaLink,
  createBlock,
  cta,
  isRec,
  normalizeBlocks,
  str,
  strList,
} from "./blocks";

export * from "./blocks";

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export type PageKey = "home" | "about" | "services" | "categories" | "contact";

export const PAGE_META: Record<PageKey, { label: string; path: string }> = {
  home: { label: "Home", path: "/" },
  about: { label: "About", path: "/about" },
  services: { label: "Services", path: "/services" },
  categories: { label: "Categories", path: "/categories" },
  contact: { label: "Contact", path: "/contact" },
};

export const PAGE_KEYS = Object.keys(PAGE_META) as PageKey[];

export interface SiteContent {
  brand: {
    name: string;
    navCta: CtaLink;
  };
  footer: {
    tagline: string;
    linksHeading: string;
    servicesHeading: string;
    services: string[];
    contactHeading: string;
    contactLines: string[];
    contactCtaLabel: string;
    copyright: string;
  };
  pages: Record<PageKey, Block[]>;
}

// ---------------------------------------------------------------------------
// Defaults — the site as it ships before any editing.
// ---------------------------------------------------------------------------

const ABOUT_P1 =
  "Top Furniture Supplies is focused on providing high-quality service and customer satisfaction — we will do everything we can to meet your expectations.";
const ABOUT_P2 =
  "Our company is based on the belief that our customers' needs are of the utmost importance. Our entire team is committed to meeting those needs. As a result, a high percentage of our business is from repeat customers and referrals.";

function defaultPages(): Record<PageKey, Block[]> {
  return {
    home: [
      createBlock(
        "hero",
        {
          eyebrow: "Sydney's Trusted Furniture Specialists",
          heading: "Crafted with care,\nbuilt to last.",
          subheading:
            "From custom cabinetry and built-in wardrobes to handcrafted dining tables and office fitouts — we bring your vision to life with quality timber and expert joinery.",
          primaryCta: { label: "Get a Free Quote", to: "/contact" },
          secondaryCta: { label: "Our Services", to: "/services" },
        },
        "home-hero",
      ),
      createBlock(
        "cards",
        {
          heading: "Categories We Service",
          blurb: "A wide range of furniture and joinery solutions for homes and businesses.",
          items: [
            {
              icon: "box",
              image: null,
              title: "Cabinet Making",
              desc: "Custom cabinets for kitchens, bathrooms and living spaces.",
            },
            {
              icon: "table",
              image: null,
              title: "Dining Tables",
              desc: "Handcrafted timber dining tables built to your specifications.",
            },
            {
              icon: "home",
              image: null,
              title: "Wardrobes",
              desc: "Built-in and standalone wardrobe solutions with smart storage.",
            },
            {
              icon: "treePine",
              image: null,
              title: "Outdoor Furniture",
              desc: "Durable, weather-resistant timber pieces for your garden.",
            },
          ],
          columns: 4,
          cta: { label: "View all categories →", to: "/categories" },
        },
        "home-categories",
      ),
      createBlock(
        "textImage",
        {
          eyebrow: "About Us",
          heading: "Enjoy your life with quality furniture",
          paragraphs: [ABOUT_P1, ABOUT_P2],
          cta: { label: "Learn More About Us", to: "/about" },
          aside: "list",
          listHeading: "Our Services Include",
          listItems: [
            "Wooden Parts",
            "Wooden Frames",
            "Chairs",
            "Tables",
            "Coffee Tables",
            "Buffets",
            "Entertainment Units",
            "Accessories",
            "Project Work",
            "Timber Stains",
          ],
        },
        "home-about",
      ),
      createBlock(
        "tags",
        {
          heading: "Areas We Service",
          blurb:
            "Proudly serving homes and businesses across Sydney's southwest, including Condell Park, Bankstown and surrounding suburbs.",
          items: [
            "Condell Park",
            "Bankstown",
            "Greenacre",
            "Yagoona",
            "Punchbowl",
            "Lakemba",
            "Bass Hill",
            "Chester Hill",
          ],
          cta: { label: "Not sure if we cover your area? Contact us →", to: "/contact" },
        },
        "home-areas",
      ),
      createBlock(
        "cta",
        {
          heading: "Ready to start your project?",
          blurb:
            "For all enquiries, contact us today. We'd love to earn your trust and deliver the best service in the industry.",
          button: { label: "Contact Us", to: "/contact" },
        },
        "home-cta",
      ),
    ],
    about: [
      createBlock(
        "intro",
        { eyebrow: "About Us", heading: "Enjoy your life", blurb: "", level: "h1" },
        "about-intro",
      ),
      createBlock(
        "textImage",
        {
          eyebrow: "",
          heading: "Built on trust and craftsmanship",
          paragraphs: [
            ABOUT_P1,
            ABOUT_P2,
            "We would welcome the opportunity to earn your trust and deliver you the best service in the industry.",
            "With a variety of offerings to choose from, we're sure you'll be happy working with us.",
          ],
          cta: { label: "Get in touch", to: "/contact" },
          aside: "image",
          asideSide: "left",
        },
        "about-story",
      ),
      createBlock(
        "cards",
        {
          heading: "",
          items: [
            {
              icon: "heartHandshake",
              image: null,
              title: "Customer First",
              desc: "Your needs are our top priority. We listen, adapt, and deliver results that exceed expectations.",
            },
            {
              icon: "wrench",
              image: null,
              title: "Quality Craftsmanship",
              desc: "Every piece is built with care using premium timber and proven joinery techniques.",
            },
            {
              icon: "shield",
              image: null,
              title: "Trusted Reputation",
              desc: "A high percentage of our work comes from repeat customers and referrals.",
            },
          ],
          columns: 3,
          tone: "plain",
        },
        "about-values",
      ),
    ],
    services: [
      createBlock(
        "intro",
        {
          eyebrow: "What We Do",
          heading: "Our Services",
          blurb:
            "From individual wooden parts to complete room fitouts, we provide a comprehensive range of furniture and joinery solutions.",
          level: "h1",
        },
        "services-intro",
      ),
      createBlock(
        "cards",
        {
          heading: "",
          items: [
            {
              icon: "puzzle",
              image: null,
              title: "Wooden Parts",
              desc: "Precision-cut wooden components for furniture assembly and restoration projects.",
            },
            {
              icon: "frame",
              image: null,
              title: "Wooden Frames",
              desc: "Sturdy, handcrafted timber frames for chairs, sofas, beds and custom builds.",
            },
            {
              icon: "armchair",
              image: null,
              title: "Chairs",
              desc: "Custom built chairs designed for comfort, style and durability.",
            },
            {
              icon: "table",
              image: null,
              title: "Tables",
              desc: "Dining tables, coffee tables, side tables and desks — all made to measure.",
            },
            {
              icon: "coffee",
              image: null,
              title: "Coffee Tables",
              desc: "Stylish centre-piece coffee tables in a range of timber finishes.",
            },
            {
              icon: "tv",
              image: null,
              title: "Entertainment Units",
              desc: "Custom entertainment units and media cabinets tailored to your space.",
            },
            {
              icon: "gem",
              image: null,
              title: "Accessories",
              desc: "Timber accessories including handles, trims, and decorative elements.",
            },
            {
              icon: "hammer",
              image: null,
              title: "Project Work",
              desc: "Bespoke project-based commissions from concept through to installation.",
            },
            {
              icon: "paintbrush",
              image: null,
              title: "Timber Stains",
              desc: "Professional staining and finishing services to protect and beautify your timber.",
            },
          ],
          columns: 3,
          tone: "plain",
        },
        "services-grid",
      ),
      createBlock(
        "cta",
        {
          heading: "Have something specific in mind?",
          blurb: "Every piece we make is built to order. Tell us about your project.",
          button: { label: "Request a Quote", to: "/contact" },
        },
        "services-cta",
      ),
    ],
    categories: [
      createBlock(
        "intro",
        { eyebrow: "What We Cover", heading: "Categories We Service", blurb: "", level: "h1" },
        "categories-intro",
      ),
      createBlock("categoriesGrid", {}, "categories-grid"),
    ],
    contact: [
      createBlock(
        "intro",
        {
          eyebrow: "Get in Touch",
          heading: "Contact Us",
          blurb:
            "For all enquiries, contact us today. We'd welcome the opportunity to earn your trust and deliver the best service in the industry.",
          level: "h1",
        },
        "contact-intro",
      ),
      createBlock(
        "contact",
        {
          serviceAreas: [
            "Condell Park, NSW",
            "Bankstown, NSW",
            "Greenacre, NSW",
            "Yagoona, NSW",
            "Surrounding Sydney suburbs",
          ],
          hours: [
            { label: "Monday – Saturday", value: "8:00 AM – 5:00 PM" },
            { label: "Sunday", value: "Closed" },
          ],
        },
        "contact-main",
      ),
    ],
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    name: "Top Furniture Supplies",
    navCta: { label: "Get a Quote", to: "/contact" },
  },
  footer: {
    tagline: "High-quality custom furniture, cabinetry, and joinery services across Sydney.",
    linksHeading: "Quick Links",
    servicesHeading: "Services",
    services: ["Cabinet Making", "Custom Furniture", "Joinery", "Wardrobes"],
    contactHeading: "Contact",
    contactLines: ["Condell Park, NSW", "Bankstown, NSW"],
    contactCtaLabel: "Get in Touch",
    copyright: "Top Furniture Supplies. All rights reserved.",
  },
  pages: defaultPages(),
};

// ---------------------------------------------------------------------------
// Normalisation + migrations
// ---------------------------------------------------------------------------

type Rec = Record<string, unknown>;

export function normalizeSiteContent(raw: unknown): SiteContent {
  const d = DEFAULT_SITE_CONTENT;
  let p: Rec = isRec(raw) ? raw : {};
  if (isLegacyV1(p)) p = migrateV1toV2(p);
  if (isV2(p)) p = migrateV2toV3(p);

  const brand = isRec(p.brand) ? p.brand : {};
  const footer = isRec(p.footer) ? p.footer : {};
  const pages = isRec(p.pages) ? p.pages : {};
  const defaults = defaultPages();

  return {
    brand: {
      name: str(brand.name, d.brand.name),
      navCta: cta(brand.navCta, d.brand.navCta),
    },
    footer: {
      tagline: str(footer.tagline, d.footer.tagline),
      linksHeading: str(footer.linksHeading, d.footer.linksHeading),
      servicesHeading: str(footer.servicesHeading, d.footer.servicesHeading),
      services: strList(footer.services, d.footer.services),
      contactHeading: str(footer.contactHeading, d.footer.contactHeading),
      contactLines: strList(footer.contactLines, d.footer.contactLines),
      contactCtaLabel: str(footer.contactCtaLabel, d.footer.contactCtaLabel),
      copyright: str(footer.copyright, d.footer.copyright),
    },
    pages: Object.fromEntries(
      PAGE_KEYS.map((k) => [k, normalizeBlocks(pages[k], defaults[k])]),
    ) as Record<PageKey, Block[]>,
  };
}

function isLegacyV1(p: Rec): boolean {
  return "homeCategories" in p || "homeAbout" in p || "aboutPage" in p || "servicesPage" in p;
}

function isV2(p: Rec): boolean {
  return !("pages" in p) && ("home" in p || "about" in p || "services" in p || "contact" in p);
}

/** Original flat CMS shape → the v2 nested-page shape (partial; v3 migration fills the rest). */
function migrateV1toV2(raw: Rec): Rec {
  const withIcons = (v: unknown, icons: string[]): unknown =>
    Array.isArray(v)
      ? v.map((x, i) => (isRec(x) ? { ...x, icon: icons[i] ?? "gem" } : x))
      : undefined;
  const homeAbout = isRec(raw.homeAbout) ? raw.homeAbout : {};
  const homeServices = isRec(raw.homeServices) ? raw.homeServices : {};
  const homeAreas = isRec(raw.homeAreas) ? raw.homeAreas : {};
  const aboutPage = isRec(raw.aboutPage) ? raw.aboutPage : {};
  const servicesPage = isRec(raw.servicesPage) ? raw.servicesPage : {};
  const contact = isRec(raw.contact) ? raw.contact : {};
  return {
    home: {
      categories: { items: withIcons(raw.homeCategories, ["box", "table", "home", "treePine"]) },
      about: {
        heading: homeAbout.heading,
        paragraphs: [homeAbout.paragraph1, homeAbout.paragraph2].filter(
          (x) => typeof x === "string",
        ),
        servicesHeading: homeServices.heading,
        services: homeServices.items,
      },
      areas: { heading: homeAreas.heading, blurb: homeAreas.blurb, suburbs: homeAreas.suburbs },
    },
    about: {
      intro: { heading: aboutPage.heading, paragraphs: aboutPage.paragraphs },
      values: { items: withIcons(aboutPage.values, ["heartHandshake", "wrench", "shield"]) },
    },
    services: {
      intro: { heading: servicesPage.heading, blurb: servicesPage.intro },
      grid: { items: servicesPage.items },
    },
    contact: {
      intro: { blurb: contact.intro },
      main: { serviceAreas: contact.serviceAreas, hours: contact.hours },
    },
  };
}

function defined(obj: Rec): Rec {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * v2 (fixed sections per page) → v3 (block list per page). Starts from the
 * default block of the same role so anything v2 didn't store keeps sensible
 * site-specific copy instead of generic library placeholders.
 */
function migrateV2toV3(raw: Rec): Rec {
  const defaults = defaultPages();
  const byId = (page: PageKey, id: string) => defaults[page].find((b) => b.id === id)!;

  function build(
    page: PageKey,
    defaultId: string,
    type: BlockType,
    props: Rec,
    visible: boolean | undefined,
  ): Rec {
    const base = byId(page, defaultId) ?? createBlock(type, {}, defaultId);
    return {
      id: base.id,
      type,
      visible: visible !== false,
      props: { ...base.props, ...defined(props) },
    };
  }

  function sectionOrder(pageRaw: Rec, fallback: string[]): { id: string; visible?: boolean }[] {
    const list = Array.isArray(pageRaw.sections)
      ? pageRaw.sections.filter(isRec).map((s) => ({
          id: String(s.id),
          visible: typeof s.visible === "boolean" ? s.visible : undefined,
        }))
      : [];
    const ids = new Set(list.map((s) => s.id));
    for (const id of fallback) if (!ids.has(id)) list.push({ id, visible: undefined });
    return list.filter((s) => fallback.includes(s.id));
  }

  const get = (o: unknown): Rec => (isRec(o) ? o : {});
  const pages: Partial<Record<PageKey, Rec[]>> = {};

  const home = get(raw.home);
  pages.home = sectionOrder(home, ["hero", "categories", "about", "areas", "cta"]).map((s) => {
    const v = s.visible;
    switch (s.id) {
      case "hero": {
        const h = get(home.hero);
        return build("home", "home-hero", "hero", h, v);
      }
      case "categories": {
        const c = get(home.categories);
        return build(
          "home",
          "home-categories",
          "cards",
          {
            eyebrow: c.eyebrow,
            heading: c.heading,
            blurb: c.blurb,
            items: c.items,
            columns: c.columns,
            tone: c.tone,
            align: c.align,
            cta:
              typeof c.ctaLabel === "string" ? { label: c.ctaLabel, to: "/categories" } : undefined,
          },
          v,
        );
      }
      case "about": {
        const a = get(home.about);
        return build(
          "home",
          "home-about",
          "textImage",
          {
            eyebrow: a.eyebrow,
            heading: a.heading,
            paragraphs: a.paragraphs,
            cta: typeof a.ctaLabel === "string" ? { label: a.ctaLabel, to: "/about" } : undefined,
            listHeading: a.servicesHeading,
            listItems: a.services,
            asideSide: a.boxSide,
            tone: a.tone,
          },
          v,
        );
      }
      case "areas": {
        const a = get(home.areas);
        return build(
          "home",
          "home-areas",
          "tags",
          {
            heading: a.heading,
            blurb: a.blurb,
            items: a.suburbs,
            cta: typeof a.ctaLabel === "string" ? { label: a.ctaLabel, to: "/contact" } : undefined,
            tone: a.tone,
            align: a.align,
          },
          v,
        );
      }
      default: {
        const c = get(home.cta);
        return build("home", "home-cta", "cta", c, v);
      }
    }
  });

  const about = get(raw.about);
  pages.about = sectionOrder(about, ["intro", "values"]).flatMap((s) => {
    if (s.id === "intro") {
      const i = get(about.intro);
      const paragraphs = Array.isArray(i.paragraphs) ? i.paragraphs : undefined;
      return [
        build(
          "about",
          "about-intro",
          "intro",
          { eyebrow: i.eyebrow, heading: i.heading, align: i.align },
          s.visible,
        ),
        build("about", "about-story", "textImage", { paragraphs }, s.visible),
      ];
    }
    const val = get(about.values);
    return [
      build(
        "about",
        "about-values",
        "cards",
        { items: val.items, columns: val.columns },
        s.visible,
      ),
    ];
  });

  const services = get(raw.services);
  pages.services = sectionOrder(services, ["intro", "grid"]).map((s) => {
    if (s.id === "intro") {
      const i = get(services.intro);
      return build(
        "services",
        "services-intro",
        "intro",
        { eyebrow: i.eyebrow, heading: i.heading, blurb: i.blurb, align: i.align },
        s.visible,
      );
    }
    const g = get(services.grid);
    return build(
      "services",
      "services-grid",
      "cards",
      { items: g.items, columns: g.columns },
      s.visible,
    );
  });
  pages.services.push(byId("services", "services-cta") as unknown as Rec);

  const categories = get(raw.categories);
  pages.categories = sectionOrder(categories, ["intro", "grid"]).map((s) => {
    if (s.id === "intro") {
      const i = get(categories.intro);
      return build(
        "categories",
        "categories-intro",
        "intro",
        { eyebrow: i.eyebrow, heading: i.heading, blurb: i.blurb, align: i.align },
        s.visible,
      );
    }
    const g = get(categories.grid);
    return build("categories", "categories-grid", "categoriesGrid", g, s.visible);
  });

  const contact = get(raw.contact);
  pages.contact = sectionOrder(contact, ["intro", "main"]).map((s) => {
    if (s.id === "intro") {
      const i = get(contact.intro);
      return build(
        "contact",
        "contact-intro",
        "intro",
        { eyebrow: i.eyebrow, heading: i.heading, blurb: i.blurb },
        s.visible,
      );
    }
    return build("contact", "contact-main", "contact", get(contact.main), s.visible);
  });

  return { brand: raw.brand, footer: raw.footer, pages };
}

// ---------------------------------------------------------------------------
// Path helpers — the editor addresses fields with dot paths such as
// "pages.home.2.props.items.1.title".
// ---------------------------------------------------------------------------

export function getAtPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Rec)[key];
  }, obj);
}

export function setAtPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  function recurse(node: unknown, depth: number): unknown {
    const key = keys[depth];
    const isLast = depth === keys.length - 1;
    if (Array.isArray(node)) {
      const copy = node.slice();
      copy[Number(key)] = isLast ? value : recurse(node[Number(key)], depth + 1);
      return copy;
    }
    const base = isRec(node) ? node : {};
    return { ...base, [key]: isLast ? value : recurse(base[key], depth + 1) };
  }
  return recurse(obj, 0) as T;
}

/** Moves an array element; returns the same array if nothing changes. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// ---------------------------------------------------------------------------
// Fetch / save with a small in-memory cache
// ---------------------------------------------------------------------------

let cache: { data: SiteContent; timestamp: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export function getCachedSiteContent(): SiteContent | null {
  return cache && Date.now() - cache.timestamp < TTL_MS ? cache.data : null;
}

export async function fetchSiteContent(options?: { fresh?: boolean }): Promise<SiteContent> {
  const cached = options?.fresh ? null : getCachedSiteContent();
  if (cached) return cached;
  try {
    const res = await fetch(
      "/api/site-content",
      options?.fresh ? { cache: "no-store" } : undefined,
    );
    if (!res.ok) throw new Error("Failed to load site content");
    const data = await res.json();
    const merged = normalizeSiteContent(data.content);
    cache = { data: merged, timestamp: Date.now() };
    return merged;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const clean = normalizeSiteContent(content);
  const res = await fetch("/api/site-content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: clean }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(res.status === 401 ? "Unauthorized" : data.error || "Failed to save content");
  }
  cache = { data: clean, timestamp: Date.now() };
  return clean;
}
