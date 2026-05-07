
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- VERİ SETİ (HAFIZADA TUTULAN ÖĞRENCİ LİSTESİ) ---
let ogrenciler = [
    { id: 1, ad: "Mehmet Salih", numara: "101", sinif: "10-B", puan: 25, durum: "Yönlendir", tarih: "2026-05-07", foto: "https://via.placeholder.com/150" },
    { id: 2, ad: "Zeynep", numara: "102", sinif: "11-C", puan: 85, durum: "Gerekiyorsa Gözlem", tarih: "2026-05-06", foto: "https://via.placeholder.com/150" }
];

app.get("/", (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'teacher'; 
    const step = req.query.step || '1';

    // 1. GİRİŞ EKRANLARI
    if (page === 'login' || page === 'register' || page === 'forgot') {
        return res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head>
        <body class="bg-slate-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div class="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 text-center">
                <div class="inline-block bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-100"><i class="fas fa-book-open text-white text-2xl"></i></div>
                <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8">Rehberlik Sistemi</h1>
                
                <div class="space-y-4">
                    <a href="/?page=dashboard&role=teacher&tab=ozet" class="flex items-center justify-between p-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg transition transform hover:scale-105">
                        <span><i class="fas fa-chalkboard-teacher mr-3"></i>Öğretmen Girişi</span>
                        <i class="fas fa-chevron-right opacity-50"></i>
                    </a>
                    <a href="/?page=dashboard&role=student&tab=profil" class="flex items-center justify-between p-5 border-2 border-slate-100 text-slate-700 rounded-2xl font-bold hover:border-indigo-600 transition transform hover:scale-105">
                        <span><i class="fas fa-user-graduate mr-3 text-indigo-500"></i>Öğrenci Girişi</span>
                        <i class="fas fa-chevron-right opacity-50"></i>
                    </a>
                </div>
                <div class="mt-8 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    <a href="#" class="hover:text-indigo-600">Şifremi Unuttum</a>
                    <a href="#" class="hover:text-indigo-600">Yeni Kayıt</a>
                </div>
            </div>
        </body>
        </html>`);
    }

    // 2. ANA PANEL (YETKİLENDİRME VE GİZLENEBİLİR MENÜ)
    const isTeacher = role === 'teacher';
    const currentStudent = ogrenciler[0]; // Giriş yapan öğrenciyi simüle ediyoruz

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        #sidebar { transition: width 0.3s ease; width: 280px; overflow: hidden; }
        #sidebar.collapsed { width: 85px; }
        .nav-text { transition: opacity 0.2s; opacity: 1; }
        .collapsed .nav-text { opacity: 0; display: none; }
        .tab-active { background-color: #1e293b; color: white !important; shadow: 0 10px 15px rgba(0,0,0,0.1); }
    </style></head>
    <body class="bg-slate-50 flex min-h-screen font-sans text-slate-900">
        
        <aside id="sidebar" class="bg-white border-r flex flex-col h-screen sticky top-0 z-50">
            <div class="p-6 border-b flex items-center">
                <div class="flex items-center text-indigo-600 cursor-pointer" onclick="document.getElementById('sidebar').classList.toggle('collapsed')">
                    <i class="fas fa-book-open text-2xl"></i>
                    <span class="nav-text font-black ml-4 text-xl tracking-tighter uppercase">Rehberlik</span>
                </div>
            </div>
            <nav class="p-4 space-y-2 flex-1">
                ${isTeacher ? `
                    <a href="/?page=dashboard&role=teacher&tab=ozet" class="flex items-center p-3 rounded-xl ${tab === 'ozet' ? 'tab-active' : 'text-slate-500 hover:bg-slate-50'}">
                        <i class="fas fa-th-large w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm uppercase">Özet</span>
                    </a>
                    <a href="/?page=dashboard&role=teacher&tab=degerlendirme" class="flex items-center p-3 rounded-xl ${tab === 'degerlendirme' ? 'tab-active' : 'text-slate-500 hover:bg-slate-50'}">
                        <i class="fas fa-magic w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm uppercase text-indigo-500">Akıllı Değerlendirme</span>
                    </a>
                    <a href="/?page=dashboard&role=teacher&tab=ogrenciler" class="flex items-center p-3 rounded-xl ${tab === 'ogrenciler' ? 'tab-active' : 'text-slate-500 hover:bg-slate-50'}">
                        <i class="fas fa-users w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm uppercase">Öğrenciler</span>
                    </a>
                ` : ''}
                <a href="/?page=dashboard&role=${role}&tab=profil" class="flex items-center p-3 rounded-xl ${tab === 'profil' ? 'tab-active' : 'text-slate-500 hover:bg-slate-50'}">
                    <i class="fas fa-user-circle w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm uppercase">Profil</span>
                </a>
                <a href="/?page=dashboard&role=${role}&tab=okullar" class="flex items-center p-3 rounded-xl ${tab === 'okullar' ? 'tab-active' : 'text-slate-500 hover:bg-slate-50'}">
                    <i class="fas fa-school w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm uppercase">Okullar</span>
                </a>
            </nav>
            <div class="p-6 border-t"><a href="/?page=login" class="text-red-500 font-bold text-[10px] uppercase tracking-widest"><i class="fas fa-power-off mr-2"></i> Çıkış</a></div>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            
            ${tab === 'ozet' && isTeacher ? `
                <h2 class="text-3xl font-black mb-10 tracking-tighter uppercase italic">Yönetici Paneli / Özet</h2>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div class="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-center items-center">
                        <i class="fas fa-user-graduate text-blue-500 mb-2"></i>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">Toplam Öğrenci</p>
                        <p class="text-3xl font-black">${ogrenciler.length}</p>
                    </div>
                    <div class="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-center items-center">
                        <i class="fas fa-check-double text-green-500 mb-2"></i>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">Değerlendirme</p>
                        <p class="text-3xl font-black">${ogrenciler.length + 5}</p>
                    </div>
                    <div class="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-center items-center">
                        <i class="fas fa-chart-line text-indigo-500 mb-2"></i>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">Ortalama Puan</p>
                        <p class="text-3xl font-black text-indigo-600">55.0</p>
                    </div>
                    <div class="bg-white p-6 rounded-[2rem] border shadow-sm border-2 border-red-100 flex flex-col justify-center items-center">
                        <i class="fas fa-exclamation-circle text-red-500 mb-2"></i>
                        <p class="text-[10px] font-bold text-red-400 uppercase">Dikkat Gereken</p>
                        <p class="text-3xl font-black text-red-600">${ogrenciler.filter(o => o.puan < 40).length}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                        <h3 class="font-bold text-slate-400 text-xs mb-8 uppercase tracking-widest">Karar Dağılımı</h3>
                        <div class="flex justify-between items-end h-40 space-x-6 border-b pb-2">
                            <div class="bg-emerald-400 w-full rounded-t-2xl h-[70%]" title="Gereksiz"></div>
                            <div class="bg-orange-400 w-full rounded-t-2xl h-[20%]" title="Gözlem"></div>
                            <div class="bg-red-500 w-full rounded-t-2xl h-[40%]" title="Yönlendir"></div>
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm overflow-hidden">
                        <h3 class="font-bold text-indigo-500 text-xs mb-6 uppercase tracking-widest">Son Aktivite (Eklenenler)</h3>
                        <div class="space-y-3">
                            ${ogrenciler.slice(-3).reverse().map(o => `
                                <div class="flex items-center p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <div class="bg-white p-2 rounded-full mr-4"><i class="fas fa-user-plus text-indigo-400"></i></div>
                                    <div><p class="font-bold text-sm">${o.ad}</p><p class="text-[10px] text-slate-400">${o.tarih} - Listeye eklendi.</p></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}

            ${tab === 'degerlendirme' && isTeacher ? `
                <h2 class="text-3xl font-black mb-10 tracking-tighter uppercase italic text-indigo-600">Akıllı Değerlendirme Sistemi</h2>
                <form action="/degerlendir-kaydet" method="POST" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                        <h3 class="font-bold text-slate-400 text-xs uppercase mb-4 tracking-widest">Öğrenci Giriş Verileri</h3>
                        <input type="text" name="ad" placeholder="Ad Soyad" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition">
                        <input type="text" name="numara" placeholder="Okul No" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition">
                        <input type="text" name="sinif" placeholder="Sınıf" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition">
                        <div class="space-y-4 pt-4 font-bold text-[10px] text-slate-400 uppercase">
                            <div><label>1. Disiplin</label><input type="range" name="p1" min="0" max="10" class="w-full accent-indigo-600"></div>
                            <div><label>2. Sosyal Uyum</label><input type="range" name="p2" min="0" max="10" class="w-full accent-indigo-600"></div>
                            <div><label>3. Akademik Başarı</label><input type="range" name="p3" min="0" max="10" class="w-full accent-indigo-600"></div>
                            <div><label>4. Devamsızlık</label><input type="range" name="p4" min="0" max="10" class="w-full accent-indigo-600"></div>
                            <div><label>5. Aile Durumu</label><input type="range" name="p5" min="0" max="10" class="w-full accent-indigo-600"></div>
                        </div>
                        <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg transform hover:-translate-y-1 transition">SİSTEME KAYDET</button>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-center justify-center text-center">
                        <div class="w-48 h-48 rounded-full border-[12px] border-slate-50 flex items-center justify-center bg-slate-50 shadow-inner">
                            <span class="text-5xl font-black text-indigo-600 tracking-tighter italic">!</span>
                        </div>
                        <p class="mt-8 font-bold text-slate-400 uppercase text-xs tracking-widest">Karar Analizi Bekleniyor</p>
                    </div>
                    <div class="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-center">
                        <i class="fas fa-robot text-4xl mb-6 text-indigo-400"></i>
                        <h4 class="text-xl font-bold mb-4 tracking-tight">Fuzzy Logic Engine</h4>
                        <p class="opacity-60 text-sm leading-relaxed">Sistem, girdiğiniz 5 parametreyi okulun başarı ve disiplin standartlarına göre analiz eder. Sonuç, öğrenci listesinde ve öğrenci profilinde otomatik olarak yayınlanır.</p>
                    </div>
                </form>
            ` : ''}

            ${tab === 'ogrenciler' && isTeacher ? `
                <h2 class="text-3xl font-black mb-10 tracking-tighter uppercase italic">Kayıtlı Veri Seti</h2>
                <div class="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest"><tr class="border-b">
                            <th class="p-6">Öğrenci / Sınıf</th><th class="p-6">Numara</th><th class="p-6">Durum</th><th class="p-6 text-right">Karar Puanı</th>
                        </tr></thead>
                        <tbody class="divide-y">
                            ${ogrenciler.map(o => `
                                <tr class="hover:bg-slate-50 transition">
                                    <td class="p-6"><div class="font-bold text-slate-800">${o.ad}</div><div class="text-[10px] text-slate-400">${o.sinif}</div></td>
                                    <td class="p-6 text-sm font-mono text-slate-500">${o.numara}</td>
                                    <td class="p-6"><span class="px-3 py-1 rounded-full text-[10px] font-bold ${o.puan < 40 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">${o.durum.toUpperCase()}</span></td>
                                    <td class="p-6 text-right font-black text-indigo-600 italic text-xl">${o.puan}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}

            ${tab === 'profil' ? `
                <div class="max-w-2xl mx-auto bg-white p-12 rounded-[3.5rem] border shadow-sm text-center relative overflow-hidden">
                    <div class="bg-indigo-600 h-24 absolute top-0 left-0 w-full opacity-10"></div>
                    <div class="relative inline-block mb-10 mt-6">
                        <img id="pImg" src="${currentStudent.foto}" class="w-44 h-44 rounded-full border-[10px] border-white shadow-2xl object-cover relative z-10">
                        <button onclick="document.getElementById('fInp').click()" class="absolute bottom-2 right-2 bg-indigo-600 text-white p-4 rounded-full shadow-2xl z-20 hover:scale-110 transition"><i class="fas fa-camera"></i></button>
                        <input type="file" id="fInp" class="hidden" accept="image/*" onchange="handlePImg(event)">
                    </div>
                    <h2 class="text-4xl font-black text-slate-800 tracking-tighter">${currentStudent.ad}</h2>
                    <p class="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">${currentStudent.sinif} / No: ${currentStudent.numara}</p>
                    <div class="mt-12 grid grid-cols-2 gap-6">
                        <div class="p-6 bg-slate-50 rounded-3xl border"><p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Rehberlik Sonucu</p><p class="font-black text-xl text-indigo-600 italic uppercase">${currentStudent.durum}</p></div>
                        <div class="p-6 bg-slate-50 rounded-3xl border"><p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Puan</p><p class="font-black text-2xl text-slate-800">${currentStudent.puan}</p></div>
                    </div>
                </div>
            ` : ''}

            ${tab === 'okullar' ? `<div class="bg-indigo-600 p-20 rounded-[4rem] text-white shadow-2xl flex flex-col items-center justify-center text-center"> <i class="fas fa-award text-6xl mb-6 opacity-30"></i> <h2 class="text-5xl font-black uppercase tracking-tighter">Okul Başarı Panosu</h2> <p class="mt-6 opacity-60 max-w-md text-sm">Şehit Mehmet Acubucu İHL veritabanındaki tüm okulların genel performans ve rehberlik dağılımı burada şeffaf olarak paylaşılır.</p></div>` : ''}
        </main>

        <script>
            function handlePImg(e) {
                const img = document.getElementById('pImg');
                const file = e.target.files[0];
                if(file) {
                    alert("Yüz tanıma doğrulanıyor... Lütfen bekleyin.");
                    setTimeout(() => {
                        img.src = URL.createObjectURL(file);
                    }, 1500);
                }
            }
        </script>
    </body>
    </html>`);
});

// --- VERİ KAYIT YOLU (DEĞERLENDİRMEYİ VERİ SETİNE EKLER) ---
app.post("/degerlendir-kaydet", (req, res) => {
    const { ad, numara, sinif, p1, p2, p3, p4, p5 } = req.body;
    
    // Basit Bulanık Mantık Hesaplaması (Ortalama Alıyoruz)
    const ortalama = Math.round((parseInt(p1) + parseInt(p2) + parseInt(p3) + parseInt(p4) + parseInt(p5)) * 2);
    let durum = "Sorun Yok";
    if (ortalama < 40) durum = "Yönlendir";
    else if (ortalama < 70) durum = "Gerekiyorsa Gözlem";

    // Veri Setine (Diziye) Ekle
    ogrenciler.push({
        id: Date.now(),
        ad,
        numara,
        sinif,
        puan: ortalama,
        durum: durum,
        tarih: new Date().toISOString().split('T')[0],
        foto: "https://via.placeholder.com/150"
    });

    res.redirect("/?page=dashboard&role=teacher&tab=ogrenciler");
});

export default app;
