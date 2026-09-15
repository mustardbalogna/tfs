import { ICON_NAMES, type IconName } from "@/components/site/icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SectionTone = "plain" | "card" | "tinted";
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

export interface IconItem {
  icon: IconName;
  title: string;
  desc: string;
}

export interface HoursRow {
  label: string;
  value: string;
}

export interface SectionConfig<Id extends string = string> {
  id: Id;
  visible: boolean;
}

export type HomeSectionId = "hero" | "categories" | "about" | "areas" | "cta";
export type AboutSectionId = "intro" | "values";
export type ServicesSectionId = "intro" | "grid";
export type CategoriesSectionId = "intro" | "grid";
export type ContactSectionId = "intro" | "main";

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
  home: {
    sections: SectionConfig<HomeSectionId>[];
    hero: {
      eyebrow: string;
      heading: string;
      subheading: string;
      primaryCta: CtaLink;
      secondaryCta: CtaLink;
      overlay: "light" | "medium" | "dark";
    };
    categories: {
      eyebrow: string;
      heading: string;
      blurb: string;
      items: IconItem[];
      columns: Columns;
      ctaLabel: string;
      tone: SectionTone;
      align: Align;
    };
    about: {
      eyebrow: string;
      heading: string;
      paragraphs: string[];
      ctaLabel: string;
      servicesHeading: string;
      services: string[];
      boxSide: Side;
      tone: SectionTone;
    };
    areas: {
      heading: string;
      blurb: string;
      suburbs: string[];
      ctaLabel: string;
      tone: SectionTone;
      align: Align;
    };
    cta: {
      heading: string;
      blurb: string;
      button: CtaLink;
    };
  };
  about: {
    sections: SectionConfig<AboutSectionId>[];
    intro: {
      eyebrow: string;
      heading: string;
      paragraphs: string[];
      align: Align;
    };
    values: {
      items: IconItem[];
      columns: Columns;
    };
  };
  services: {
    sections: SectionConfig<ServicesSectionId>[];
    intro: {
      eyebrow: string;
      heading: string;
      blurb: string;
      align: Align;
    };
    grid: {
      items: IconItem[];
      columns: Columns;
    };
  };
  categories: {
    sections: SectionConfig<CategoriesSectionId>[];
    intro: {
      eyebrow: string;
      heading: string;
      blurb: string;
      align: Align;
    };
    grid: {
      columns: 2 | 3;
      emptyMessage: string;
    };
  };
  contact: {
    sections: SectionConfig<ContactSectionId>[];
    intro: {
      eyebrow: string;
      heading: string;
      blurb: string;
    };
    main: {
      formHeading: string;
      submitLabel: string;
      successMessage: string;
      areasHeading: string;
      serviceAreas: string[];
      hoursHeading: string;
      hours: HoursRow[];
      infoSide: Side;
    };
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
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    name: "Top Furniture Supplies",
    navCta: { label: "Get a Quote", to: "/contact" },
  },
  home: {
    sections: [
      { id: "hero", visible: true },
      { id: "categories", visible: true },
      { id: "about", visible: true },
      { id: "areas", visible: true },
      { id: "cta", visible: true },
    ],
    hero: {
      eyebrow: "Sydney's Trusted Furniture Specialists",
      heading: "Crafted with care,\nbuilt to last.",
      subheading:
        "From custom cabinetry and built-in wardrobes to handcrafted dining tables and office fitouts — we bring your vision to life with quality timber and expert joinery.",
      primaryCta: { label: "Get a Free Quote", to: "/contact" },
      secondaryCta: { label: "Our Services", to: "/services" },
      overlay: "medium",
    },
    categories: {
      eyebrow: "",
      heading: "Categories We Service",
      blurb: "A wide range of furniture and joinery solutions for homes and businesses.",
      items: [
        {
          icon: "box",
          title: "Cabinet Making",
          desc: "Custom cabinets for kitchens, bathrooms and living spaces.",
        },
        {
          icon: "table",
          title: "Dining Tables",
          desc: "Handcrafted timber dining tables built to your specifications.",
        },
        {
          icon: "home",
          title: "Wardrobes",
          desc: "Built-in and standalone wardrobe solutions with smart storage.",
        },
        {
          icon: "treePine",
          title: "Outdoor Furniture",
          desc: "Durable, weather-resistant timber pieces for your garden.",
        },
      ],
      columns: 4,
      ctaLabel: "View all categories →",
      tone: "card",
      align: "center",
    },
    about: {
      eyebrow: "About Us",
      heading: "Enjoy your life with quality furniture",
      paragraphs: [
        "Top Furniture Supplies is focused on providing high-quality service and customer satisfaction — we will do everything we can to meet your expectations.",
        "Our company is based on the belief that our customers' needs are of the utmost importance. Our entire team is committed to meeting those needs. As a result, a high percentage of our business is from repeat customers and referrals.",
      ],
      ctaLabel: "Learn More About Us",
      servicesHeading: "Our Services Include",
      services: [
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
      boxSide: "right",
      tone: "plain",
    },
    areas: {
      heading: "Areas We Service",
      blurb:
        "Proudly serving homes and businesses across Sydney's southwest, including Condell Park, Bankstown and surrounding suburbs.",
      suburbs: [
        "Condell Park",
        "Bankstown",
        "Greenacre",
        "Yagoona",
        "Punchbowl",
        "Lakemba",
        "Bass Hill",
        "Chester Hill",
      ],
      ctaLabel: "Not sure if we cover your area? Contact us →",
      tone: "tinted",
      align: "center",
    },
    cta: {
      heading: "Ready to start your project?",
      blurb:
        "For all enquiries, contact us today. We'd love to earn your trust and deliver the best service in the industry.",
      button: { label: "Contact Us", to: "/contact" },
    },
  },
  about: {
    sections: [
      { id: "intro", visible: true },
      { id: "values", visible: true },
    ],
    intro: {
      eyebrow: "About Us",
      heading: "Enjoy your life",
      paragraphs: [
        "Top Furniture Supplies is focused on providing high-quality service and customer satisfaction — we will do everything we can to meet your expectations.",
        "Our company is based on the belief that our customers' needs are of the utmost importance. Our entire team is committed to meeting those needs. As a result, a high percentage of our business is from repeat customers and referrals.",
        "We would welcome the opportunity to earn your trust and deliver you the best service in the industry.",
        "With a variety of offerings to choose from, we're sure you'll be happy working with us.",
      ],
      align: "center",
    },
    values: {
      items: [
        {
          icon: "heartHandshake",
          title: "Customer First",
          desc: "Your needs are our top priority. We listen, adapt, and deliver results that exceed expectations.",
        },
        {
          icon: "wrench",
          title: "Quality Craftsmanship",
          desc: "Every piece is built with care using premium timber and proven joinery techniques.",
        },
        {
          icon: "shield",
          title: "Trusted Reputation",
          desc: "A high percentage of our work comes from repeat customers and referrals.",
        },
      ],
      columns: 3,
    },
  },
  services: {
    sections: [
      { id: "intro", visible: true },
      { id: "grid", visible: true },
    ],
    intro: {
      eyebrow: "What We Do",
      heading: "Our Services",
      blurb:
        "From individual wooden parts to complete room fitouts, we provide a comprehensive range of furniture and joinery solutions.",
      align: "center",
    },
    grid: {
      items: [
        {
          icon: "puzzle",
          title: "Wooden Parts",
          desc: "Precision-cut wooden components for furniture assembly and restoration projects.",
        },
        {
          icon: "frame",
          title: "Wooden Frames",
          desc: "Sturdy, handcrafted timber frames for chairs, sofas, beds and custom builds.",
        },
        {
          icon: "armchair",
          title: "Chairs",
          desc: "Custom built chairs designed for comfort, style and durability.",
        },
        {
          icon: "table",
          title: "Tables",
          desc: "Dining tables, coffee tables, side tables and desks — all made to measure.",
        },
        {
          icon: "coffee",
          title: "Coffee Tables",
          desc: "Stylish centre-piece coffee tables in a range of timber finishes.",
        },
        {
          icon: "tv",
          title: "Entertainment Units",
          desc: "Custom entertainment units and media cabinets tailored to your space.",
        },
        {
          icon: "gem",
          title: "Accessories",
          desc: "Timber accessories including handles, trims, and decorative elements.",
        },
        {
          icon: "hammer",
          title: "Project Work",
          desc: "Bespoke project-based commissions from concept through to installation.",
        },
        {
          icon: "paintbrush",
          title: "Timber Stains",
          desc: "Professional staining and finishing services to protect and beautify your timber.",
        },
      ],
      columns: 3,
    },
  },
  categories: {
    sections: [
      { id: "intro", visible: true },
      { id: "grid", visible: true },
    ],
    intro: {
      eyebrow: "What We Cover",
      heading: "Categories We Service",
      blurb: "",
      align: "center",
    },
    grid: {
      columns: 3,
      emptyMessage: "No categories to display yet.",
    },
  },
  contact: {
    sections: [
      { id: "intro", visible: true },
      { id: "main", visible: true },
    ],
    intro: {
      eyebrow: "Get in Touch",
      heading: "Contact Us",
      blurb:
        "For all enquiries, contact us today. We'd welcome the opportunity to earn your trust and deliver the best service in the industry.",
    },
    main: {
      formHeading: "Send us a message",
      submitLabel: "Send Enquiry",
      successMessage: "Thanks! Your message has been sent.",
      areasHeading: "Service Areas",
      serviceAreas: [
        "Condell Park, NSW",
        "Bankstown, NSW",
        "Greenacre, NSW",
        "Yagoona, NSW",
        "Surrounding Sydney suburbs",
      ],
      hoursHeading: "Business Hours",
      hours: [
        { label: "Monday – Saturday", value: "8:00 AM – 5:00 PM" },
        { label: "Sunday", value: "Closed" },
      ],
      infoSide: "right",
    },
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
};

// ---------------------------------------------------------------------------
// Limits (mirrored loosely by the API's structural sanitiser)
// ---------------------------------------------------------------------------

export const CONTENT_LIMITS = {
  text: 2000,
  listItems: 40,
} as const;

// ---------------------------------------------------------------------------
// Normalisation — coerces anything (old saved shapes, partial objects, junk)
// into a fully-populated, type-safe SiteContent.
// ---------------------------------------------------------------------------

type Rec = Record<string, unknown>;

function isRec(v: unknown): v is Rec {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v.slice(0, CONTENT_LIMITS.text) : fallback;
}

function oneOf<T extends string | number>(v: unknown, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly unknown[]).includes(v) ? (v as T) : fallback;
}

