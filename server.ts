// Local development entry point only.
// Adds Vite middleware for HMR and starts the HTTP server.
// This file is NOT used in production or Netlify deployments.
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { app } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "spa",
});

app.use(vite.middlewares);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SuperShop POS API running on http://localhost:${PORT}`);
  console.log(`📦 Database: Prisma + PostgreSQL`);
});
