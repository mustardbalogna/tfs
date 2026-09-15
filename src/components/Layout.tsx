import { Outlet } from "react-router-dom";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/fira-sans/400.css";
import "@fontsource/fira-sans/500.css";
import "@fontsource/fira-sans/600.css";
import "@fontsource/fira-sans/700.css";
import { SiteContentProvider } from "./site/content-context";
import SiteHeader from "./site/SiteHeader";
import SiteFooter from "./site/SiteFooter";

export default function Layout() {
  return (
    <SiteContentProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </SiteContentProvider>
  );
}
