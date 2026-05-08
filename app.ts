import express from "express";
import cors from "cors";
import sql from "mssql"; 
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- SQL SERVER BAĞLANTI AYARLARI ---
// Not: Şifre ve veritabanı bilgilerini kendi sistemine göre güncellemelisin.
const sqlConfig = {
    user: 'sa', 
    password: 'SeninSifren123', 
    database: 'RehberlikDB', 
    server: 'localhost', 
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

const anketSorulari = [
    "Okulun fiziksel imkanlarından memnun musunuz?",
    "Öğretmenlerinizle olan iletişiminiz ne kadar güçlü?",
    "Okul yemekhanesindeki yemek çeşitliliğini yeterli buluyor musunuz?",
    "Sosyal ve kültürel faaliyetlerin sayısından memnun musunuz?",
    "Okulun temizlik ve hijyen standartlarını nasıl buluyorsunuz?",
    "Rehberlik servisinin size olan desteği yeterli mi?",
    "Kantin fiyatları ve ürün kalitesi beklentinizi karşılıyor mu?"
];

app.get("/", async (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'student';

    // --- SQL'DEN VERİ ÇEKME ---
    let ogrenciler = [];
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query("SELECT * FROM Ogrenciler");
        ogrenciler = result.recordset;
    } catch (err) {
        logger.error("SQL Veri Çekme Hatası:", err);
        // SQL bağlı değilse varsayılan boş bir kullanıcı gösterir
    }

    if (page === 'login') {
        return res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head>
        <body class="bg-slate-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div class="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-200 text-center">
                <div class="inline-block bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg"><i class="fas fa-book-open text-white text-2xl"></i></div>
                <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8 italic">Rehberlik Portalı</h1>
                <form action="/login-check" method="POST" class="space-y-4 text-left">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">TC Kimlik No</label>
                    <input type="text" name="tc" placeholder="12345678901" maxlength="11" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold">
                    <button class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition">SİSTEME GİRİŞ YAP</button>
                </form>
            </div>
        </body></html>`);
    }

    const isTeacher = role === 'teacher';
    const me = ogrenciler[0] || { ad: "Öğrenci Kaydı Yok", foto: "https://via.placeholder.com/150", telefon: "", anketTamam: false };
    const randomSoru = anketSorulari[Math.floor(Math.random() * anketSorulari.length)];

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        #sidebar { transition: width 0.3s ease; width: 280px; }
        #sidebar.collapsed { width: 85px; }
        .nav-text { transition: opacity 0.2s; opacity: 1; }
        .collapsed .nav-text { opacity: 0; display: none; }
        .tab-active { background: #1e293b; color: white !important; }
    </style></head>
    <body class="bg-slate-50 flex min-h-screen font-sans text-slate-900">
        
        <aside id="sidebar" class="bg-white border-r flex flex-col h-screen sticky top-0 z-50">
            <div class="p-6 border-b flex items-center justify-center cursor-pointer" onclick="document.getElementById('sidebar').classList.toggle('collapsed')">
                <i class="fas fa-database text-indigo-600 text-2xl"></i>
                <span class="nav-text font-black ml-4 text-xl tracking-tighter uppercase italic">Rehberlik</span>
            </div>
            <nav class="p-4 space-y-2 flex-1">
                ${isTeacher ? `
                    <a href="/?tab=ozet&role=teacher" class="flex items-center p-4 rounded-2xl ${tab === 'ozet' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                        <i class="fas fa-chart-pie w-6"></i><span class="nav-text ml-4 font-black text-xs uppercase">SQL Özet</span>
                    </a>
                ` : ''}
                <a href="/?tab=profil&role=${role}" class="flex items-center p-4 rounded-2xl ${tab === 'profil' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                    <i class="fas fa-user-circle w-6"></i><span class="nav-text ml-4 font-black text-xs uppercase">Profilim</span>
                </a>
                <a href="/?tab=anket&role=${role}" class="flex items-center p-4 rounded-2xl ${tab === 'anket' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                    <i class="fas fa-poll-h w-6"></i><span class="nav-text ml-4 font-black text-xs uppercase text-orange-500">Memnuniyet Anketi</span>
                </a>
            </nav>
            <div class="p-6 border-t font-black"><a href="/?page=login" class="text-red-500 text-[10px] uppercase"><i class="fas fa-power-off"></i> Çıkış</a></div>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            ${tab === 'anket' ? `
                <div class="max-w-3xl mx-auto bg-white p-12 rounded-[3.5rem] border shadow-sm relative overflow-hidden">
                    <div class="bg-orange-500 h-2 absolute top-0 left-0 w-full"></div>
                    <h2 class="text-3xl font-black italic uppercase text-center mb-8">Okul Memnuniyet Anketi</h2>
                    ${me.anketTamam ? `
                        <div class="p-10 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 border-dashed text-center">
                            <h3 class="text-emerald-800 font-black text-xl italic">SQL VERİSİ KAYDEDİLDİ!</h3>
                        </div>
                    ` : `
                        <div class="p-10 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 text-center font-bold">"${randomSoru}"</div>
                        <form action="/anket-kaydet" method="POST" class="grid grid-cols-5 gap-4 mt-8">
                            ${[1, 2, 3, 4, 5].map(p => `<button type="submit" name="puan" value="${p}" class="p-6 bg-white border-2 rounded-2xl font-black hover:border-orange-500 hover:text-orange-500 transition shadow-sm">${p}</button>`).join('')}
                        </form>
                    `}
                </div>
            ` : ''}

            ${tab === 'ozet' && isTeacher ? `
                <div class="bg-white p-10 rounded-[3rem] border shadow-sm">
                    <h3 class="font-black text-indigo-600 uppercase text-xs mb-8 tracking-widest italic">SQL Canlı Tablo</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="text-[10px] text-slate-400 font-black uppercase"><tr><th class="p-4">ID</th><th class="p-4">Ad</th><th class="p-4">TC</th><th class="p-4">Anket</th></tr></thead>
                            <tbody class="text-sm font-bold">
                                ${ogrenciler.map(o => `<tr class="border-b"> <td class="p-4">${o.id}</td><td class="p-4">${o.ad}</td><td class="p-4">${o.tc}</td><td class="p-4">${o.anketTamam ? '✅' : '❌'}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        </main>
    </body></html>`);
});

// --- İŞLEM KAPILARI (POST) ---
app.post("/login-check", (req, res) => {
    const { tc } = req.body;
    if (tc === "12345678901") res.redirect("/?tab=anket&role=student");
    else res.redirect("/?page=login&error=1");
});

app.post("/anket-kaydet", async (req, res) => {
    const { puan } = req.body;
    try {
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('puan', sql.Int, puan)
            .query("UPDATE Ogrenciler SET anketTamam = 1, puan = @puan WHERE id = 1");
        res.redirect("/?tab=anket&role=student");
    } catch (err) { res.status(500).send("SQL Hatası: " + err.message); }
});

export default app;