function strList(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  return v
    .filter((x): x is string => typeof x === "string")
    .slice(0, CONTENT_LIMITS.listItems)
    .map((s) => s.slice(0, CONTENT_LIMITS.text));
}

function iconName(v: unknown, fallback: IconName): IconName {
  return oneOf(v, ICON_NAMES, fallback);
}

function iconItems(v: unknown, fallback: IconItem[]): IconItem[] {
  if (!Array.isArray(v)) return fallback;
  return v
    .filter(isRec)
    .slice(0, CONTENT_LIMITS.listItems)
    .map((x, i) => ({
      icon: iconName(x.icon, fallback[i]?.icon ?? "gem"),
      title: str(x.title, ""),
      desc: str(x.desc, ""),
    }));
}

function hoursRows(v: unknown, fallback: HoursRow[]): HoursRow[] {
  if (!Array.isArray(v)) return fallback;
  return v
    .filter(isRec)
    .slice(0, CONTENT_LIMITS.listItems)
    .map((x) => ({ label: str(x.label, ""), value: str(x.value, "") }));
}

function route(v: unknown, fallback: InternalRoute): InternalRoute {
  return oneOf(
    v,
    INTERNAL_ROUTES.map((r) => r.value),
    fallback,
  );
}

function cta(v: unknown, fallback: CtaLink): CtaLink {
  if (!isRec(v)) return fallback;
  return { label: str(v.label, fallback.label), to: route(v.to, fallback.to) };
}

