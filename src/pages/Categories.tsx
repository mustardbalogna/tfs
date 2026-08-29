export default function Categories() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          What We Cover
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Categories Previously Serviced
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Please note some of these categories may require a trade licence.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-6 py-4"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            <span className="text-foreground">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const categories = [
  "Cabinet Making",
  "Benchtops",
  "Home Office",
  "Built-in Furniture",
  "Bookcases",
  "Chairs",
  "Furniture - Chairs",
  "Dining Tables",
  "Furniture - Custom Design",
  "Custom Built Chairs",
  "Entertainment Units",
  "Cabinets",
  "Custom Built Tables",
  "Custom Built Storage Solutions",
  "Consultation",
  "Furniture - Outdoor",
  "Joinery",
  "Shop & Office Fitouts",
  "Furniture",
  "Kitchens",
  "Wardrobes",
  "Standalone Wardrobe Builders",
  "Built In Wardrobe Builders",
  "Shelving & Storage Solutions",
];
