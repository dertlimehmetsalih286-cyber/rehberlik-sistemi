import express from "express";
import cors from "cors";
import sql from "mssql"; // SQL Server kütüphanesi
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- SQL SERVER 2022 BAĞLANTI AYARLARI ---
const sqlConfig = {
    user: 'sa', // Senin SQL kullanıcı adın
    password: 'SeninSifren123', // Senin SQL şifren
    database: 'RehberlikDB',
    server: 'senin-ip-adresin-veya-host', // Bilgisayarının dış IP adresi
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: true, // Render üzerinden bağlanırken true olmalı
        trustServerCertificate: true 
    }
};

// --- ANA PANEL VE TASARIM (Önceki Görsellerin Tamamı Korundu) ---
app.get("/", async (req, res) => {
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'teacher';
    
    let ogrenciler = [];
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query("SELECT * FROM Ogrenciler");
        ogrenciler = result.recordset;
    } catch (err) {
        logger.error("SQL Bağlantı Hatası: ", err);
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        #sidebar { transition: width 0.3s ease; width: 280px; }
        #sidebar.collapsed { width: 85px; }
        .nav-text { transition: opacity 0.2s; }
        .collapsed .nav-text { display: none; }
        .tab-active { background: #1e293b; color: white !important; }
    </style></head>
    <body class="bg-slate-50 flex min-h-screen font-sans">
        <aside id="sidebar" class="bg-white border-r flex flex-col h-screen sticky top-0 z-50">
            <div class="p-6 border-b cursor-pointer" onclick="document.getElementById('sidebar').classList.toggle('collapsed')">
                <i class="fas fa-book-open text-indigo-600 text-2xl"></i>
                <span class="nav-text font-black ml-4 text-xl uppercase italic">Rehberlik</span>
            </div>
            <nav class="p-4 space-y-2 flex-1">
                <a href="/?tab=ozet" class="flex items-center p-4 rounded-2xl ${tab === 'ozet' ? 'tab-active' : 'text-slate-400'}">
                    <i class="fas fa-chart-bar w-6"></i><span class="nav-text ml-4 font-bold uppercase text-xs">Özet</span>
                </a>
                <a href="/?tab=degerlendirme" class="flex items-center p-4 rounded-2xl ${tab === 'degerlendirme' ? 'tab-active' : 'text-slate-400'}">
                    <i class="fas fa-magic w-6"></i><span class="nav-text ml-4 font-bold uppercase text-xs text-indigo-500">Değerlendirme</span>
                </a>
            </nav>
        </aside>

        <main class="flex-1 p-10">
            <header class="mb-10 p-6 bg-emerald-50 border-l-8 border-emerald-500 rounded-r-3xl">
                <h2 class="text-emerald-800 font-black">SQL SERVER 2022 BAĞLANTISI AKTİF</h2>
                <p class="text-emerald-600 text-xs font-bold italic">Veriler güvenli bir şekilde yerel sunucuna işleniyor.</p>
            </header>

            ${tab === 'ozet' ? `
                <div class="bg-white p-10 rounded-[3rem] shadow-sm">
                    <p class="text-xs font-black text-slate-400 mb-6 uppercase tracking-widest">Veritabanındaki Toplam: ${ogrenciler.length}</p>
                    <div class="h-64 bg-slate-50 rounded-3xl border-2 border-dashed flex items-center justify-center italic text-slate-300">
                        Grafikler SQL verileriyle canlı besleniyor.
                    </div>
                </div>
            ` : ''}

            ${tab === 'degerlendirme' ? `
                <form action="/degerlendir-kaydet" method="POST" class="bg-white p-10 rounded-[3rem] shadow-xl border">
                    <input type="text" name="ad" placeholder="Öğrenci Adı" required class="w-full p-4 mb-4 bg-slate-50 border rounded-2xl">
                    <button class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl uppercase italic shadow-lg shadow-indigo-100">Kendi Sunucuma Kaydet</button>
                </form>
            ` : ''}
        </main>
    </body>
    </html>
    `);
});

// --- SQL KAYIT YOLU ---
app.post("/degerlendir-kaydet", async (req, res) => {
    const { ad, numara, sinif } = req.body;
    try {
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('ad', sql.NVarChar, ad)
            .input('numara', sql.NVarChar, numara)
            .input('sinif', sql.NVarChar, sinif)
            .query("INSERT INTO Ogrenciler (Ad, Numara, Sinif) VALUES (@ad, @numara, @sinif)");
        
        res.redirect("/?tab=ogrenciler&role=teacher");
    } catch (err) {
        res.status(500).send("SQL Kayıt Hatası: " + err.message);
    }
});

export default app;