function sections<Id extends string>(
  v: unknown,
  fallback: SectionConfig<Id>[],
): SectionConfig<Id>[] {
  const allowed = fallback.map((s) => s.id);
  const seen = new Set<Id>();
  const out: SectionConfig<Id>[] = [];
  if (Array.isArray(v)) {
    for (const item of v) {
      if (!isRec(item)) continue;
      const id = item.id;
      if (typeof id !== "string" || !allowed.includes(id as Id) || seen.has(id as Id)) continue;
      seen.add(id as Id);
      out.push({ id: id as Id, visible: item.visible !== false });
    }
  }
  // Any section missing from the saved order is appended so new sections
  // added in code still show up for existing installs.
  for (const s of fallback) if (!seen.has(s.id)) out.push({ ...s });
  return out;
}

const ALIGN: readonly Align[] = ["left", "center"];
const TONE: readonly SectionTone[] = ["plain", "card", "tinted"];
const SIDE: readonly Side[] = ["left", "right"];
const COLS: readonly Columns[] = [2, 3, 4];

export function normalizeSiteContent(raw: unknown): SiteContent {
  const d = DEFAULT_SITE_CONTENT;
  const p = isRec(raw) ? migrateLegacy(raw) : {};

  const brand = isRec(p.brand) ? p.brand : {};
  const home = isRec(p.home) ? p.home : {};
  const hero = isRec(home.hero) ? home.hero : {};
  const hCats = isRec(home.categories) ? home.categories : {};
  const hAbout = isRec(home.about) ? home.about : {};
  const hAreas = isRec(home.areas) ? home.areas : {};
  const hCta = isRec(home.cta) ? home.cta : {};
  const about = isRec(p.about) ? p.about : {};
  const aIntro = isRec(about.intro) ? about.intro : {};
  const aValues = isRec(about.values) ? about.values : {};
  const services = isRec(p.services) ? p.services : {};
  const sIntro = isRec(services.intro) ? services.intro : {};
  const sGrid = isRec(services.grid) ? services.grid : {};
  const categories = isRec(p.categories) ? p.categories : {};
  const cIntro = isRec(categories.intro) ? categories.intro : {};
  const cGrid = isRec(categories.grid) ? categories.grid : {};
  const contact = isRec(p.contact) ? p.contact : {};
  const ctIntro = isRec(contact.intro) ? contact.intro : {};
  const ctMain = isRec(contact.main) ? contact.main : {};
  const footer = isRec(p.footer) ? p.footer : {};

  return {
    brand: {
      name: str(brand.name, d.brand.name),
      navCta: cta(brand.navCta, d.brand.navCta),
    },
    home: {
      sections: sections(home.sections, d.home.sections),
      hero: {
        eyebrow: str(hero.eyebrow, d.home.hero.eyebrow),
        heading: str(hero.heading, d.home.hero.heading),
        subheading: str(hero.subheading, d.home.hero.subheading),
        primaryCta: cta(hero.primaryCta, d.home.hero.primaryCta),
        secondaryCta: cta(hero.secondaryCta, d.home.hero.secondaryCta),
        overlay: oneOf(hero.overlay, ["light", "medium", "dark"] as const, d.home.hero.overlay),
      },
      categories: {
        eyebrow: str(hCats.eyebrow, d.home.categories.eyebrow),
        heading: str(hCats.heading, d.home.categories.heading),
        blurb: str(hCats.blurb, d.home.categories.blurb),
        items: iconItems(hCats.items, d.home.categories.items),
        columns: oneOf(hCats.columns, COLS, d.home.categories.columns),
        ctaLabel: str(hCats.ctaLabel, d.home.categories.ctaLabel),
        tone: oneOf(hCats.tone, TONE, d.home.categories.tone),
        align: oneOf(hCats.align, ALIGN, d.home.categories.align),
      },
      about: {
        eyebrow: str(hAbout.eyebrow, d.home.about.eyebrow),
        heading: str(hAbout.heading, d.home.about.heading),
        paragraphs: strList(hAbout.paragraphs, d.home.about.paragraphs),
        ctaLabel: str(hAbout.ctaLabel, d.home.about.ctaLabel),
        servicesHeading: str(hAbout.servicesHeading, d.home.about.servicesHeading),
        services: strList(hAbout.services, d.home.about.services),
        boxSide: oneOf(hAbout.boxSide, SIDE, d.home.about.boxSide),
        tone: oneOf(hAbout.tone, TONE, d.home.about.tone),
      },
      areas: {
        heading: str(hAreas.heading, d.home.areas.heading),
        blurb: str(hAreas.blurb, d.home.areas.blurb),
        suburbs: strList(hAreas.suburbs, d.home.areas.suburbs),
        ctaLabel: str(hAreas.ctaLabel, d.home.areas.ctaLabel),
        tone: oneOf(hAreas.tone, TONE, d.home.areas.tone),
        align: oneOf(hAreas.align, ALIGN, d.home.areas.align),
      },
      cta: {
        heading: str(hCta.heading, d.home.cta.heading),
        blurb: str(hCta.blurb, d.home.cta.blurb),
        button: cta(hCta.button, d.home.cta.button),
      },
    },
    about: {
      sections: sections(about.sections, d.about.sections),
      intro: {
        eyebrow: str(aIntro.eyebrow, d.about.intro.eyebrow),
        heading: str(aIntro.heading, d.about.intro.heading),
        paragraphs: strList(aIntro.paragraphs, d.about.intro.paragraphs),
        align: oneOf(aIntro.align, ALIGN, d.about.intro.align),
      },
      values: {
        items: iconItems(aValues.items, d.about.values.items),
        columns: oneOf(aValues.columns, COLS, d.about.values.columns),
      },
    },
    services: {
      sections: sections(services.sections, d.services.sections),
      intro: {
        eyebrow: str(sIntro.eyebrow, d.services.intro.eyebrow),
        heading: str(sIntro.heading, d.services.intro.heading),
        blurb: str(sIntro.blurb, d.services.intro.blurb),
        align: oneOf(sIntro.align, ALIGN, d.services.intro.align),
      },
      grid: {
        items: iconItems(sGrid.items, d.services.grid.items),
        columns: oneOf(sGrid.columns, COLS, d.services.grid.columns),
      },
    },
    categories: {
      sections: sections(categories.sections, d.categories.sections),
      intro: {
        eyebrow: str(cIntro.eyebrow, d.categories.intro.eyebrow),
        heading: str(cIntro.heading, d.categories.intro.heading),
        blurb: str(cIntro.blurb, d.categories.intro.blurb),
        align: oneOf(cIntro.align, ALIGN, d.categories.intro.align),
      },
      grid: {
        columns: oneOf(cGrid.columns, [2, 3] as const, d.categories.grid.columns),
        emptyMessage: str(cGrid.emptyMessage, d.categories.grid.emptyMessage),
      },
    },
    contact: {
      sections: sections(contact.sections, d.contact.sections),
      intro: {
        eyebrow: str(ctIntro.eyebrow, d.contact.intro.eyebrow),
        heading: str(ctIntro.heading, d.contact.intro.heading),
        blurb: str(ctIntro.blurb, d.contact.intro.blurb),
      },
      main: {
        formHeading: str(ctMain.formHeading, d.contact.main.formHeading),
        submitLabel: str(ctMain.submitLabel, d.contact.main.submitLabel),
        successMessage: str(ctMain.successMessage, d.contact.main.successMessage),
        areasHeading: str(ctMain.areasHeading, d.contact.main.areasHeading),
        serviceAreas: strList(ctMain.serviceAreas, d.contact.main.serviceAreas),
        hoursHeading: str(ctMain.hoursHeading, d.contact.main.hoursHeading),
        hours: hoursRows(ctMain.hours, d.contact.main.hours),
        infoSide: oneOf(ctMain.infoSide, SIDE, d.contact.main.infoSide),
      },
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
  };
}

/**
 * Maps the original flat CMS shape (homeCategories / homeAbout / aboutPage /
 * servicesPage / contact...) into the current nested shape so content saved
 * before the visual editor existed isn't lost on first load.
 */
function migrateLegacy(raw: Rec): Rec {
  const isLegacy =
    "homeCategories" in raw || "homeAbout" in raw || "aboutPage" in raw || "servicesPage" in raw;
  if (!isLegacy) return raw;

  const d = DEFAULT_SITE_CONTENT;
  const legacyPairs = (v: unknown, icons: IconName[]): unknown =>
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
      categories: {
        items: legacyPairs(
          raw.homeCategories,
          d.home.categories.items.map((i) => i.icon),
        ),
      },
      about: {
        heading: homeAbout.heading,
        paragraphs: [homeAbout.paragraph1, homeAbout.paragraph2].filter(
          (x) => typeof x === "string",
        ),
        servicesHeading: homeServices.heading,
        services: homeServices.items,
      },
      areas: {
        heading: homeAreas.heading,
        blurb: homeAreas.blurb,
        suburbs: homeAreas.suburbs,
      },
    },
    about: {
      intro: { heading: aboutPage.heading, paragraphs: aboutPage.paragraphs },
      values: {
        items: legacyPairs(
          aboutPage.values,
          d.about.values.items.map((i) => i.icon),
        ),
      },
    },
    services: {
      intro: { heading: servicesPage.heading, blurb: servicesPage.intro },
      grid: {
        items: legacyPairs(
          servicesPage.items,
          d.services.grid.items.map((i) => i.icon),
        ),
      },
    },
    contact: {
      intro: { blurb: contact.intro },
      main: { serviceAreas: contact.serviceAreas, hours: contact.hours },
    },
  };
}

// ---------------------------------------------------------------------------
// Path helpers — the visual editor addresses fields with dot paths such as
// "home.about.paragraphs.1" so a single generic update function can serve
// every editable element.
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
