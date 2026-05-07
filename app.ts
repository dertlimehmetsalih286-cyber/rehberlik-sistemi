import express from "express"; // Bu satırda "express" kelimesinin tam olarak bu şekilde olduğundan emin ol
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index"; 
import { logger } from "./lib/logger";
const app = express(); // Burada hata alıyordun, artık almayacaksın.
// Loglama ayarı (Hata aldığın pino-http burada kullanılıyor)
app.use(pinoHttp({ logger }));
app.use(cors());

// Veri işleme ayarları
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tüm API yollarını bağla
app.use("/api", router);

// Render Sağlık Kontrolü
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Hata yakalayıcı (Uygulamanın status 1 verip çökmesini engeller)
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err);
  res.status(500).json({ error: "Bir iç sunucu hatası oluştu" });
});

export default app;
