import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js"; // .js uzantısı ESM için gereklidir
import { logger } from "./lib/logger.js";

const app: Express = express();

// Loglama ve CORS ayarları
app.use(pinoHttp({ logger }));
app.use(cors());

// JSON ve URL verisi işleme
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tüm API rotalarını /api altına bağla
app.use("/api", router);

// Render Sağlık Kontrolü (Health Check)
// Render, uygulamanın yaşadığını bu adresten kontrol eder
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Hata yakalama (Uygulamanın çökmesini engellemek için)
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;
