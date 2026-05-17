// Import app.ts only — never import server.ts (it loads Vite and breaks in serverless).
import serverless from "serverless-http";
import { app } from "../../app.js";

export const handler = serverless(app);
