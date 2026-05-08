import express from "express";
import cors from "cors";
import sql from "mssql"; // SQL Server kütüphanesi eklendi
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- SQL SERVER BAĞLANTI AYARLARI ---
const sqlConfig = {
    user: 'sa', // SQL kullanıcı adın
    password: 'SeninSifren123', // SQL şifren
    database: 'RehberlikDB', // Oluşturduğun DB adı
    server: 'localhost', // Render'dan bağlanacaksan dış IP adresin
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// --- ANKET SORULARI (SQL'den de çekilebilir, şimdilik statik) ---
const anketSorulari = [
    "Okulun fiziksel imkanlarından memnun musunuz?",
    "Öğretmenlerinizle olan iletişiminiz ne kadar güçlü?",
    "Okul yemekhanesindeki yemek çeşitliliğini yeterli buluyor musunuz?",
    "Sosyal ve kültürel faaliyetlerin sayısından memnun musunuz?",
    "Okulun temizlik ve hijyen standartlarını nasıl buluyorsunuz?"
];

app.get("/", async (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'student';
    const step = req.query.step || '1';

    // --- VERİLERİ SQL'DEN ÇEK ---
    let ogrenciler = [];
    let okullar = [];
    try {
        let pool = await sql.connect(sqlConfig);
        let studentResult = await pool.request().query("SELECT * FROM Ogrenciler");
        let schoolResult = await pool.request().query("SELECT * FROM Okullar");
        ogrenciler = studentResult.recordset;
        okullar = schoolResult.recordset;
    } catch (err) {
        logger.error("SQL Bağlantı Hatası:", err);
    }

    if (page === 'login') {
        return res.send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head><body class="bg-slate-100 min-h-screen flex items-center justify-center p-4"><div class="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-200 text-center"><h1 class="text-2xl font-black text-slate-800 uppercase mb-8 italic">SQL Tabanlı Rehberlik</h1><form action="/login-check" method="POST" class="space-y-4 text-left"><label class="text-[10px] font-black uppercase text-slate-400 ml-2">TC Kimlik No</label><input type="text" name="tc" placeholder="12345678901" maxlength="11" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold"><button class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl">GİRİŞ YAP</button></form></div></body></html>`);
    }

    const isTeacher = role === 'teacher';
    const me = ogrenciler[0] || { ad: "Kayıt Yok", foto: "https://via.placeholder.com/150", telefon: "", anketTamam: false };
    const randomSoru = anketSorulari[Math.floor(Math.random() * anketSorulari.length)];

    res.send(`
    <!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        #sidebar { transition: width 0.3s ease; width: 280px; }
        #sidebar.collapsed { width: 85px; }
        .nav-text { opacity: 1; transition: 0.2s; }
        .collapsed .nav-text { display: none; }
        .tab-active { background: #1e293b; color: white !important; }
    </style></head>
    <body class="bg-slate-50 flex min-h-screen font-sans">
        <aside id="sidebar" class="bg-white border-r flex flex-col h-screen sticky top-0 z-50">
            <div class="p-6 border-b flex items-center justify-center cursor-pointer" onclick="document.getElementById('sidebar').classList.toggle('collapsed')"><i class="fas fa-database text-indigo-600 text-2xl"></i><span class="nav-text font-black ml-4 text-xl tracking-tighter uppercase italic">Rehberlik</span></div>
            <nav class="p-4 space-y-2 flex-1">
                ${isTeacher ? `<a href="/?tab=ozet&role=teacher" class="flex items-center p-4 rounded-2xl ${tab === 'ozet' ? 'tab-active' : 'text-slate-400'}"><i class="fas fa-chart-pie w-6"></i><span class="nav-text ml-4 font-black text-xs uppercase">SQL Özet</span></a>` : ''}
                <a href="/?tab=profil&role=${role}" class="flex items-center p-4 rounded-2xl ${tab === 'profil' ? 'tab-active' : 'text-slate-400'}"><i class="fas fa-user-circle w-6"></i><span class="nav-text ml-4 font-black text-xs uppercase">Profil</span></a>
                <a href="/?tab=anket&role=${role}" class="flex items-center p-4 rounded-2xl ${tab === 'anket' ? 'tab-active' : 'text-slate-400'}"><i class="fas fa-poll-h w-6"></i><span class="nav-text ml-4 font-black text-xs uppercase text-orange-500">SQL Anket</span></a>
            </nav>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            ${tab === 'anket' ? `
                <div class="max-w-3xl mx-auto bg-white p-12 rounded-[3.5rem] border shadow-sm text-center relative overflow-hidden">
                    <div class="bg-orange-500 h-2 absolute top-0 left-0 w-full"></div>
                    <h2 class="text-3xl font-black italic uppercase mb-8">Memnuniyet Anketi</h2>
                    ${me.anketTamam ? `<div class="p-10 bg-emerald-50 rounded-3xl text-emerald-600 font-bold uppercase italic border-2 border-emerald-100 border-dashed">Anket Verisi SQL'e Kaydedildi!</div>` : `
                        <div class="p-10 bg-slate-50 rounded-3xl border-2 border-slate-100 italic font-bold">"${randomSoru}"</div>
                        <form action="/anket-kaydet" method="POST" class="grid grid-cols-5 gap-4 mt-10">
                            ${[1, 2, 3, 4, 5].map(p => `<button type="submit" name="puan" value="${p}" class="p-6 bg-white border rounded-2xl font-black hover:bg-orange-50 hover:text-orange-500 transition">${p}</button>`).join('')}
                        </form>
                    `}
                </div>
            ` : ''}

            ${tab === 'ozet' && isTeacher ? `
                <div class="bg-white p-10 rounded-[3rem] border shadow-sm">
                    <h3 class="font-black text-slate-800 uppercase text-xs mb-8 tracking-widest italic text-indigo-600">SQL Canlı Veri Seti</h3>
                    <div class="overflow-x-auto"><table class="w-full text-left"><thead class="text-[10px] text-slate-400 font-black uppercase"><tr><th class="p-4">ID</th><th class="p-4">Ad</th><th class="p-4">TC</th><th class="p-4">Durum</th></tr></thead>
                    <tbody class="text-sm font-bold">${ogrenciler.map(o => `<tr class="border-b"> <td class="p-4">${o.id}</td><td class="p-4">${o.ad}</td><td class="p-4">${o.tc}</td><td class="p-4 text-indigo-600">${o.durum}</td></tr>`).join('')}</tbody></table></div>
                </div>
            ` : ''}
        </main>
    </body></html>`);
});

// --- SQL YAZMA ROUTE'LARI ---
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
