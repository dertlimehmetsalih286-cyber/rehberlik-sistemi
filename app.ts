import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// VERİ YAPISI
let ogrenciler = [
    { id: 1, ad: "Mehmet Salih", okul: "Şehit Mehmet Acubucu İmamhatip Lisesi", numara: "101", sinif: "10-A", puan: 50, durum: "Gözlem" }
];

let okullar = [
    { ad: "Şehit Mehmet Acubucu İmamhatip Lisesi", ogrenciSayisi: 1, ortalama: 50.0 }
];

app.get("/", (req, res) => {
    // URL'den hangi sayfada olduğumuzu anlıyoruz (Varsayılan: login)
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';

    // 1. GİRİŞ EKRANI (LOGIN)
    if (page === 'login') {
        return res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <title>Giriş Yap | Rehberlik Sistemi</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        </head>
        <body class="bg-slate-100 h-screen flex items-center justify-center font-sans px-4">
            <div class="max-w-md w-full">
                <div class="bg-white rounded-3xl shadow-2xl p-10 border border-slate-200">
                    <div class="text-center mb-10">
                        <div class="inline-block bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
                            <i class="fas fa-book-open text-white text-3xl"></i>
                        </div>
                        <h1 class="text-2xl font-black text-slate-800">Rehberlik Sistemi</h1>
                        <p class="text-slate-400 text-sm mt-2">Lütfen giriş yönteminizi seçin</p>
                    </div>

                    <div class="space-y-4">
                        <a href="/?page=dashboard&tab=ozet" class="flex items-center justify-between p-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition group shadow-lg shadow-indigo-100">
                            <div class="flex items-center space-x-4">
                                <i class="fas fa-chalkboard-teacher text-xl"></i>
                                <span class="font-bold">Öğretmen Girişi</span>
                            </div>
                            <i class="fas fa-arrow-right opacity-50 group-hover:opacity-100 transition"></i>
                        </a>

                        <a href="/?page=dashboard&tab=ogrenciler" class="flex items-center justify-between p-5 bg-white border-2 border-slate-100 hover:border-indigo-600 text-slate-700 rounded-2xl transition group">
                            <div class="flex items-center space-x-4">
                                <i class="fas fa-user-graduate text-xl text-indigo-500"></i>
                                <span class="font-bold">Öğrenci Girişi</span>
                            </div>
                            <i class="fas fa-arrow-right opacity-0 group-hover:opacity-100 transition text-indigo-600"></i>
                        </a>
                    </div>

                    <div class="mt-8 flex justify-between text-xs font-bold uppercase tracking-wider">
                        <a href="#" class="text-indigo-500 hover:text-indigo-700">Şifremi Unuttum</a>
                        <a href="#" class="text-slate-400 hover:text-slate-600">Yeni Kayıt</a>
                    </div>
                </div>
                <p class="text-center text-slate-400 text-[10px] mt-8 uppercase tracking-[0.2em]">Fuzzy Logic Engine v1.0</p>
            </div>
        </body>
        </html>
        `);
    }

    // 2. ANA PANEL (DASHBOARD)
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <title>Dashboard | Rehberlik</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>.tab-active { background-color: #1e293b; color: white !important; }</style>
    </head>
    <body class="bg-slate-50 font-sans flex min-h-screen">
        <aside class="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
            <div class="p-6 border-b border-slate-100 cursor-pointer" onclick="window.location.href='/'">
                <div class="flex items-center space-x-4">
                    <div class="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200"><i class="fas fa-book-open text-white text-xl"></i></div>
                    <div><h1 class="font-bold text-slate-800 text-lg leading-tight">Rehberlik</h1><p class="text-xs text-slate-400 font-medium">Karar Destek</p></div>
                </div>
            </div>
            <nav class="p-4 space-y-2">
                <a href="/?page=dashboard&tab=ozet" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 ${tab === 'ozet' ? 'tab-active' : ''}"><i class="fas fa-th-large w-5"></i><span class="font-semibold text-sm">Özet</span></a>
                <a href="/?page=dashboard&tab=degerlendirme" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 ${tab === 'degerlendirme' ? 'tab-active' : ''}"><i class="fas fa-sliders-h w-5"></i><span class="font-semibold text-sm">Değerlendirme</span></a>
                <a href="/?page=dashboard&tab=ogrenciler" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 ${tab === 'ogrenciler' ? 'tab-active' : ''}"><i class="fas fa-user-graduate w-5"></i><span class="font-semibold text-sm">Öğrenciler</span></a>
                <a href="/?page=dashboard&tab=okullar" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 ${tab === 'okullar' ? 'tab-active' : ''}"><i class="fas fa-school w-5"></i><span class="font-semibold text-sm">Okullar</span></a>
            </nav>
            <div class="mt-auto p-6"><a href="/?page=login" class="text-xs font-bold text-red-400 hover:text-red-600 uppercase transition"><i class="fas fa-sign-out-alt mr-2"></i>Çıkış Yap</a></div>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            ${tab === 'ozet' ? `<h2 class="text-4xl font-extrabold text-slate-800 mb-10">Rehberlik Özeti</h2>` : ''}
            ${tab === 'degerlendirme' ? `
                <h2 class="text-4xl font-extrabold text-slate-800 mb-10">Değerlendirme</h2>
                <form action="/ekle" method="POST" class="bg-white p-10 rounded-3xl border shadow-sm max-w-2xl">
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <input type="text" name="ad" placeholder="Ad Soyad" required class="p-4 bg-slate-50 border rounded-2xl">
                        <input type="text" name="sinif" placeholder="Sınıf" required class="p-4 bg-slate-50 border rounded-2xl">
                        <input type="text" name="okul" placeholder="Okul" required class="p-4 bg-slate-50 border rounded-2xl">
                        <input type="text" name="numara" placeholder="No" required class="p-4 bg-slate-50 border rounded-2xl">
                    </div>
                    <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl">ÖĞRENCİYİ KAYDET</button>
                </form>
            ` : ''}
            ${tab === 'ogrenciler' ? `
                <h2 class="text-4xl font-extrabold text-slate-800 mb-10">Öğrenci Listesi</h2>
                <div class="bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase"><tr class="border-b"><th class="p-5">Öğrenci</th><th class="p-5">Okul</th><th class="p-5 text-right">Puan</th></tr></thead>
                        <tbody class="divide-y">${ogrenciler.map(o => `<tr><td class="p-5"><b>${o.ad}</b><br>${o.sinif}</td><td class="p-5 text-slate-500">${o.okul}</td><td class="p-5 text-right font-black text-indigo-600">${o.puan}</td></tr>`).join('')}</tbody>
                    </table>
                </div>
            ` : ''}
            ${tab === 'okullar' ? `<h2 class="text-4xl font-extrabold text-slate-800 mb-10">Okullar</h2>` : ''}
        </main>
    </body>
    </html>
    `);
});

app.post("/ekle", (req, res) => {
    const { ad, sinif, okul, numara } = req.body;
    ogrenciler.push({ id: Date.now(), ad, sinif, okul, numara, puan: 50, durum: "Gözlem" });
    res.redirect("/?page=dashboard&tab=ogrenciler");
});

export default app;
