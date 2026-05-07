import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { logger } from "./lib/logger";

const app = express();

// 1. Temel Ayarlar
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// 2. DASHBOARD EKRANI (İstediğin o şık arayüzü buraya HTML olarak gömüyoruz)
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rehberlik Sistemi Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body class="bg-gray-50 font-sans">
        <div class="max-w-7xl mx-auto p-8">
            <header class="mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Rehberlik Özeti</h1>
                <p class="text-gray-500">Genel öğrenci durumu ve bulanık mantık değerlendirme sonuçları.</p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><p class="text-sm font-medium text-gray-500">Toplam Öğrenci</p><p class="text-2xl font-bold text-blue-600">12</p></div>
                    <i class="fas fa-users text-2xl text-blue-100 p-3 bg-blue-50 rounded-lg"></i>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><p class="text-sm font-medium text-gray-500">Değerlendirme</p><p class="text-2xl font-bold text-green-600">15</p></div>
                    <i class="fas fa-file-alt text-2xl text-green-100 p-3 bg-green-50 rounded-lg"></i>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><p class="text-sm font-medium text-gray-500">Ortalama Puan</p><p class="text-2xl font-bold text-purple-600">55.0</p></div>
                    <i class="fas fa-chart-line text-2xl text-purple-100 p-3 bg-purple-50 rounded-lg"></i>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><p class="text-sm font-medium text-gray-500">Dikkat Gereken</p><p class="text-2xl font-bold text-red-600">3</p></div>
                    <i class="fas fa-exclamation-triangle text-2xl text-red-100 p-3 bg-red-50 rounded-lg"></i>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 class="text-xl font-semibold mb-6">Karar Dağılımı</h2>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between text-sm mb-1"><span>Gerekmiyor</span><span class="font-bold text-green-600">5</span></div>
                            <div class="w-full bg-gray-100 rounded-full h-2.5"><div class="bg-green-500 h-2.5 rounded-full" style="width: 55%"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-sm mb-1"><span>Gözlem</span><span class="font-bold text-orange-600">1</span></div>
                            <div class="w-full bg-gray-100 rounded-full h-2.5"><div class="bg-orange-500 h-2.5 rounded-full" style="width: 15%"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-sm mb-1"><span>Yönlendir</span><span class="font-bold text-red-600">3</span></div>
                            <div class="w-full bg-gray-100 rounded-full h-2.5"><div class="bg-red-500 h-2.5 rounded-full" style="width: 30%"></div></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center border-dashed border-2">
                    <h2 class="text-xl font-semibold mb-4 w-full">Sınıflara Göre Dağılım</h2>
                    <p class="text-gray-400 italic">Veritabanı senkronize ediliyor...</p>
                </div>
            </div>

            <footer class="mt-12 text-center text-xs text-gray-400 uppercase tracking-widest">
                Fuzzy Logic Engine • Render Cloud Platform
            </footer>
        </div>
    </body>
    </html>
  `);
});

// 3. Sağlık ve API Kontrolü
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 4. Hata Yönetimi
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err);
  res.status(500).send("Sunucu hatası oluştu.");
});

export default app;
