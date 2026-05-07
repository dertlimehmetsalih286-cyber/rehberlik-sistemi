import app from "./app.js";
import { logger } from "./lib/logger.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  console.error("HATA: Render ayarlarinda PORT (10000) tanimlanmamis!");
  process.exit(1);
}

const port = Number(rawPort);

app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "🚀 Sunucu basariyla calisti!");
});
