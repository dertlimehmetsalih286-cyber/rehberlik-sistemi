import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index"; 
import { logger } from "./lib/logger";

const app = express();

// 1. Loglama Ayarı
app.use(pinoHttp({ logger }));
app.use(cors());

// 2. Veri İşleme Ayarları
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. ANA SAYFA KONTROLÜ (Beyaz sayfa hatasını çözen kısım)
app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
      <h1 style="color: #4CAF50;">🚀 Rehberlik Sistemi API Yayında!</h1>
      <p>Sunucu başarıyla bağlandı ve veritabanı aktif.</p>
      <p style="color: #666;">Durum: <b>Online</b></p>
    </div>
  `);
});

// 4. Sağlık Kontrolü Rotası
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Sunucu saglikli calisiyor" });
});

// 5. API Rotalarını Bağla
app.use("/api", router);

// 6. Hata Yakalayıcı (Uygulamanın çökmesini engeller)
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err);
  res.status(500).json({ error: "Sunucu tarafinda bir hata olustu" });
});

export default app;
