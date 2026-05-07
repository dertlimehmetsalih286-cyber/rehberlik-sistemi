# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:33:43 2026

@author: Dell
"""

import app from "./app.js"; // .ts yerine .js uzantısı eklemeyi dene (ESM kuralıdır)
import { logger } from "./lib/logger.js";

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${rawPort}"`);

app.listen(port, (err) => {
  if (err) { logger.error({ err }, "Error listening on port"); process.exit(1); }
  logger.info({ port }, "Server listening");
});
