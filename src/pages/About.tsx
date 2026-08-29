import { HeartHandshake, Wrench, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">About Us</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Enjoy your life
        </h1>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-6 text-center text-muted-foreground">
        <p>
          Top Furniture Supplies is focused on providing high-quality service and customer
          satisfaction — we will do everything we can to meet your expectations.
        </p>
        <p>
          Our company is based on the belief that our customers' needs are of the utmost importance.
          Our entire team is committed to meeting those needs. As a result, a high percentage of our
          business is from repeat customers and referrals.
        </p>
        <p>
          We would welcome the opportunity to earn your trust and deliver you the best service in
          the industry.
        </p>
        <p>
          With a variety of offerings to choose from, we're sure you'll be happy working with us.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-lg border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <v.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-xl text-foreground">{v.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const values = [
  {
    title: "Customer First",
    desc: "Your needs are our top priority. We listen, adapt, and deliver results that exceed expectations.",
    icon: HeartHandshake,
  },
  {
    title: "Quality Craftsmanship",
    desc: "Every piece is built with care using premium timber and proven joinery techniques.",
    icon: Wrench,
  },
  {
    title: "Trusted Reputation",
    desc: "A high percentage of our work comes from repeat customers and referrals.",
    icon: Shield,
  },
];
