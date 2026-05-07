import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// VERİ TABANI (Simüle)
let ogrenciler = [
    { id: 1, ad: "Mehmet Salih", numara: "101", sinif: "10-B", puan: 20, durum: "Yönlendir", tarih: "2026-05-07" },
    { id: 2, ad: "Zeynep", numara: "102", sinif: "11-C", puan: 85, durum: "Gerekiyorsa Gözlem", tarih: "2026-05-06" }
];

app.get("/", (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'student'; // 'teacher' veya 'student'

    // 1. GİRİŞ EKRANI (Özel Bilgi İsteme)
    if (page === 'login') {
        return res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head>
        <body class="bg-slate-100 h-screen flex items-center justify-center font-sans p-4">
            <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-indigo-600 text-center">
                    <i class="fas fa-chalkboard-teacher text-4xl text-indigo-600 mb-4"></i>
                    <h2 class="text-xl font-bold mb-4">Öğretmen Paneli</h2>
                    <form action="/login-check" method="POST" class="space-y-4">
                        <input type="hidden" name="role" value="teacher">
                        <input type="tel" name="phone" placeholder="Telefon Numarası" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500">
                        <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">GİRİŞ YAP</button>
                    </form>
                </div>
                <div class="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-emerald-500 text-center">
                    <i class="fas fa-user-graduate text-4xl text-emerald-500 mb-4"></i>
                    <h2 class="text-xl font-bold mb-4">Öğrenci Paneli</h2>
                    <form action="/login-check" method="POST" class="space-y-4">
                        <input type="hidden" name="role" value="student">
                        <input type="text" name="schoolNo" placeholder="Okul Numarası" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500">
                        <button class="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg">SONUCUMU GÖR</button>
                    </form>
                </div>
            </div>
        </body>
        </html>`);
    }

    // 2. ANA PANEL (YETKİLENDİRME KONTROLÜ)
    const canSeeAll = role === 'teacher';

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head>
    <body class="bg-slate-50 flex min-h-screen font-sans">
        <aside class="w-72 bg-white border-r flex flex-col h-screen sticky top-0">
            <div class="p-6 border-b font-bold text-xl text-indigo-600 flex items-center"><i class="fas fa-book-open mr-3"></i> Rehberlik</div>
            <nav class="p-4 space-y-2 flex-1">
                ${canSeeAll ? `
                    <a href="/?page=dashboard&role=teacher&tab=ozet" class="block p-3 rounded-xl ${tab === 'ozet' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} font-bold">Özet</a>
                    <a href="/?page=dashboard&role=teacher&tab=degerlendirme" class="block p-3 rounded-xl ${tab === 'degerlendirme' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} font-bold">Değerlendirme</a>
                ` : ''}
                <a href="/?page=dashboard&role=${role}&tab=profil" class="block p-3 rounded-xl ${tab === 'profil' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} font-bold">Profil</a>
                <a href="/?page=dashboard&role=${role}&tab=okullar" class="block p-3 rounded-xl ${tab === 'okullar' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} font-bold">Okullar</a>
            </nav>
            <div class="p-6 border-t"><a href="/?page=login" class="text-red-500 font-bold text-sm uppercase">Çıkış</a></div>
        </aside>

        <main class="flex-1 p-10">
            ${tab === 'ozet' && canSeeAll ? `
                <h2 class="text-3xl font-black mb-8 text-slate-800 uppercase tracking-tighter">Hocam Hoş Geldiniz</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white p-8 rounded-3xl border shadow-sm">
                        <h3 class="font-bold text-slate-400 uppercase text-xs mb-6">Karar Dağılımı</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-end h-32 space-x-2">
                                <div class="bg-green-500 w-full rounded-t-lg" style="height: 60%"></div>
                                <div class="bg-orange-500 w-full rounded-t-lg" style="height: 20%"></div>
                                <div class="bg-red-500 w-full rounded-t-lg" style="height: 40%"></div>
                            </div>
                            <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Gereksiz</span><span>Gözlem</span><span>Yönlendir</span></div>
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-3xl border shadow-sm border-l-8 border-l-red-500">
                        <h3 class="font-bold text-red-500 uppercase text-xs mb-4">Dikkat Listesi (Acil Rehberlik)</h3>
                        <div class="divide-y">
                            ${ogrenciler.filter(o => o.puan < 40).map(o => `
                                <div class="py-3 flex justify-between items-center">
                                    <div><p class="font-bold">${o.ad}</p><p class="text-xs text-slate-400">Puan: ${o.puan} - Rehbere yönlendirilmesi gerekir.</p></div>
                                    <span class="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold">KRİTİK</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="lg:col-span-2 bg-white p-8 rounded-3xl border shadow-sm">
                        <h3 class="font-bold text-indigo-500 uppercase text-xs mb-6 text-center underline">Son Aktivite (Eklenen Öğrenciler)</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${ogrenciler.slice(-4).reverse().map(o => `
                                <div class="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border">
                                    <div><p class="font-bold text-sm">${o.ad}</p><p class="text-[10px] text-slate-400">${o.tarih} tarihinde eklendi.</p></div>
                                    <i class="fas fa-check-circle text-green-500"></i>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}

            ${tab === 'profil' ? `<div class="bg-white p-10 rounded-3xl shadow-sm text-center"> <i class="fas fa-user-circle text-6xl text-slate-200 mb-4"></i> <h2 class="text-2xl font-bold">${role === 'teacher' ? 'Öğretmen Profili' : 'Öğrenci Profili'}</h2> <p class="text-slate-400 mt-2">Kişisel bilgilerinizi buradan görebilirsiniz.</p></div>` : ''}
            ${tab === 'okullar' ? `<div class="bg-indigo-600 p-10 rounded-3xl text-white shadow-xl"> <h2 class="text-2xl font-bold">Okul Sıralaması</h2> <p class="mt-2 opacity-80">Şehit Mehmet Acubucu İHL - En İyi Performans</p></div>` : ''}
        </main>
    </body>
    </html>`);
});

// LOGIN-CHECK ROUTE
app.post("/login-check", (req, res) => {
    const { role } = req.body;
    res.redirect(`/?page=dashboard&role=${role}&tab=${role === 'teacher' ? 'ozet' : 'profil'}`);
});

export default app;
