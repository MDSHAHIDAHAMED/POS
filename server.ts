// Local development entry point only.
// Adds Vite middleware for HMR and starts the HTTP server.
// This file is NOT used in production or Netlify deployments.
// Vite is loaded via dynamic import so it is never pulled into the Netlify function bundle.
import "dotenv/config";
import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SuperShop POS API running on http://localhost:${PORT}`);
    console.log(`📦 Database: Prisma + PostgreSQL`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
