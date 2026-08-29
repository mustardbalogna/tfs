import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/fira-sans/400.css";
import "@fontsource/fira-sans/500.css";
import "@fontsource/fira-sans/600.css";
import "@fontsource/fira-sans/700.css";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-normal tracking-tight text-primary">
            Top Furniture Supplies
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            About
          </Link>
          <Link
            to="/services"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Services
          </Link>
          <Link
            to="/categories"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Categories
          </Link>
          <Link
            to="/suburbs"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Suburbs
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Contact
          </Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-2 text-foreground" aria-label="Menu">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-4 top-16 z-50 w-48 rounded-lg border border-border bg-card p-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            About
          </Link>
          <Link
            to="/services"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            Services
          </Link>
          <Link
            to="/categories"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            Categories
          </Link>
          <Link
            to="/suburbs"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            Suburbs
          </Link>
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            Contact
          </Link>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-serif text-lg text-foreground">Top Furniture Supplies</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              High-quality custom furniture, cabinetry, and joinery services across Sydney.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-primary">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-primary">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Services</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <span className="text-sm text-muted-foreground">Cabinet Making</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Custom Furniture</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Joinery</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Wardrobes</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <span className="text-sm text-muted-foreground">Condell Park, NSW</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Bankstown, NSW</span>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary hover:underline">
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          Top Furniture Supplies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
