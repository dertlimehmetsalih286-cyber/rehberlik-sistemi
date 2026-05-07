import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- GÜNCELLENMİŞ VERİ SETİ (ZEYNEP ÇIKTI, SİZ GELDİNİZ) ---
let ogrenciler = [
    { 
        id: 1, 
        ad: "Cemilay Hoca", 
        numara: "001", 
        sinif: "Yönetim", 
        puan: 95, 
        durum: "Sorun Yok", 
        foto: "https://images.unsplash.com/photo-1544717297-fa95b3ee51f3?w=400", 
        tc: "12345678901", 
        dogum: "1995", 
        adres: "Sistem Yöneticisi Paneli" 
    },
    { 
        id: 2, 
        ad: "Mehmet Salih", 
        numara: "101", 
        sinif: "10-B", 
        puan: 25, 
        durum: "Yönlendir", 
        foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400", 
        tc: "98765432109", 
        dogum: "2010", 
        adres: "İstanbul" 
    }
];

let okullar = [
    { id: 1, ad: "Şehit Mehmet Acubucu İHL", ogrenciSayisi: 450, ortalama: 72, foto: "" } 
];

let geciciKod = "";

app.get("/", (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'teacher';
    const step = req.query.step || '1';
    const detailId = req.query.detailId;

    // --- GÜVENLİK SİSTEMİ (SMS KODU) ---
    if (page === 'login') {
        return res.send(`
        <!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head>
        <body class="bg-slate-100 min-h-screen flex items-center justify-center p-4">
            <div class="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-200 text-center">
                <div class="inline-block bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg"><i class="fas fa-book-open text-white text-2xl"></i></div>
                <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter italic mb-8">Güvenli Rehberlik Portalı</h1>
                ${step === '1' ? `
                    <form action="/send-code" method="POST" class="space-y-4">
                        <input type="hidden" name="loginRole" value="${role}">
                        <input type="text" name="identifier" placeholder="${role === 'teacher' ? 'Telefon Numaranız' : 'Okul Numaranız'}" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold">
                        <button class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl">KOD GÖNDER</button>
                    </form>
                ` : `
                    <div class="mb-6"><p class="text-orange-500 font-black animate-pulse uppercase tracking-widest">KOD: ${geciciKod}</p></div>
                    <form action="/verify-code" method="POST" class="space-y-4">
                        <input type="hidden" name="verifyRole" value="${role}">
                        <input type="text" name="code" placeholder="6 HANELİ KOD" required class="w-full p-4 bg-slate-50 border rounded-2xl text-center text-3xl font-black outline-none tracking-widest">
                        <button class="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl uppercase">Sistemi Aç</button>
                    </form>
                `}
            </div>
        </body></html>`);
    }

    const isTeacher = role === 'teacher';

    res.send(`
    <!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        #sidebar { transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); width: 280px; }
        #sidebar.collapsed { width: 85px; }
        .nav-text { transition: opacity 0.2s; opacity: 1; }
        .collapsed .nav-text { opacity: 0; display: none; }
        .tab-active { background: #1e293b; color: white !important; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    </style></head>
    <body class="bg-slate-50 flex min-h-screen font-sans">
        
        <aside id="sidebar" class="bg-white border-r flex flex-col h-screen sticky top-0 z-50">
            <div class="p-6 border-b flex items-center justify-center cursor-pointer" onclick="document.getElementById('sidebar').classList.toggle('collapsed')">
                <i class="fas fa-book-open text-indigo-600 text-2xl"></i>
                <span class="nav-text font-black ml-4 text-xl tracking-tighter uppercase italic">Rehberlik</span>
            </div>
            <nav class="p-4 space-y-2 flex-1">
                ${isTeacher ? `
                    <a href="/?tab=ozet&role=teacher" class="flex items-center p-4 rounded-2xl ${tab === 'ozet' ? 'tab-active' : 'text-slate-400'}">
                        <i class="fas fa-th-large w-6 text-center"></i><span class="nav-text ml-4 font-black text-[10px] uppercase">Özet</span>
                    </a>
                    <a href="/?tab=degerlendirme&role=teacher" class="flex items-center p-4 rounded-2xl ${tab === 'degerlendirme' ? 'tab-active' : 'text-slate-400'}">
                        <i class="fas fa-robot w-6 text-center text-indigo-500"></i><span class="nav-text ml-4 font-black text-[10px] uppercase">Değerlendirme</span>
                    </a>
                    <a href="/?tab=ogrenciler&role=teacher" class="flex items-center p-4 rounded-2xl ${tab === 'ogrenciler' ? 'tab-active' : 'text-slate-400'}">
                        <i class="fas fa-user-friends w-6 text-center"></i><span class="nav-text ml-4 font-black text-[10px] uppercase">Öğrenciler</span>
                    </a>
                ` : ''}
                <a href="/?tab=profil&role=${role}" class="flex items-center p-4 rounded-2xl ${tab === 'profil' ? 'tab-active' : 'text-slate-400'}">
                    <i class="fas fa-id-card w-6 text-center"></i><span class="nav-text ml-4 font-black text-[10px] uppercase">Profil</span>
                </a>
                <a href="/?tab=okullar&role=${role}" class="flex items-center p-4 rounded-2xl ${tab === 'okullar' ? 'tab-active' : 'text-slate-400'}">
                    <i class="fas fa-university w-6 text-center"></i><span class="nav-text ml-4 font-black text-[10px] uppercase">Okullar</span>
                </a>
            </nav>
            <div class="p-6 border-t"><a href="/?page=login" class="text-red-500 font-black text-[10px] uppercase"><i class="fas fa-power-off"></i></a></div>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            ${tab === 'ozet' && isTeacher ? `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div class="bg-white p-8 rounded-[3rem] shadow-sm border text-center font-black italic">Toplam: ${ogrenciler.length}</div>
                    <div class="bg-emerald-500 p-8 rounded-[3rem] text-white shadow-xl text-center font-black italic uppercase">Gözlem: 640</div>
                    <div class="bg-orange-500 p-8 rounded-[3rem] text-white shadow-xl text-center font-black italic uppercase">Gözetim: 210</div>
                    <div class="bg-red-500 p-8 rounded-[3rem] text-white shadow-xl text-center font-black italic uppercase">Yönlendir: 150</div>
                </div>
            ` : ''}

            ${tab === 'degerlendirme' && isTeacher ? `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div class="bg-white p-10 rounded-[4rem] border shadow-sm">
                        <form class="space-y-6">
                            <input type="text" placeholder="AD SOYAD" required class="w-full p-4 bg-slate-50 border rounded-2xl font-black">
                            <input type="text" placeholder="SINIF / NO" required class="w-full p-4 bg-slate-50 border rounded-2xl font-black">
                            <div class="space-y-4 pt-4">
                                <label class="text-[10px] font-black uppercase text-slate-400">Disiplin / Sosyal / Akademik / Devamsızlık / Aile</label>
                                <input type="range" min="0" max="10" class="w-full accent-indigo-600" oninput="updateC()">
                                <input type="range" min="0" max="10" class="w-full accent-indigo-600" oninput="updateC()">
                                <input type="range" min="0" max="10" class="w-full accent-indigo-600" oninput="updateC()">
                                <input type="range" min="0" max="10" class="w-full accent-indigo-600" oninput="updateC()">
                                <input type="range" min="0" max="10" class="w-full accent-indigo-600" oninput="updateC()">
                            </div>
                            <button type="button" class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl">KAYDET</button>
                        </form>
                    </div>
                    <div class="flex items-center justify-center bg-white rounded-[4rem] border shadow-sm">
                        <div class="w-64 h-64 rounded-full border-[20px] border-indigo-50 flex items-center justify-center">
                            <span id="lS" class="text-7xl font-black text-indigo-600 italic">50</span>
                        </div>
                    </div>
                </div>
                <script>function updateC() { const r = document.querySelectorAll('input[type="range"]'); let s = 0; r.forEach(i => s += parseInt(i.value)); document.getElementById('lS').innerText = s * 2; }</script>
            ` : ''}

            ${tab === 'okullar' ? `
                ${okullar.map(okul => `
                    <div class="bg-white rounded-[4rem] overflow-hidden border shadow-sm">
                        ${okul.foto === "" ? `
                            <div class="p-16 text-center bg-red-50 border-b-8 border-red-500">
                                <h3 class="text-red-600 font-black uppercase text-2xl italic mb-6">⚠️ OKUL FOTOĞRAFI EKSİK!</h3>
                                ${isTeacher ? `<button class="bg-red-600 text-white px-10 py-4 rounded-3xl font-black uppercase text-xs">FOTOĞRAF EKLE</button>` : `<p class="text-red-400 font-bold uppercase text-xs">Fotoğraf Bekleniyor...</p>`}
                            </div>
                        ` : `<img src="${okul.foto}" class="w-full h-72 object-cover">`}
                        <div class="p-10 flex justify-between items-center"><h3 class="text-3xl font-black uppercase italic">${okul.ad}</h3><span class="text-5xl font-black text-indigo-600">${okul.ortalama}</span></div>
                    </div>
                `).join('')}
            ` : ''}

            ${tab === 'ogrenciler' && isTeacher ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${ogrenciler.map(o => `
                        <div class="bg-white p-8 rounded-[3rem] border shadow-sm cursor-pointer" onclick="location.href='/?tab=ogrenciler&role=teacher&detailId=${o.id}'">
                            <div class="flex items-center space-x-6">
                                <img src="${o.foto}" class="w-20 h-20 rounded-[2rem] object-cover border-4 border-slate-50">
                                <h4 class="font-black text-slate-800 uppercase italic">${o.ad}</h4>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${detailId ? `
                    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
                        <div class="bg-white max-w-xl w-full rounded-[4rem] p-12 relative shadow-2xl">
                            <button onclick="location.href='/?tab=ogrenciler&role=teacher'" class="absolute top-8 right-8 text-3xl"><i class="fas fa-times-circle text-slate-300"></i></button>
                            <img src="${ogrenciler.find(o => o.id == detailId).foto}" class="w-40 h-40 rounded-[3rem] mx-auto mb-8 shadow-2xl object-cover">
                            <h2 class="text-3xl font-black text-center uppercase mb-8">${ogrenciler.find(o => o.id == detailId).ad}</h2>
                            <div class="space-y-3 font-black text-[10px] uppercase">
                                <div class="p-4 bg-slate-50 rounded-2xl flex justify-between"><span>T.C.</span> <span>${ogrenciler.find(o => o.id == detailId).tc}</span></div>
                                <div class="p-4 bg-slate-50 rounded-2xl flex justify-between"><span>ADRES</span> <span>${ogrenciler.find(o => o.id == detailId).adres}</span></div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            ` : ''}

            ${tab === 'profil' ? `
                <div class="max-w-2xl mx-auto bg-white p-12 rounded-[4rem] border shadow-2xl text-center">
                    <div class="relative inline-block">
                        <img src="${ogrenciler[0].foto}" class="w-48 h-48 rounded-[3.5rem] border-8 border-white shadow-2xl object-cover">
                        <button onclick="alert('Yüz Tanıma Aktif: Sadece kendi fotoğrafınızı ekleyin!')" class="absolute bottom-2 right-2 bg-indigo-600 text-white p-4 rounded-full shadow-2xl"><i class="fas fa-camera"></i></button>
                    </div>
                    <h2 class="text-4xl font-black italic uppercase mt-10">${isTeacher ? 'CEMİLAY HOCA' : 'ÖĞRENCİ PROFİLİ'}</h2>
                    <p class="text-indigo-600 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Sistem Yöneticisi & Rehberlik Uzmanı</p>
                </div>
            ` : ''}
        </main>
    </body></html>`);
});

app.post("/send-code", (req, res) => {
    geciciKod = Math.floor(100000 + Math.random() * 900000).toString();
    res.redirect(`/?page=login&role=${req.body.loginRole}&step=2`);
});

app.post("/verify-code", (req, res) => {
    const r = req.body.verifyRole;
    res.redirect(`/?tab=${r === 'teacher' ? 'ozet' : 'profil'}&role=${r}`);
});

export default app;
