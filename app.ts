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
    { id: 1, ad: "Mehmet Salih", numara: "101", sinif: "10-B", puan: 15, durum: "Yönlendir", foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400", tc: "12345678901", dogum: "2010", adres: "İstanbul/Üsküdar" },
    { id: 2, ad: "Zeynep Kaya", numara: "102", sinif: "11-C", puan: 85, durum: "Sorun Yok", foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", tc: "98765432109", dogum: "2009", adres: "Ankara/Çankaya" }
];

let okullar = [
    { id: 1, ad: "Şehit Mehmet Acubucu İHL", ogrenciSayisi: 450, ortalama: 72, foto: "" }, // Fotoğraf boş bırakıldı uyarı için
];

app.get("/", (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'teacher';
    const detailId = req.query.detailId;

    if (page === 'login') {
        return res.send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head><body class="bg-slate-100 min-h-screen flex items-center justify-center font-sans p-4"><div class="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border-t-8 border-indigo-600"><div class="inline-block bg-indigo-600 p-5 rounded-3xl mb-6 shadow-xl"><i class="fas fa-book-open text-white text-4xl"></i></div><h1 class="text-3xl font-black text-slate-800 tracking-tighter mb-10 uppercase">Rehberlik Sistemi</h1><div class="space-y-4"><a href="/?page=dashboard&role=teacher&tab=ozet" class="block p-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg transform hover:-translate-y-1 transition uppercase">Öğretmen Girişi</a><a href="/?page=dashboard&role=student&tab=profil" class="block p-5 border-4 border-slate-50 text-slate-700 rounded-2xl font-black hover:border-indigo-600 transition transform hover:-translate-y-1 uppercase">Öğrenci Girişi</a></div></div></body></html>`);
    }

    const isTeacher = role === 'teacher';
    const riskliOgrenci = ogrenciler.reduce((prev, current) => (prev.puan < current.puan) ? prev : current);

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        #sidebar { transition: width 0.3s ease; width: 280px; }
        #sidebar.collapsed { width: 85px; }
        .nav-text { transition: opacity 0.2s; }
        .collapsed .nav-text { display: none; }
        .tab-active { background: #1e293b; color: white !important; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    </style></head>
    <body class="bg-slate-50 flex min-h-screen font-sans text-slate-900">
        
        <aside id="sidebar" class="bg-white border-r flex flex-col h-screen sticky top-0 z-50 shadow-sm">
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
                        <i class="fas fa-magic w-6 text-center"></i><span class="nav-text ml-4 font-black text-xs uppercase">Değerlendirme</span>
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
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center italic font-bold">Toplam: ${ogrenciler.length}</div>
                    <div class="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-lg text-center font-bold italic">Gözlem: 640</div>
                    <div class="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-lg text-center font-bold italic">Gözetim: 210</div>
                    <div class="bg-red-500 p-8 rounded-[2.5rem] text-white shadow-lg text-center font-bold italic">Yönlendir: 150</div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div class="bg-white p-10 rounded-[3rem] border shadow-sm">
                        <h3 class="font-black text-slate-800 uppercase text-xs mb-8">Dağılım Grafiği (Binlik Sistem)</h3>
                        <div class="flex items-end space-x-8 h-64 border-b">
                            <div class="flex-1 bg-emerald-400 rounded-t-2xl" style="height: 64%"></div>
                            <div class="flex-1 bg-orange-400 rounded-t-2xl" style="height: 21%"></div>
                            <div class="flex-1 bg-red-400 rounded-t-2xl animate-pulse" style="height: 15%"></div>
                        </div>
                    </div>
                    <div class="bg-red-50 p-10 rounded-[3rem] border-2 border-red-200 border-dashed flex flex-col justify-center">
                        <h3 class="text-red-600 font-black uppercase text-xs mb-6 italic"><i class="fas fa-exclamation-triangle mr-2"></i> ACİL YÖNLENDİRME GEREKEN ÖĞRENCİ</h3>
                        <div class="flex items-center space-x-6">
                            <img src="${riskliOgrenci.foto}" class="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg">
                            <div>
                                <h4 class="text-2xl font-black text-red-900">${riskliOgrenci.ad}</h4>
                                <p class="text-sm font-bold text-red-700">${riskliOgrenci.sinif} - Karar Puanı: ${riskliOgrenci.puan}</p>
                                <p class="text-xs mt-2 text-red-500 font-medium">Bu öğrenci en yüksek risk grubundadır. Acil rehberlik müdahalesi gereklidir.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}

            ${tab === 'degerlendirme' && isTeacher ? `
                <div class="max-w-4xl mx-auto bg-white p-12 rounded-[4rem] border shadow-sm">
                    <h2 class="text-3xl font-black mb-10 tracking-tighter uppercase italic text-indigo-600 text-center">Öğrenci Değerlendirme Formu</h2>
                    <form action="/degerlendir-kaydet" method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-4">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Öğrenci Temel Bilgileri</label>
                            <input type="text" name="ad" placeholder="Ad Soyad" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600">
                            <input type="text" name="sinif" placeholder="Sınıf (Örn: 10-A)" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600">
                            <input type="text" name="numara" placeholder="Öğrenci Numarası" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600">
                        </div>
                        <div class="space-y-6">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analiz Kriterleri (Anlık Puan)</label>
                            <div><label class="text-xs font-bold flex justify-between">Disiplin Puanı <span id="v1">5</span></label><input type="range" name="p1" min="0" max="10" class="w-full accent-indigo-600" oninput="document.getElementById('v1').innerText=this.value"></div>
                            <div><label class="text-xs font-bold flex justify-between">Sosyal Uyum <span id="v2">5</span></label><input type="range" name="p2" min="0" max="10" class="w-full accent-indigo-600" oninput="document.getElementById('v2').innerText=this.value"></div>
                            <button class="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl transform hover:-translate-y-1 transition uppercase tracking-widest">Sisteme Kaydet ve Analiz Et</button>
                        </div>
                    </form>
                </div>
            ` : ''}

            ${tab === 'ogrenciler' && isTeacher ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${ogrenciler.map(o => `
                        <div class="bg-white p-8 rounded-[3rem] border shadow-sm hover:shadow-2xl transition cursor-pointer group" onclick="window.location.href='/?page=dashboard&role=teacher&tab=ogrenciler&detailId=${o.id}'">
                            <div class="flex items-center space-x-6">
                                <img src="${o.foto}" class="w-20 h-20 rounded-[2rem] object-cover border-4 border-slate-50 shadow-md group-hover:scale-110 transition">
                                <div><h4 class="font-black text-slate-800 uppercase italic leading-tight">${o.ad}</h4><p class="text-[10px] font-black text-indigo-500 uppercase">${o.sinif}</p></div>
                            </div>
                            <div class="mt-6 pt-6 border-t flex justify-between items-center"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Detaylar için tıkla</span><span class="text-xl font-black text-indigo-600">${o.puan}</span></div>
                        </div>
                    `).join('')}
                </div>

                ${detailId ? `
                    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                        <div class="bg-white max-w-2xl w-full rounded-[4rem] p-12 relative shadow-2xl">
                            <button onclick="window.location.href='/?page=dashboard&role=teacher&tab=ogrenciler'" class="absolute top-8 right-8 text-slate-300 hover:text-slate-800 text-2xl"><i class="fas fa-times"></i></button>
                            <div class="flex items-center space-x-10 mb-10">
                                <img src="${ogrenciler.find(o => o.id == detailId).foto}" class="w-40 h-40 rounded-[3rem] object-cover border-8 border-slate-50 shadow-2xl">
                                <div>
                                    <h2 class="text-4xl font-black italic tracking-tighter uppercase text-slate-800">${ogrenciler.find(o => o.id == detailId).ad}</h2>
                                    <span class="bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase italic">${ogrenciler.find(o => o.id == detailId).durum}</span>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-6 font-black text-slate-800">
                                <div class="p-6 bg-slate-50 rounded-3xl"><p class="text-[10px] text-slate-400 uppercase mb-1">T.C. Kimlik No</p>${ogrenciler.find(o => o.id == detailId).tc}</div>
                                <div class="p-6 bg-slate-50 rounded-3xl"><p class="text-[10px] text-slate-400 uppercase mb-1">Doğum Yılı</p>${ogrenciler.find(o => o.id == detailId).dogum}</div>
                                <div class="p-6 bg-slate-50 rounded-3xl col-span-2"><p class="text-[10px] text-slate-400 uppercase mb-1">İkamet Adresi</p>${ogrenciler.find(o => o.id == detailId).adres}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            ` : ''}

            ${tab === 'okullar' ? `
                <div class="grid grid-cols-1 gap-10">
                    ${okullar.map(okul => `
                        <div class="bg-white rounded-[4rem] overflow-hidden border shadow-sm relative group transition hover:shadow-2xl">
                            ${okul.foto === "" ? `
                                <div class="w-full h-64 bg-red-50 flex flex-col items-center justify-center p-10 text-center border-b-8 border-red-500">
                                    <i class="fas fa-camera text-red-300 text-5xl mb-4"></i>
                                    <h3 class="text-red-600 font-black uppercase text-xl italic tracking-tighter">⚠️ DİKKAT: OKUL FOTOĞRAFI EKSİK!</h3>
                                    <p class="text-red-400 text-sm font-bold mt-2">Okulunuzun profilini tamamlamak için bir fotoğraf eklemeniz ZORUNLUDUR.</p>
                                    <button onclick="window.location.href='/?page=dashboard&role=teacher&tab=profil'" class="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-red-700 transition shadow-lg shadow-red-200">FOTOĞRAF EKLEMEK İÇİN PROFİLE GİT</button>
                                </div>
                            ` : `<img src="${okul.foto}" class="w-full h-64 object-cover">`}
                            <div class="p-10 flex justify-between items-center">
                                <div><h3 class="text-3xl font-black italic uppercase tracking-tighter text-slate-800">${okul.ad}</h3><p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic">${okul.ogrenciSayisi} Kayıtlı Veri Mevcut</p></div>
                                <div class="text-right text-5xl font-black text-indigo-600 italic tracking-tighter">${okul.ortalama}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${tab === 'profil' ? `
                <div class="max-w-2xl mx-auto bg-white p-12 rounded-[4rem] border shadow-2xl text-center relative overflow-hidden">
                    <div class="bg-indigo-600 h-32 absolute top-0 left-0 w-full opacity-10"></div>
                    <img src="https://images.unsplash.com/photo-1544717297-fa95b3ee51f3?w=400" class="w-48 h-48 rounded-[3.5rem] border-8 border-white shadow-2xl mx-auto object-cover relative z-10 mb-8">
                    <h2 class="text-4xl font-black italic tracking-tighter uppercase text-slate-800">Öğretmen: Cemilay</h2>
                    <p class="text-indigo-600 font-black uppercase tracking-[0.4em] text-[10px] mt-4 italic">Rehberlik & Karar Destek Uzmanı</p>
                    
                    <div class="mt-12 p-8 bg-red-50 rounded-[3rem] border-2 border-red-100 border-dashed">
                        <h4 class="text-red-600 font-black uppercase text-xs mb-4 italic">Sistem Uyarısı</h4>
                        <p class="text-red-400 text-xs font-bold leading-relaxed mb-6">Okul listenizdeki fotoğraf eksikliği nedeniyle sistem kısıtlı çalışmaktadır. Lütfen okulun kampüs fotoğrafını yükleyin.</p>
                        <button class="bg-red-600 text-white w-full py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:scale-[1.02] transition">OKUL FOTOĞRAFI YÜKLE (ZORUNLU)</button>
                    </div>
                </div>
            ` : ''}

        </main>
    </body>
    </html>`);
});

export default app;
