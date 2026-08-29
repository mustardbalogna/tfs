export default function Contact() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Get in Touch</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Contact Us
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          For all enquiries, contact us today. We'd welcome the opportunity to earn your trust and
          deliver the best service in the industry.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="font-serif text-2xl text-foreground">Send us a message</h2>
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Service Interest
                </label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select a service</option>
                  <option value="cabinet-making">Cabinet Making</option>
                  <option value="custom-furniture">Custom Furniture</option>
                  <option value="joinery">Joinery</option>
                  <option value="wardrobes">Wardrobes</option>
                  <option value="outdoor-furniture">Outdoor Furniture</option>
                  <option value="office-fitouts">Office Fitouts</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Send Enquiry
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="font-serif text-xl text-foreground">Service Areas</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>Condell Park, NSW</li>
              <li>Bankstown, NSW</li>
              <li>Greenacre, NSW</li>
              <li>Yagoona, NSW</li>
              <li>Surrounding Sydney suburbs</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="font-serif text-xl text-foreground">Business Hours</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li className="flex justify-between">
                <span>Monday – Friday</span> <span>8:00 AM – 5:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span> <span>9:00 AM – 2:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span> <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
