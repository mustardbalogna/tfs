import { Puzzle, Frame, Armchair, Table, Coffee, Tv, Gem, FlaskConical } from "lucide-react";

export default function Services() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">What We Do</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Our Services
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          From individual wooden parts to complete room fitouts, we provide a comprehensive range of
          furniture and joinery solutions.
        </p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div
            key={s.title}
            className="rounded-lg border border-border bg-card p-8 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-xl text-foreground">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const services = [
  {
    title: "Wooden Parts",
    desc: "Precision-cut wooden components for furniture assembly and restoration projects.",
    icon: Puzzle,
  },
  {
    title: "Wooden Frames",
    desc: "Sturdy, handcrafted timber frames for chairs, sofas, beds and custom builds.",
    icon: Frame,
  },
  {
    title: "Chairs",
    desc: "Custom built chairs designed for comfort, style and durability.",
    icon: Armchair,
  },
  {
    title: "Tables",
    desc: "Dining tables, coffee tables, side tables and desks — all made to measure.",
    icon: Table,
  },
  {
    title: "Coffee Tables",
    desc: "Stylish centre-piece coffee tables in a range of timber finishes.",
    icon: Coffee,
  },
  {
    title: "Entertainment Units",
    desc: "Custom entertainment units and media cabinets tailored to your space.",
    icon: Tv,
  },
  {
    title: "Accessories",
    desc: "Timber accessories including handles, trims, and decorative elements.",
    icon: Gem,
  },
  {
    title: "Project Work",
    desc: "Bespoke project-based commissions from concept through to installation.",
    icon: FlaskConical,
  },
  {
    title: "Timber Stains",
    desc: "Professional staining and finishing services to protect and beautify your timber.",
    icon: Gem,
  },
];
