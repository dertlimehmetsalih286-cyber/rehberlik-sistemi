
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- GELİŞMİŞ VERİ SETİ ---
let ogrenciler = [
    { id: 1, ad: "Mehmet Salih", numara: "101", sinif: "10-B", puan: 25, durum: "Yönlendir", foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400" },
    { id: 2, ad: "Zeynep", numara: "102", sinif: "11-C", puan: 85, durum: "Gerekiyorsa Gözlem", foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" }
];

let okullar = [
    { ad: "Şehit Mehmet Acubucu İHL", ogrenciSayisi: 450, ortalama: 72, foto: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400" },
    { ad: "Atatürk Anadolu Lisesi", ogrenciSayisi: 820, ortalama: 65, foto: "https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?w=400" }
];

app.get("/", (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'teacher';

    if (page === 'login') {
        return res.send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head><body class="bg-slate-100 min-h-screen flex items-center justify-center font-sans"><div class="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border-t-8 border-indigo-600"><div class="inline-block bg-indigo-600 p-5 rounded-3xl mb-6 shadow-xl"><i class="fas fa-book-open text-white text-4xl"></i></div><h1 class="text-3xl font-black text-slate-800 tracking-tighter mb-10 uppercase">Rehberlik Sistemi</h1><div class="space-y-4"><a href="/?page=dashboard&role=teacher&tab=ozet" class="block p-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg transform hover:-translate-y-1 transition uppercase">Öğretmen Girişi</a><a href="/?page=dashboard&role=student&tab=profil" class="block p-5 border-4 border-slate-50 text-slate-700 rounded-2xl font-black hover:border-indigo-600 transition transform hover:-translate-y-1 uppercase">Öğrenci Girişi</a></div></div></body></html>`);
    }

    const isTeacher = role === 'teacher';

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        #sidebar { transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); width: 280px; }
        #sidebar.collapsed { width: 85px; }
        .nav-text { transition: opacity 0.2s; }
        .collapsed .nav-text { display: none; }
        .tab-active { background: #1e293b; color: white !important; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3); }
        .stat-bar { transition: height 1s ease-out; }
    </style></head>
    <body class="bg-slate-50 flex min-h-screen font-sans text-slate-900">
        
        <aside id="sidebar" class="bg-white border-r flex flex-col h-screen sticky top-0 z-50">
            <div class="p-6 border-b flex items-center justify-center cursor-pointer" onclick="document.getElementById('sidebar').classList.toggle('collapsed')">
                <i class="fas fa-book-open text-indigo-600 text-2xl"></i>
                <span class="nav-text font-black ml-4 text-xl tracking-tighter uppercase">Rehberlik</span>
            </div>
            <nav class="p-4 space-y-2 flex-1">
                ${isTeacher ? `
                    <a href="/?page=dashboard&role=teacher&tab=ozet" class="flex items-center p-4 rounded-2xl ${tab === 'ozet' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                        <i class="fas fa-chart-bar w-6 text-center"></i><span class="nav-text ml-4 font-black text-xs uppercase">Özet</span>
                    </a>
                    <a href="/?page=dashboard&role=teacher&tab=degerlendirme" class="flex items-center p-4 rounded-2xl ${tab === 'degerlendirme' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                        <i class="fas fa-robot w-6 text-center"></i><span class="nav-text ml-4 font-black text-xs uppercase">Değerlendirme</span>
                    </a>
                    <a href="/?page=dashboard&role=teacher&tab=ogrenciler" class="flex items-center p-4 rounded-2xl ${tab === 'ogrenciler' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                        <i class="fas fa-user-friends w-6 text-center"></i><span class="nav-text ml-4 font-black text-xs uppercase">Öğrenciler</span>
                    </a>
                ` : ''}
                <a href="/?page=dashboard&role=${role}&tab=profil" class="flex items-center p-4 rounded-2xl ${tab === 'profil' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                    <i class="fas fa-id-card w-6 text-center"></i><span class="nav-text ml-4 font-black text-xs uppercase">Profil</span>
                </a>
                <a href="/?page=dashboard&role=${role}&tab=okullar" class="flex items-center p-4 rounded-2xl ${tab === 'okullar' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                    <i class="fas fa-university w-6 text-center"></i><span class="nav-text ml-4 font-black text-xs uppercase">Okullar</span>
                </a>
            </nav>
            <div class="p-6 border-t"><a href="/?page=login" class="text-red-500 font-black text-[10px] uppercase tracking-widest"><i class="fas fa-power-off"></i></a></div>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            
            ${tab === 'ozet' && isTeacher ? `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                        <p class="text-[10px] font-black text-slate-400 uppercase mb-2">Toplam Kapasite</p>
                        <p class="text-4xl font-black text-indigo-600">1000+</p>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center border-l-8 border-l-emerald-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase mb-2">Gözlem Gerekmez</p>
                        <p class="text-4xl font-black text-emerald-500">640</p>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center border-l-8 border-l-orange-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase mb-2">Gözlem Gerekebilir</p>
                        <p class="text-4xl font-black text-orange-500">210</p>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center border-l-8 border-l-red-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase mb-2">Yönlendir Grubu</p>
                        <p class="text-4xl font-black text-red-500">150</p>
                    </div>
                </div>

                <div class="bg-white p-10 rounded-[3rem] border shadow-sm">
                    <h3 class="font-black text-slate-800 uppercase text-xs mb-10 tracking-[0.2em]">Öğrenci Dağılım Grafiği (N:1000)</h3>
                    <div class="flex items-end space-x-12 h-80 border-b pb-4 relative">
                        <div class="absolute -left-10 h-full flex flex-col justify-between text-[10px] font-bold text-slate-300">
                            <span>1000</span><span>750</span><span>500</span><span>250</span><span>0</span>
                        </div>
                        <div class="flex-1 bg-emerald-500 stat-bar rounded-t-3xl shadow-lg" style="height: 64%"></div>
                        <div class="flex-1 bg-orange-500 stat-bar rounded-t-3xl shadow-lg" style="height: 21%"></div>
                        <div class="flex-1 bg-red-500 stat-bar rounded-t-3xl shadow-lg" style="height: 15%"></div>
                    </div>
                    <div class="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                        <span>Sorunsuz Grup</span><span>Takip Grubu</span><span>Kritik Grup</span>
                    </div>
                </div>
            ` : ''}

            ${tab === 'degerlendirme' && isTeacher ? `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div class="bg-white p-10 rounded-[3rem] border shadow-sm">
                        <h3 class="font-black text-slate-400 text-[10px] uppercase mb-10 tracking-widest text-center">Analiz Kriterleri</h3>
                        <div class="space-y-8">
                            <div><label class="flex justify-between font-bold text-xs uppercase mb-3">Disiplin Geçmişi <span id="v1">5</span></label>
                            <input type="range" min="0" max="10" value="5" class="w-full accent-indigo-600" oninput="updateScore()"></div>
                            <div><label class="flex justify-between font-bold text-xs uppercase mb-3">Sosyal Uyum <span id="v2">5</span></label>
                            <input type="range" min="0" max="10" value="5" class="w-full accent-indigo-600" oninput="updateScore()"></div>
                            <div><label class="flex justify-between font-bold text-xs uppercase mb-3">Akademik Durum <span id="v3">5</span></label>
                            <input type="range" min="0" max="10" value="5" class="w-full accent-indigo-600" oninput="updateScore()"></div>
                        </div>
                        <button class="w-full bg-slate-900 text-white font-black py-5 rounded-2xl mt-12 uppercase tracking-widest">Sisteme Kaydet</button>
                    </div>
                    <div class="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-white">
                        <div class="w-64 h-64 rounded-full border-[20px] border-indigo-400 flex flex-col items-center justify-center bg-indigo-700 shadow-inner transform hover:rotate-12 transition">
                            <span id="liveScore" class="text-8xl font-black italic tracking-tighter text-white">50</span>
                            <span class="text-[10px] font-black uppercase tracking-widest opacity-50">Canlı Analiz</span>
                        </div>
                        <p id="liveStatus" class="mt-10 text-2xl font-black uppercase italic tracking-widest">Gözlem Önerilir</p>
                    </div>
                </div>
                <script>
                    function updateScore() {
                        const r = document.querySelectorAll('input[type="range"]');
                        const score = Math.round((parseInt(r[0].value) + parseInt(r[1].value) + parseInt(r[2].value)) * 3.33);
                        document.getElementById('liveScore').innerText = score;
                        document.getElementById('liveStatus').innerText = score > 70 ? "SORUN YOK" : (score > 30 ? "GÖZLEM ÖNERİLİR" : "KRİTİK DURUM");
                        document.getElementById('v1').innerText = r[0].value;
                        document.getElementById('v2').innerText = r[1].value;
                        document.getElementById('v3').innerText = r[2].value;
                    }
                </script>
            ` : ''}

            ${tab === 'ogrenciler' && isTeacher ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${ogrenciler.map(o => `
                        <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm hover:shadow-xl transition cursor-pointer group">
                            <div class="flex items-center space-x-6">
                                <img src="${o.foto}" class="w-20 h-20 rounded-2xl object-cover border-4 border-slate-50 shadow-md group-hover:scale-110 transition">
                                <div>
                                    <h4 class="font-black text-slate-800 uppercase tracking-tighter">${o.ad}</h4>
                                    <p class="text-[10px] font-black text-indigo-600 uppercase italic">${o.sinif} / No: ${o.numara}</p>
                                </div>
                            </div>
                            <div class="mt-6 pt-6 border-t flex justify-between items-center">
                                <span class="text-[10px] font-black text-slate-400 uppercase">Analiz Sonucu:</span>
                                <span class="px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 italic">${o.durum.toUpperCase()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${tab === 'okullar' ? `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    ${okullar.map(okul => `
                        <div class="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl transition">
                            <img src="${okul.foto}" class="w-full h-48 object-cover">
                            <div class="p-8 flex justify-between items-center">
                                <div>
                                    <h3 class="text-xl font-black text-slate-800 uppercase italic">${okul.ad}</h3>
                                    <p class="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">${okul.ogrenciSayisi} Kayıtlı Öğrenci</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-4xl font-black text-indigo-600 tracking-tighter">${okul.ortalama}</span>
                                    <p class="text-[10px] font-black text-slate-400 uppercase">Puan Ortalama</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${tab === 'profil' ? `
                <div class="max-w-2xl mx-auto bg-white p-12 rounded-[4rem] border shadow-2xl text-center relative overflow-hidden">
                    <div class="bg-indigo-600 h-32 absolute top-0 left-0 w-full opacity-10"></div>
                    <img src="https://images.unsplash.com/photo-1544717297-fa95b3ee51f3?w=400" class="w-48 h-48 rounded-[3rem] border-8 border-white shadow-2xl mx-auto object-cover relative z-10">
                    <h2 class="text-4xl font-black text-slate-800 tracking-tighter mt-8 uppercase italic">Öğretmen: Cemilay</h2>
                    <p class="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px] mt-4 italic">Rehberlik & Karar Destek Uzmanı</p>
                    <div class="mt-12 p-8 bg-slate-50 rounded-[3rem] border">
                        <p class="text-sm italic text-slate-500 font-medium leading-relaxed">"Geleceğin kararları, bugünün verileriyle şekillenir."</p>
                    </div>
                </div>
            ` : ''}

        </main>
    </body>
    </html>`);
});

export default app;
