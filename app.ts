import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- GÜNCELLENMİŞ VERİ SETİ (AYŞE GÜL EKLENDİ) ---
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
        adres: "Sistem Yöneticisi" 
    },
    { 
        id: 2, 
        ad: "Ayşe Gül", 
        numara: "102", 
        sinif: "11-C", 
        puan: 85, 
        durum: "Sorun Yok", 
        foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", 
        tc: "98765432109", 
        dogum: "2009", 
        adres: "Ankara/Çankaya" 
    },
    { 
        id: 3, 
        ad: "Mehmet Salih", 
        numara: "101", 
        sinif: "10-B", 
        puan: 25, 
        durum: "Yönlendir", 
        foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400", 
        tc: "98765432108", 
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
    <body class="bg-slate-50 flex min-h-screen font-sans text-slate-900">
        
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
            <div class="p-6 border-t font-black"><a href="/?page=login" class="text-red-500 text-[10px] uppercase tracking-widest"><i class="fas fa-power-off"></i> Çıkış</a></div>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            
            ${tab === 'ozet' && isTeacher ? `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 italic font-black">
                    <div class="bg-white p-8 rounded-[3rem] shadow-sm border text-center uppercase">Toplam: ${ogrenciler.length}</div>
                    <div class="bg-emerald-500 p-8 rounded-[3rem] text-white shadow-xl text-center uppercase">Gözlem: 640</div>
                    <div class="bg-orange-500 p-8 rounded-[3rem] text-white shadow-xl text-center uppercase">Gözetim: 210</div>
                    <div class="bg-red-500 p-8 rounded-[3rem] text-white shadow-xl text-center uppercase">Yönlendir: 150</div>
                </div>
            ` : ''}

            ${tab === 'degerlendirme' && isTeacher ? `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div class="bg-white p-10 rounded-[4rem] border shadow-sm">
                        <form class="space-y-6">
                            <input type="text" placeholder="AD SOYAD" class="w-full p-4 bg-slate-50 border rounded-2xl font-black uppercase">
                            <input type="text" placeholder="SINIF / NO" class="w-full p-4 bg-slate-50 border rounded-2xl font-black uppercase">
                            <div class="space-y-4 pt-4">
                                <label class="text-[10px] font-black uppercase text-slate-400">Disiplin / Sosyal / Akademik / Devamsızlık / Aile</label>
                                <input type="range" min="0" max="10" class="w-full accent-indigo-600" oninput="uS()">
                                <input type="range" min="0" max="10" class="w-full accent-indigo-600" oninput="uS()">
                                <input type="range" min="0" max="10" class="w-full accent
