import app from "./app";
import { logger } from "./lib/logger";
const rawPort = process.env["PORT"];
if (!rawPort) {
  console.error("HATA: Render ayarlarinda PORT (10000) tanimlanmamis!");
  process.exit(1);
}
const port = Number(rawPort);
try {
  app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Server listening");
  });
} catch (err) {
  console.error("GERCEK HATA BURADA:", err);
}

