import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import bgimage from "../assets/image.jpg";
import { Box, Table, Home, TreePine } from "lucide-react";
import { DEFAULT_SITE_CONTENT, fetchSiteContent, type SiteContent } from "@/lib/siteContent";

const HOME_CATEGORY_ICONS = [Box, Table, Home, TreePine];

export default function HomePage() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    fetchSiteContent().then(setContent);
  }, []);

  return (
    <>
      {/* bg */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src={bgimage}
            alt="Custom furniture workshop with timber pieces"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Sydney's Trusted Furniture Specialists
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Crafted with care,
              <br />
              built to last.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              From custom cabinetry and built-in wardrobes to handcrafted dining tables and office
              fitouts — we bring your vision to life with quality timber and expert joinery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Get a Free Quote
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="bg-card py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Categories We Service
            </h2>
            <p className="mt-3 text-muted-foreground">
              A wide range of furniture and joinery solutions for homes and businesses.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.homeCategories.map((c, i) => {
              const Icon = HOME_CATEGORY_ICONS[i] ?? Box;
              return (
                <div
                  key={c.title}
                  className="group rounded-lg border border-border bg-background p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg text-foreground">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/categories"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              View all categories →
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                About Us
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                {content.homeAbout.heading}
              </h2>
              <p className="mt-4 text-muted-foreground">{content.homeAbout.paragraph1}</p>
              <p className="mt-4 text-muted-foreground">{content.homeAbout.paragraph2}</p>
              <div className="mt-8">
                <Link
                  to="/about"
                  className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Learn More About Us
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-muted p-8">
              <h3 className="font-serif text-xl text-foreground">{content.homeServices.heading}</h3>
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {content.homeServices.items.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Areas We Service */}
      <section className="bg-secondary/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            {content.homeAreas.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{content.homeAreas.blurb}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {content.homeAreas.suburbs.map((suburb) => (
              <span
                key={suburb}
                className="inline-flex items-center rounded-full border border-border bg-background px-4 py-1.5 text-sm text-foreground"
              >
                {suburb}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/contact" className="text-sm font-medium text-primary hover:underline">
              Not sure if we cover your area? Contact us →
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-primary py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl tracking-tight text-primary-foreground sm:text-4xl">
            Ready to start your project?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            For all enquiries, contact us today. We'd love to earn your trust and deliver the best
            service in the industry.
          </p>
          <div className="mt-8">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md bg-background px-8 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-background/90"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
