import type { ComponentType } from "react";
import type { PageKey } from "@/lib/siteContent";
import { useSiteContent } from "./content-context";
import { HOME_SECTIONS } from "./sections/home";
import { ABOUT_SECTIONS } from "./sections/about";
import { SERVICES_SECTIONS } from "./sections/services";
import { CATEGORIES_SECTIONS } from "./sections/categories";
import { CONTACT_SECTIONS } from "./sections/contact";

const REGISTRY: Record<PageKey, Record<string, ComponentType>> = {
  home: HOME_SECTIONS,
  about: ABOUT_SECTIONS,
  services: SERVICES_SECTIONS,
  categories: CATEGORIES_SECTIONS,
  contact: CONTACT_SECTIONS,
};

/** Renders a page's sections in the order (and visibility) configured in site content. */
export default function PageSections({ page }: { page: PageKey }) {
  const content = useSiteContent();
  const sections = content[page].sections as { id: string; visible: boolean }[];
  const components = REGISTRY[page];
  return (
    <>
      {sections.map(({ id }) => {
        const Component = components[id];
        return Component ? <Component key={id} /> : null;
      })}
    </>
  );
}
