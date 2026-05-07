import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// GEÇİCİ VERİTABANI (Öğrenciler burada tutulacak)
// Not: Sunucu her yeniden başladığında burası sıfırlanır. Kalıcı olması için veritabanı bağlanmalıdır.
let ogrenciler = [
    { id: 1, ad: "Mehmet Salih", numara: "101", puan: 85, durum: "İyi" },
    { id: 2, ad: "Zeynep", numara: "102", puan: 45, durum: "Gözlem" }
];

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <title>Öğretmen & Öğrenci Paneli</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body class="bg-slate-50 font-sans">
        <div class="max-w-5xl mx-auto p-6">
            <div class="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-slate-100 flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-800">Rehberlik Sistemi</h1>
                    <p class="text-slate-500 mt-1">Öğretmen Kontrol ve Öğrenci Takip Paneli</p>
                </div>
                <div class="bg-indigo-50 p-4 rounded-xl text-indigo-600 font-bold">
                    Toplam: ${ogrenciler.length} Öğrenci
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 sticky top-6">
                        <h2 class="text-xl font-bold mb-6 text-slate-800 flex items-center">
                            <i class="fas fa-user-plus mr-2 text-indigo-500"></i> Yeni Öğrenci Ekle
                        </h2>
                        <form action="/ekle" method="POST" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Öğrenci Adı</label>
                                <input type="text" name="ad" required class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Okul Numarası</label>
                                <input type="text" name="numara" required class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Puanı (0-100)</label>
                                <input type="number" name="puan" min="0" max="100" required class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition">
                            </div>
                            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-200 active:scale-95">
                                Kaydet
                            </button>
                        </form>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div class="p-6 border-b border-slate-100">
                            <h2 class="text-xl font-bold text-slate-800">Mevcut Öğrenci Listesi</h2>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50 text-slate-500 text-sm uppercase">
                                    <tr>
                                        <th class="p-4 font-semibold">No</th>
                                        <th class="p-4 font-semibold">Ad Soyad</th>
                                        <th class="p-4 font-semibold text-center">Puan</th>
                                        <th class="p-4 font-semibold">Durum</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${ogrenciler.map(o => `
                                        <tr class="hover:bg-slate-50 transition">
                                            <td class="p-4 font-mono text-slate-400 text-sm">${o.numara}</td>
                                            <td class="p-4 font-bold text-slate-700">${o.ad}</td>
                                            <td class="p-4 text-center">
                                                <span class="bg-slate-100 px-3 py-1 rounded-full font-bold text-indigo-600">${o.puan}</span>
                                            </td>
                                            <td class="p-4">
                                                <span class="px-3 py-1 rounded-full text-xs font-bold ${o.puan >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                                    ${o.puan >= 50 ? 'GELİŞİM İYİ' : 'DİKKAT GEREK'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        ${ogrenciler.length === 0 ? '<p class="p-8 text-center text-slate-400">Henüz öğrenci eklenmemiş.</p>' : ''}
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// ÖĞRENCİ EKLEME İŞLEMİ (Öğretmen Butona Basınca Çalışır)
app.post("/ekle", (req, res) => {
    const { ad, numara, puan } = req.body;
    ogrenciler.push({
        id: Date.now(),
        ad,
        numara,
        puan: parseInt(puan),
        durum: parseInt(puan) >= 50 ? "İyi" : "Gözlem"
    });
    res.redirect("/"); // Ekleme sonrası ana sayfaya dön
});

export default app;
