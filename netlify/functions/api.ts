process.env.NETLIFY_FUNCTIONS = "true";

import serverless from "serverless-http";
import { app } from "../../server";

export const handler = serverless(app);
