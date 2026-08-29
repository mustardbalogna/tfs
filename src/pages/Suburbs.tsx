import { Link } from "react-router-dom";

export default function Suburbs() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our Reach</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Suburbs Previously Serviced
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Proudly providing custom furniture and joinery services across Sydney's southwest.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="font-serif text-2xl text-foreground">Condell Park</h2>
          <ul className="mt-6 space-y-3">
            {condellPark.map((item) => (
              <li key={item} className="flex items-center gap-3 text-muted-foreground">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="font-serif text-2xl text-foreground">Bankstown</h2>
          <ul className="mt-6 space-y-3">
            {bankstown.map((item) => (
              <li key={item} className="flex items-center gap-3 text-muted-foreground">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-secondary/30 p-8 text-center">
        <p className="text-muted-foreground">
          We also service surrounding areas including Greenacre, Yagoona, Punchbowl, Lakemba, Bass
          Hill and Chester Hill.
        </p>
        <p className="mt-2 text-muted-foreground">
          Not sure if we cover your area?{" "}
          <Link to="/contact" className="font-medium text-primary hover:underline">
            Contact us
          </Link>{" "}
          to find out.
        </p>
      </div>
    </div>
  );
}

const condellPark = [
  "Cabinet Makers in Condell Park",
  "Custom Furniture in Condell Park",
  "Dining Tables in Condell Park",
  "Joiners in Condell Park",
  "Outdoor Furniture in Condell Park",
  "Wardrobe Makers in Condell Park",
];

const bankstown = [
  "Cabinet Makers in Bankstown",
  "Custom Furniture in Bankstown",
  "Dining Tables in Bankstown",
  "Joiners in Bankstown",
  "Outdoor Furniture in Bankstown",
  "Wardrobe Makers in Bankstown",
];
