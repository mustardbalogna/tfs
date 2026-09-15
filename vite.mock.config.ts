// Temporary dev-only config: mocks the Vercel /api routes so the admin UI can be
// exercised locally without Supabase. Delete after testing.
import { defineConfig, mergeConfig, type Plugin } from "vite";
import base from "./vite.config";

let content: unknown = null;
const media: { path: string; url: string; name: string }[] = [
  { path: "a-1.jpg", url: "https://picsum.photos/seed/tfs1/800/600", name: "workshop.jpg" },
  { path: "a-2.jpg", url: "https://picsum.photos/seed/tfs2/800/600", name: "table.jpg" },
];

function mockApi(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        const url = req.url.split("?")[0];
        const json = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };
        let raw = "";
        req.on("data", (c) => (raw += c));
        req.on("end", () => {
          const body = raw ? JSON.parse(raw) : {};
          if (url === "/api/session" || url === "/api/login" || url === "/api/logout")
            return json(200, { ok: true });
          if (url === "/api/site-content") {
            if (req.method === "PATCH") {
              content = body.content;
              return json(200, { success: true });
            }
            return json(200, { content });
          }
          if (url === "/api/media") {
            if (req.method === "POST") {
              const item = {
                path: `${Date.now()}-${body.fileName}`,
                url: `https://picsum.photos/seed/${Date.now()}/800/600`,
                name: body.fileName,
              };
              media.unshift(item);
              return json(201, { item });
            }
            if (req.method === "DELETE") {
              const i = media.findIndex((m) => m.path === body.path);
              if (i >= 0) media.splice(i, 1);
              return json(200, { success: true });
            }
            return json(200, { items: media });
          }
          if (url === "/api/categories")
            return json(200, {
              categories: [
                { id: "1", name: "Kitchens", heading: "Kitchens", description: "Custom kitchens.", created_at: "", updated_at: "", images: [] },
              ],
            });
          if (url === "/api/messages") return json(200, { messages: [] });
          if (url === "/api/stats")
            return json(200, { totalViews: 1, uniqueVisitors: 1, uniqueSessions: 1, byHour: [], byDay: [], topPages: [], heatmap: [] });
          if (url === "/api/track") return json(200, { ok: true });
          return json(404, { error: "not mocked" });
        });
      });
    },
  };
}

export default mergeConfig(base, defineConfig({ plugins: [mockApi()] }));
