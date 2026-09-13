export interface TextPair {
  title: string;
  desc: string;
}

export interface HoursRow {
  label: string;
  value: string;
}

export interface SiteContent {
  homeCategories: TextPair[]; // exactly 4 — the "Categories We Service" preview cards
  homeAbout: {
    heading: string;
    paragraph1: string;
    paragraph2: string;
  };
  homeServices: {
    heading: string;
    items: string[];
  };
  homeAreas: {
    heading: string;
    blurb: string;
    suburbs: string[];
  };
  aboutPage: {
    heading: string;
    paragraphs: string[];
    values: TextPair[]; // exactly 3 — the "Customer First" style cards
  };
  servicesPage: {
    heading: string;
    intro: string;
    items: TextPair[];
  };
  contact: {
    intro: string;
    serviceAreas: string[];
    hours: HoursRow[];
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  homeCategories: [
    { title: "Cabinet Making", desc: "Custom cabinets for kitchens, bathrooms and living spaces." },
    {
      title: "Dining Tables",
      desc: "Handcrafted timber dining tables built to your specifications.",
    },
    { title: "Wardrobes", desc: "Built-in and standalone wardrobe solutions with smart storage." },
    {
      title: "Outdoor Furniture",
      desc: "Durable, weather-resistant timber pieces for your garden.",
    },
  ],
  homeAbout: {
    heading: "Enjoy your life with quality furniture",
    paragraph1:
      "Top Furniture Supplies is focused on providing high-quality service and customer satisfaction — we will do everything we can to meet your expectations.",
    paragraph2:
      "Our company is based on the belief that our customers' needs are of the utmost importance. Our entire team is committed to meeting those needs. As a result, a high percentage of our business is from repeat customers and referrals.",
  },
  homeServices: {
    heading: "Our Services Include",
    items: [
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
  homeAreas: {
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
  },
  aboutPage: {
    heading: "Enjoy your life",
    paragraphs: [
      "Top Furniture Supplies is focused on providing high-quality service and customer satisfaction — we will do everything we can to meet your expectations.",
      "Our company is based on the belief that our customers' needs are of the utmost importance. Our entire team is committed to meeting those needs. As a result, a high percentage of our business is from repeat customers and referrals.",
      "We would welcome the opportunity to earn your trust and deliver you the best service in the industry.",
      "With a variety of offerings to choose from, we're sure you'll be happy working with us.",
    ],
    values: [
      {
        title: "Customer First",
        desc: "Your needs are our top priority. We listen, adapt, and deliver results that exceed expectations.",
      },
      {
        title: "Quality Craftsmanship",
        desc: "Every piece is built with care using premium timber and proven joinery techniques.",
      },
      {
        title: "Trusted Reputation",
        desc: "A high percentage of our work comes from repeat customers and referrals.",
      },
    ],
  },
  servicesPage: {
    heading: "Our Services",
    intro:
      "From individual wooden parts to complete room fitouts, we provide a comprehensive range of furniture and joinery solutions.",
    items: [
      {
        title: "Wooden Parts",
        desc: "Precision-cut wooden components for furniture assembly and restoration projects.",
      },
      {
        title: "Wooden Frames",
        desc: "Sturdy, handcrafted timber frames for chairs, sofas, beds and custom builds.",
      },
      { title: "Chairs", desc: "Custom built chairs designed for comfort, style and durability." },
      {
        title: "Tables",
        desc: "Dining tables, coffee tables, side tables and desks — all made to measure.",
      },
      {
        title: "Coffee Tables",
        desc: "Stylish centre-piece coffee tables in a range of timber finishes.",
      },
      {
        title: "Entertainment Units",
        desc: "Custom entertainment units and media cabinets tailored to your space.",
      },
      {
        title: "Accessories",
        desc: "Timber accessories including handles, trims, and decorative elements.",
      },
      {
        title: "Project Work",
        desc: "Bespoke project-based commissions from concept through to installation.",
      },
      {
        title: "Timber Stains",
        desc: "Professional staining and finishing services to protect and beautify your timber.",
      },
    ],
  },
  contact: {
    intro:
      "For all enquiries, contact us today. We'd welcome the opportunity to earn your trust and deliver the best service in the industry.",
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
};

function keepLength<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length === fallback.length ? (value as T[]) : fallback;
}

function mergeWithDefaults(partial: unknown): SiteContent {
  if (!partial || typeof partial !== "object") return DEFAULT_SITE_CONTENT;
  const p = partial as Partial<SiteContent>;
  const d = DEFAULT_SITE_CONTENT;
  return {
    homeCategories: keepLength(p.homeCategories, d.homeCategories),
    homeAbout: { ...d.homeAbout, ...p.homeAbout },
    homeServices: {
      heading: p.homeServices?.heading ?? d.homeServices.heading,
      items: keepLength(p.homeServices?.items, d.homeServices.items),
    },
    homeAreas: {
      heading: p.homeAreas?.heading ?? d.homeAreas.heading,
      blurb: p.homeAreas?.blurb ?? d.homeAreas.blurb,
      suburbs: keepLength(p.homeAreas?.suburbs, d.homeAreas.suburbs),
    },
    aboutPage: {
      heading: p.aboutPage?.heading ?? d.aboutPage.heading,
      paragraphs: keepLength(p.aboutPage?.paragraphs, d.aboutPage.paragraphs),
      values: keepLength(p.aboutPage?.values, d.aboutPage.values),
    },
    servicesPage: {
      heading: p.servicesPage?.heading ?? d.servicesPage.heading,
      intro: p.servicesPage?.intro ?? d.servicesPage.intro,
      items: keepLength(p.servicesPage?.items, d.servicesPage.items),
    },
    contact: {
      intro: p.contact?.intro ?? d.contact.intro,
      serviceAreas: keepLength(p.contact?.serviceAreas, d.contact.serviceAreas),
      hours: keepLength(p.contact?.hours, d.contact.hours),
    },
  };
}

let cache: { data: SiteContent; timestamp: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export function getCachedSiteContent(): SiteContent | null {
  return cache && Date.now() - cache.timestamp < TTL_MS ? cache.data : null;
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const cached = getCachedSiteContent();
  if (cached) return cached;
  try {
    const res = await fetch("/api/site-content");
    if (!res.ok) throw new Error("Failed to load site content");
    const data = await res.json();
    const merged = mergeWithDefaults(data.content);
    cache = { data: merged, timestamp: Date.now() };
    return merged;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const res = await fetch("/api/site-content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to save content");
  }
  cache = { data: content, timestamp: Date.now() };
}
