
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// VERİ MODELİ
let ogrenciler = [];
let geciciKod = ""; // SMS kodu simülasyonu için

app.get("/", (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const step = req.query.step || '1';

    // 1. GİRİŞ VE KAYIT EKRANLARI
    if (page === 'login') {
        return res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head>
        <body class="bg-slate-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border">
                
                ${step === '1' ? `
                    <div class="text-center mb-8">
                        <h2 class="text-2xl font-black text-slate-800">Öğretmen Girişi</h2>
                        <p class="text-slate-400 text-sm mt-2">Telefon numaranıza kod gönderilecek</p>
                    </div>
                    <form action="/send-code" method="POST" class="space-y-4">
                        <input type="tel" name="phone" placeholder="05xx xxx xx xx" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600">
                        <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl">KOD GÖNDER</button>
                    </form>
                ` : ''}

                ${step === '2' ? `
                    <div class="text-center mb-8">
                        <h2 class="text-2xl font-black text-slate-800">Doğrulama</h2>
                        <p class="text-orange-500 font-bold text-sm">Kodunuz: ${geciciKod} (Simüle Edildi)</p>
                    </div>
                    <form action="/verify-code" method="POST" class="space-y-4">
                        <input type="text" name="code" placeholder="6 Haneli Kod" required class="w-full p-4 bg-slate-50 border rounded-2xl text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-indigo-600">
                        <button class="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl">GİRİŞİ TAMAMLA</button>
                    </form>
                ` : ''}

                ${step === 'register' ? `
                    <div class="text-center mb-8">
                        <h2 class="text-2xl font-black text-slate-800">Öğretmen Kaydı</h2>
                    </div>
                    <form action="/register-teacher" method="POST" class="space-y-4">
                        <input type="text" name="tc" placeholder="T.C. Kimlik No" maxlength="11" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600">
                        <input type="number" name="yas" placeholder="Yaşınız" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600">
                        <p class="text-[10px] text-slate-400 px-2 italic">* 25 yaş üstü kayıtlar doğrudan "Eğitmen" yetkisi alır.</p>
                        <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl">KAYDI TAMAMLA</button>
                    </form>
                ` : ''}
            </div>
        </body>
        </html>`);
    }

    // 2. ANA PANEL (DEĞERLENDİRME REPLİT KOPYASI)
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head>
    <body class="bg-slate-50 flex min-h-screen font-sans text-slate-900">
        <aside class="w-72 bg-white border-r flex flex-col h-screen sticky top-0">
            <div class="p-6 border-b font-bold text-xl text-indigo-600 flex items-center"><i class="fas fa-book-open mr-3"></i> Rehberlik</div>
            <nav class="p-4 space-y-2 flex-1">
                <a href="/?page=dashboard&tab=ozet" class="block p-3 rounded-xl ${tab === 'ozet' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'} font-bold text-sm">Özet</a>
                <a href="/?page=dashboard&tab=degerlendirme" class="block p-3 rounded-xl ${tab === 'degerlendirme' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'} font-bold text-sm">Değerlendirme</a>
                <a href="/?page=dashboard&tab=profil" class="block p-3 rounded-xl ${tab === 'profil' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} font-bold text-sm">Profil</a>
                <a href="/?page=dashboard&tab=okullar" class="block p-3 rounded-xl ${tab === 'okullar' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'} font-bold text-sm">Okullar</a>
            </nav>
            <div class="p-6 border-t"><a href="/?page=login" class="text-red-500 font-bold text-xs uppercase tracking-widest">Güvenli Çıkış</a></div>
        </aside>

        <main class="flex-1 p-10">
            ${tab === 'degerlendirme' ? `
                <h2 class="text-4xl font-black mb-10 tracking-tighter">Değerlendirme Sistemi</h2>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-8 rounded-[2rem] border shadow-sm">
                        <h3 class="font-bold text-slate-400 text-xs mb-6 uppercase tracking-widest">Öğrenci Girişi</h3>
                        <form action="/ekle" method="POST" class="space-y-4">
                            <input type="text" name="ad" placeholder="Ad Soyad" class="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                            <input type="text" name="sinif" placeholder="Sınıf" class="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                            <div class="space-y-4 pt-4">
                                <label class="text-xs font-bold">Disiplin Puanı</label>
                                <input type="range" name="disiplin" min="0" max="10" class="w-full accent-indigo-600">
                                <label class="text-xs font-bold">Sosyal Uyum</label>
                                <input type="range" name="sosyal" min="0" max="10" class="w-full accent-indigo-600">
                            </div>
                            <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl mt-6">HESAPLA VE KAYDET</button>
                        </form>
                    </div>
                    <div class="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col justify-center items-center text-center">
                        <h3 class="font-bold text-slate-400 text-xs mb-10 uppercase tracking-widest">Karar Analizi</h3>
                        <div class="w-40 h-40 rounded-full border-8 border-indigo-100 flex items-center justify-center mb-6">
                            <span class="text-4xl font-black text-indigo-600">--</span>
                        </div>
                        <p class="text-slate-400 text-sm">Veri girişi bekleniyor...</p>
                    </div>
                    <div class="bg-indigo-900 p-8 rounded-[2rem] text-white shadow-xl flex flex-col">
                        <h3 class="font-bold opacity-50 text-xs mb-6 uppercase tracking-widest">Sistem Tavsiyesi</h3>
                        <div class="flex-1 flex flex-col justify-center">
                            <i class="fas fa-robot text-4xl mb-4 opacity-20"></i>
                            <p class="text-lg font-medium">Bulanık mantık motoru öğrenci verilerini analiz ederek en uygun rehberlik rotasını belirler.</p>
                        </div>
                    </div>
                </div>
            ` : ''}

            ${tab === 'ozet' ? `
                <h2 class="text-4xl font-black mb-10 tracking-tighter">Hocam Hoş Geldiniz</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-10 rounded-[2rem] border shadow-sm border-l-8 border-l-red-500">
                        <h3 class="text-red-500 font-bold text-xs uppercase mb-6">Rehbere Yönlendirilenler</h3>
                        <p class="text-slate-400 italic">Henüz kritik vaka bulunamadı.</p>
                    </div>
                </div>
            ` : ''}
        </main>
    </body>
    </html>`);
});

// LOGIC ROUTES
app.post("/send-code", (req, res) => {
    geciciKod = Math.floor(100000 + Math.random() * 900000).toString();
    res.redirect("/?page=login&step=2");
});

app.post("/verify-code", (req, res) => {
    res.redirect("/?page=login&step=register");
});

app.post("/register-teacher", (req, res) => {
    const { yas } = req.body;
    if (parseInt(yas) >= 25) {
        res.redirect("/?page=dashboard&role=teacher&tab=ozet");
    } else {
        res.redirect("/?page=dashboard&role=student&tab=profil");
    }
});

export default app;
