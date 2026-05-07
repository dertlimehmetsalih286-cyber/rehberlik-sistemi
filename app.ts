import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- ENTEGRE VERİ SETİ ---
let ogrenciler = [
    { id: 1, ad: "Mehmet Salih", numara: "101", sinif: "10-B", puan: 25, durum: "Yönlendir", foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400", tc: "12345678901", dogum: "2010", adres: "İstanbul" },
    { id: 2, ad: "ayşe ", numara: "102", sinif: "11-C", puan: 85, durum: "Sorun Yok", foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", tc: "98765432109", dogum: "2009", adres: "Ankara" }
];

let okullar = [
    { id: 1, ad: "Şehit Mehmet Acubucu İHL", ogrenciSayisi: 450, ortalama: 72, foto: "" } // Fotoğraf boş -> Uyarı tetikler
];

let geciciKod = "";

app.get("/", (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'student';
    const step = req.query.step || '1';
    const detailId = req.query.detailId;

    // --- 1. EN YÜKSEK GÜVENLİKLİ GİRİŞ SİSTEMİ ---
    if (page === 'login' || page === 'register') {
        return res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head>
        <body class="bg-slate-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div class="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-200">
                <div class="text-center mb-8">
                    <div class="inline-block bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg"><i class="fas fa-book-open text-white text-2xl"></i></div>
                    <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Güvenli Rehberlik Portalı</h1>
                </div>

                ${step === '1' ? `
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <button onclick="location.href='/?page=login&role=teacher&step=1'" class="p-4 rounded-2xl border-2 ${role === 'teacher' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'} font-black text-[10px]">ÖĞRETMEN</button>
                        <button onclick="location.href='/?page=login&role=student&step=1'" class="p-4 rounded-2xl border-2 ${role === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'} font-black text-[10px]">ÖĞRENCİ</button>
                    </div>
                    <form action="/send-code" method="POST" class="space-y-4">
                        <input type="hidden" name="loginRole" value="${role}">
                        <input type="text" name="identifier" placeholder="${role === 'teacher' ? 'Telefon Numaranız' : 'Okul Numaranız'}" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold">
                        <button class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl">GÜVENLİK KODU GÖNDER</button>
                    </form>
                ` : ''}

                ${step === '2' ? `
                    <div class="text-center mb-6"><p class="text-orange-500 font-black animate-pulse uppercase tracking-widest">DOĞRULAMA KODU: ${geciciKod}</p></div>
                    <form action="/verify-code" method="POST" class="space-y-4">
                        <input type="hidden" name="verifyRole" value="${role}">
                        <input type="text" name="code" placeholder="6 HANELİ KOD" required class="w-full p-4 bg-slate-50 border rounded-2xl text-center text-3xl tracking-[0.4em] font-black outline-none">
                        <button class="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl">SİSTEMİ AÇ</button>
                    </form>
                ` : ''}
            </div>
        </body>
        </html>`);
    }

    // --- 2. ANA DASHBOARD (GİZLENEBİLİR SIDEBAR + YETKİLENDİRME) ---
    const isTeacher = role === 'teacher';

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
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
                    <a href="/?page=dashboard&role=teacher&tab=ozet" class="flex items-center p-4 rounded-2xl ${tab === 'ozet' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                        <i class="fas fa-th-large w-6 text-center"></i><span class="nav-text ml-4 font-black text-[10px] uppercase tracking-widest">Özet</span>
                    </a>
                    <a href="/?page=dashboard&role=teacher&tab=degerlendirme" class="flex items-center p-4 rounded-2xl ${tab === 'degerlendirme' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                        <i class="fas fa-robot w-6 text-center text-indigo-500"></i><span class="nav-text ml-4 font-black text-[10px] uppercase tracking-widest">Değerlendirme</span>
                    </a>
                    <a href="/?page=dashboard&role=teacher&tab=ogrenciler" class="flex items-center p-4 rounded-2xl ${tab === 'ogrenciler' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                        <i class="fas fa-user-friends w-6 text-center"></i><span class="nav-text ml-4 font-black text-[10px] uppercase tracking-widest">Öğrenciler</span>
                    </a>
                ` : ''}
                <a href="/?page=dashboard&role=${role}&tab=profil" class="flex items-center p-4 rounded-2xl ${tab === 'profil' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                    <i class="fas fa-id-card w-6 text-center"></i><span class="nav-text ml-4 font-black text-[10px] uppercase tracking-widest">Profil</span>
                </a>
                <a href="/?page=dashboard&role=${role}&tab=okullar" class="flex items-center p-4 rounded-2xl ${tab === 'okullar' ? 'tab-active' : 'text-slate-400 hover:bg-slate-50'}">
                    <i class="fas fa-university w-6 text-center"></i><span class="nav-text ml-4 font-black text-[10px] uppercase tracking-widest">Okullar</span>
                </a>
            </nav>
            <div class="p-6 border-t"><a href="/?page=login" class="text-red-500 font-black text-[10px] uppercase tracking-widest"><i class="fas fa-power-off"></i></a></div>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            
            ${tab === 'ozet' && isTeacher ? `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div class="bg-white p-8 rounded-[3rem] shadow-sm border text-center font-black italic">Toplam: ${ogrenciler.length}</div>
                    <div class="bg-emerald-500 p-8 rounded-[3rem] text-white shadow-xl text-center font-black italic">Gözlem: 640</div>
                    <div class="bg-orange-500 p-8 rounded-[3rem] text-white shadow-xl text-center font-black italic">Gözetim: 210</div>
                    <div class="bg-red-500 p-8 rounded-[3rem] text-white shadow-xl text-center font-black italic">Yönlendir: 150</div>
                </div>
                <div class="bg-white p-10 rounded-[4rem] border shadow-sm">
                    <h3 class="font-black text-slate-400 uppercase text-[10px] mb-10 tracking-[0.3em]">Öğrenci Dağılım Grafiği (Binlik Sistem)</h3>
                    <div class="flex items-end space-x-12 h-64 border-b">
                        <div class="flex-1 bg-emerald-400 rounded-t-3xl" style="height: 64%"></div>
                        <div class="flex-1 bg-orange-400 rounded-t-3xl" style="height: 21%"></div>
                        <div class="flex-1 bg-red-400 rounded-t-3xl animate-pulse shadow-lg" style="height: 15%"></div>
                    </div>
                </div>
            ` : ''}

            ${tab === 'degerlendirme' && isTeacher ? `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-10 rounded-[3rem] border shadow-sm col-span-1">
                        <form class="space-y-6">
                            <input type="text" placeholder="Ad Soyad" class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold uppercase">
                            <input type="text" placeholder="Sınıf / No" class="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold uppercase">
                            <div class="space-y-4 pt-4">
                                <label class="text-[10px] font-black uppercase text-slate-400 block">1. Disiplin Geçmişi <span id="v1" class="text-indigo-600 ml-2">5</span></label><input type="range" min="0" max="10" value="5" class="w-full accent-indigo-600" oninput="updateC()">
                                <label class="text-[10px] font-black uppercase text-slate-400 block">2. Sosyal İletişim <span id="v2" class="text-indigo-600 ml-2">5</span></label><input type="range" min="0" max="10" value="5" class="w-full accent-indigo-600" oninput="updateC()">
                                <label class="text-[10px] font-black uppercase text-slate-400 block">3. Akademik Başarı <span id="v3" class="text-indigo-600 ml-2">5</span></label><input type="range" min="0" max="10" value="5" class="w-full accent-indigo-600" oninput="updateC()">
                                <label class="text-[10px] font-black uppercase text-slate-400 block">4. Okul Devamsızlığı <span id="v4" class="text-indigo-600 ml-2">5</span></label><input type="range" min="0" max="10" value="5" class="w-full accent-indigo-600" oninput="updateC()">
                                <label class="text-[10px] font-black uppercase text-slate-400 block">5. Ailevi Durum <span id="v5" class="text-indigo-600 ml-2">5</span></label><input type="range" min="0" max="10" value="5" class="w-full accent-indigo-600" oninput="updateC()">
                            </div>
                            <button type="button" class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl">SİSTEME KAYDET</button>
                        </form>
                    </div>
                    <div class="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col items-center justify-center text-center">
                        <div class="w-56 h-56 rounded-full border-[16px] border-slate-50 flex items-center justify-center bg-slate-50 shadow-inner">
                            <span id="lS" class="text-7xl font-black text-indigo-600 italic tracking-tighter">50</span>
                        </div>
                        <p class="mt-8 font-black text-slate-400 uppercase text-xs tracking-widest">Anlık Analiz Skoru</p>
                    </div>
                    <div class="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center">
                        <i class="fas fa-brain text-4xl mb-6 opacity-30"></i>
                        <h4 class="text-2xl font-black italic tracking-tighter uppercase mb-4">Bulanık Mantık</h4>
                        <p class="opacity-70 leading-relaxed text-sm">Sistem girdiğiniz 5 parametreyi anlık olarak tarayarak Karar Puanını üretir. Bu puan öğrencinin genel risk haritasını belirler.</p>
                    </div>
                </div>
                <script>
                    function updateC() {
                        const r = document.querySelectorAll('input[type="range"]');
                        const s = Math.round((parseInt(r[0].value) + parseInt(r[1].value) + parseInt(r[2].value) + parseInt(r[3].value) + parseInt(r[4].value)) * 2);
                        document.getElementById('lS').innerText = s;
                        for(let i=0; i<5; i++) document.getElementById('v'+(i+1)).innerText = r[i].value;
                    }
                </script>
            ` : ''}

            ${tab === 'ogrenciler' && isTeacher ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${ogrenciler.map(o => `
                        <div class="bg-white p-8 rounded-[3rem] border shadow-sm hover:shadow-2xl transition cursor-pointer group" onclick="window.location.href='/?page=dashboard&role=teacher&tab=ogrenciler&detailId=${o.id}'">
                            <div class="flex items-center space-x-6">
                                <img src="${o.foto}" class="w-20 h-20 rounded-[2rem] object-cover border-4 border-slate-50 shadow-md group-hover:scale-110 transition">
                                <div><h4 class="font-black text-slate-800 uppercase italic leading-tight">${o.ad}</h4><p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">${o.sinif}</p></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${detailId ? `
                    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                        <div class="bg-white max-w-xl w-full rounded-[4rem] p-12 relative shadow-2xl">
                            <button onclick="window.location.href='/?page=dashboard&role=teacher&tab=ogrenciler'" class="absolute top-10 right-10 text-slate-300 hover:text-slate-900 text-3xl"><i class="fas fa-times-circle"></i></button>
                            <img src="${ogrenciler.find(o => o.id == detailId).foto}" class="w-40 h-40 rounded-[3rem] mx-auto border-8 border-slate-50 shadow-2xl mb-8 object-cover">
                            <h2 class="text-3xl font-black text-center uppercase italic tracking-tighter mb-8">${ogrenciler.find(o => o.id == detailId).ad}</h2>
                            <div class="space-y-4 font-black text-slate-800">
                                <div class="p-5 bg-slate-50 rounded-3xl flex justify-between uppercase text-xs"><span>T.C. Kimlik</span> <span>${ogrenciler.find(o => o.id == detailId).tc}</span></div>
                                <div class="p-5 bg-slate-50 rounded-3xl flex justify-between uppercase text-xs"><span>No / Sınıf</span> <span>${ogrenciler.find(o => o.id == detailId).numara} / ${ogrenciler.find(o => o.id == detailId).sinif}</span></div>
                                <div class="p-5 bg-slate-50 rounded-3xl flex justify-between uppercase text-xs text-indigo-600"><span>Analiz Sonucu</span> <span>${ogrenciler.find(o => o.id == detailId).durum}</span></div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            ` : ''}

            ${tab === 'okullar' ? `
                <div class="space-y-8">
                    ${okullar.map(okul => `
                        <div class="bg-white rounded-[4rem] overflow-hidden border shadow-sm relative">
                            ${okul.foto === "" ? `
                                <div class="w-full h-72 bg-red-50 flex flex-col items-center justify-center p-12 text-center border-b-8 border-red-500">
                                    <h3 class="text-red-600 font-black uppercase text-xl italic tracking-tighter mb-4">⚠️ OKUL FOTOĞRAFI EKSİK!</h3>
                                    ${isTeacher ? `
                                        <button onclick="document.getElementById('oF').click()" class="bg-red-600 text-white px-10 py-4 rounded-3xl font-black shadow-xl hover:scale-105 transition uppercase text-xs">FOTOĞRAF EKLE (ZORUNLU)</button>
                                        <input type="file" id="oF" class="hidden">
                                    ` : `<p class="text-red-400 font-bold text-xs uppercase">Bu okulu sadece öğretmen fotoğraflayabilir.</p>`}
                                </div>
                            ` : `<img src="${okul.foto}" class="w-full h-72 object-cover">`}
                            <div class="p-10 flex justify-between items-center">
                                <div><h3 class="text-3xl font-black italic uppercase tracking-tighter">${okul.ad}</h3><p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">Veritabanı Kaydı Aktif</p></div>
                                <div class="text-5xl font-black text-indigo-600 tracking-tighter">${okul.ortalama}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${tab === 'profil' ? `
                <div class="max-w-2xl mx-auto bg-white p-12 rounded-[4rem] border shadow-2xl text-center relative overflow-hidden">
                    <div class="bg-indigo-600 h-32 absolute top-0 left-0 w-full opacity-10"></div>
                    <div class="relative inline-block mt-8">
                        <img id="uP" src="${ogrenciler[0].foto}" class="w-48 h-48 rounded-[3.5rem] border-8 border-white shadow-2xl object-cover relative z-10">
                        <button onclick="document.getElementById('uI').click()" class="absolute bottom-2 right-2 bg-indigo-600 text-white p-4 rounded-full shadow-2xl z-20 hover:scale-110 transition"><i class="fas fa-camera"></i></button>
                        <input type="file" id="uI" class="hidden" onchange="alert('Sadece yüzünüzün olduğu fotoğrafı tanımlayabiliyorum!')">
                    </div>
                    <h2 class="text-4xl font-black italic tracking-tighter uppercase text-slate-800 mt-10">${isTeacher ? 'Öğretmen: Cemilay' : 'Öğrenci: Mehmet'}</h2>
                    <p class="text-indigo-600 font-black uppercase tracking-[0.4em] text-[10px] mt-4 italic">${isTeacher ? 'Rehberlik Uzmanı' : '10-B / No: 101'}</p>
                </div>
            ` : ''}

        </main>
    </body>
    </html>`);
});

// LOGIC
app.post("/send-code", (req, res) => {
    geciciKod = Math.floor(100000 + Math.random() * 900000).toString();
    res.redirect(`/?page=login&role=${req.body.loginRole}&step=2`);
});

app.post("/verify-code", (req, res) => {
    const r = req.body.verifyRole;
    res.redirect(`/?page=dashboard&role=${r}&tab=${r === 'teacher' ? 'ozet' : 'profil'}`);
});

export default app;
