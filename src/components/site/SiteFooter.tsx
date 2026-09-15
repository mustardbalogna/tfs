import { Link } from "react-router-dom";
import { PAGE_KEYS, PAGE_META } from "@/lib/siteContent";
import { useSiteContent } from "./content-context";
import { AddItem, EditableText, ListItem } from "./editable";

const FOOTER_LINKS = PAGE_KEYS.filter((k) => k !== "home").map((k) => PAGE_META[k]);

export default function SiteFooter() {
  const { footer } = useSiteContent();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <EditableText
              path="brand.name"
              as="h3"
              className="font-serif text-lg text-foreground"
            />
            <EditableText
              path="footer.tagline"
              as="p"
              multiline
              className="mt-2 text-sm leading-relaxed text-muted-foreground"
            />
          </div>
          <div>
            <EditableText
              path="footer.linksHeading"
              as="h4"
              className="text-sm font-semibold text-foreground"
            />
            <ul className="mt-2 space-y-1">
              {FOOTER_LINKS.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-muted-foreground hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <EditableText
              path="footer.servicesHeading"
              as="h4"
              className="text-sm font-semibold text-foreground"
            />
            <ul className="mt-2 space-y-1">
              {footer.services.map((_, i) => (
                <ListItem
                  key={i}
                  listPath="footer.services"
                  index={i}
                  as="li"
                  direction="column"
                  className="text-sm text-muted-foreground"
                >
                  <EditableText path={`footer.services.${i}`} placeholder="Service" />
                </ListItem>
              ))}
            </ul>
            <AddItem
              listPath="footer.services"
              template="New service"
              label="Add"
              className="mt-2 px-3 py-1 text-xs"
              max={8}
            />
          </div>
          <div>
            <EditableText
              path="footer.contactHeading"
              as="h4"
              className="text-sm font-semibold text-foreground"
            />
            <ul className="mt-2 space-y-1">
              {footer.contactLines.map((_, i) => (
                <ListItem
                  key={i}
                  listPath="footer.contactLines"
                  index={i}
                  as="li"
                  direction="column"
                  className="text-sm text-muted-foreground"
                >
                  <EditableText path={`footer.contactLines.${i}`} placeholder="Line" />
                </ListItem>
              ))}
              <li>
                <Link to="/contact" className="text-sm text-primary hover:underline">
                  <EditableText path="footer.contactCtaLabel" />
                </Link>
              </li>
            </ul>
            <AddItem
              listPath="footer.contactLines"
              template="New line"
              label="Add"
              className="mt-2 px-3 py-1 text-xs"
              max={6}
            />
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} </span>
          <EditableText path="footer.copyright" />
        </div>
      </div>
    </footer>
  );
}
