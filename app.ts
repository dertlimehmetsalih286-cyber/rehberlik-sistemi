
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// SİSTEM VERİLERİ
let ogrenciler = [
    { id: 1, ad: "Mehmet Salih", numara: "101", sinif: "10-B", puan: 20, durum: "Yönlendir", foto: "https://via.placeholder.com/150" }
];
let geciciKod = ""; 

app.get("/", (req, res) => {
    const page = req.query.page || 'login';
    const tab = req.query.tab || 'ozet';
    const role = req.query.role || 'student'; 
    const step = req.query.step || '1'; // Login adımları

    // 1. GİRİŞ, KAYIT VE ŞİFRE EKRANLARI
    if (page === 'login' || page === 'register' || page === 'forgot') {
        return res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head>
        <body class="bg-slate-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div class="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-200">
                <div class="text-center mb-8">
                    <div class="inline-block bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-100"><i class="fas fa-book-open text-white text-2xl"></i></div>
                    <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">Rehberlik Sistemi</h1>
                </div>

                ${page === 'login' && step === '1' ? `
                    <div class="grid grid-cols-2 gap-4 mb-8">
                        <button onclick="location.href='/?page=login&role=teacher&step=1'" class="p-4 rounded-2xl border-2 ${role === 'teacher' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'} font-bold text-xs transition">ÖĞRETMEN</button>
                        <button onclick="location.href='/?page=login&role=student&step=1'" class="p-4 rounded-2xl border-2 ${role === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'} font-bold text-xs transition">ÖĞRENCİ</button>
                    </div>
                    <form action="/send-code" method="POST" class="space-y-4">
                        <input type="hidden" name="loginRole" value="${role}">
                        <input type="${role === 'teacher' ? 'tel' : 'text'}" name="identifier" placeholder="${role === 'teacher' ? 'Telefon Numaranız' : 'Okul Numaranız'}" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600">
                        <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200">KOD GÖNDER</button>
                    </form>
                    <div class="mt-6 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                        <a href="/?page=forgot" class="hover:text-indigo-600">Şifremi Unuttum</a>
                        <a href="/?page=register" class="hover:text-indigo-600">Yeni Kayıt</a>
                    </div>
                ` : ''}

                ${page === 'login' && step === '2' ? `
                    <div class="text-center mb-6"><p class="text-orange-500 font-bold animate-pulse">DOĞRULAMA KODU: ${geciciKod}</p></div>
                    <form action="/verify-code" method="POST" class="space-y-4">
                        <input type="hidden" name="verifyRole" value="${role}">
                        <input type="text" name="code" placeholder="6 Haneli Kod" required class="w-full p-4 bg-slate-50 border rounded-2xl text-center text-2xl tracking-[0.5em] font-black outline-none focus:ring-2 focus:ring-indigo-600">
                        <button class="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl">SİSTEME GİRİŞ YAP</button>
                    </form>
                ` : ''}

                ${page === 'register' ? `
                    <h2 class="text-center font-bold text-slate-800 mb-6 uppercase tracking-widest">Yeni Kullanıcı Kaydı</h2>
                    <form action="/register-check" method="POST" class="space-y-4">
                        <input type="text" name="tc" placeholder="T.C. Kimlik No" maxlength="11" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                        <input type="number" name="yas" placeholder="Yaşınız" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                        <select name="type" class="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold text-slate-500">
                            <option value="teacher">Öğretmen Olarak Kaydol</option>
                            <option value="student">Öğrenci Olarak Kaydol</option>
                        </select>
                        <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl">KAYDI TAMAMLA</button>
                        <button type="button" onclick="location.href='/?page=login'" class="w-full text-slate-400 font-bold text-xs">Geri Dön</button>
                    </form>
                ` : ''}

                ${page === 'forgot' ? `
                    <h2 class="text-center font-bold text-slate-800 mb-6 uppercase tracking-widest">Şifre Sıfırlama</h2>
                    <form action="/send-code" method="POST" class="space-y-4">
                        <p class="text-xs text-slate-400 text-center mb-4">Sistemde kayıtlı numaranızı girerek şifrenizi sıfırlayabilirsiniz.</p>
                        <input type="tel" name="phone" placeholder="Telefon veya Okul No" required class="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                        <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl">SIFIRLAMA KODU İSTE</button>
                        <button type="button" onclick="location.href='/?page=login'" class="w-full text-slate-400 font-bold text-xs">İptal</button>
                    </form>
                ` : ''}
            </div>
        </body>
        </html>`);
    }

    // 2. ANA PANEL (DASHBOARD)
    const isTeacher = role === 'teacher';

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        #sidebar { transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); width: 280px; }
        #sidebar.collapsed { width: 85px; }
        .nav-text { transition: opacity 0.2s; opacity: 1; }
        .collapsed .nav-text { opacity: 0; pointer-events: none; display: none; }
        .tab-active { background-color: #1e293b; color: white !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
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
                        <i class="fas fa-chart-pie w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm">Özet</span>
                    </a>
                    <a href="/?page=dashboard&role=teacher&tab=degerlendirme" class="flex items-center p-3 rounded-xl ${tab === 'degerlendirme' ? 'tab-active' : 'text-slate-500 hover:bg-slate-50'}">
                        <i class="fas fa-tasks w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm">Değerlendirme</span>
                    </a>
                    <a href="/?page=dashboard&role=teacher&tab=ogrenciler" class="flex items-center p-3 rounded-xl ${tab === 'ogrenciler' ? 'tab-active' : 'text-slate-500 hover:bg-slate-50'}">
                        <i class="fas fa-users w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm">Öğrenciler</span>
                    </a>
                ` : ''}
                <a href="/?page=dashboard&role=${role}&tab=profil" class="flex items-center p-3 rounded-xl ${tab === 'profil' ? 'tab-active' : 'text-slate-500 hover:bg-slate-50'}">
                    <i class="fas fa-user-circle w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm">Profil</span>
                </a>
                <a href="/?page=dashboard&role=${role}&tab=okullar" class="flex items-center p-3 rounded-xl ${tab === 'okullar' ? 'tab-active' : 'text-slate-500 hover:bg-slate-50'}">
                    <i class="fas fa-school w-6 text-center"></i><span class="nav-text ml-4 font-bold text-sm">Okullar</span>
                </a>
            </nav>
            <div class="p-6 border-t"><a href="/?page=login" class="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]"><i class="fas fa-power-off mr-2"></i> Çıkış</a></div>
        </aside>

        <main class="flex-1 p-10">
            ${tab === 'ozet' && isTeacher ? `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white p-8 rounded-[2rem] border shadow-sm">
                        <h3 class="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-8">Karar Dağılımı</h3>
                        <div class="flex justify-between items-end h-40 space-x-6 border-b pb-2">
                            <div class="bg-emerald-400 w-full rounded-t-2xl h-[70%]"></div>
                            <div class="bg-orange-400 w-full rounded-t-2xl h-[20%]"></div>
                            <div class="bg-red-500 w-full rounded-t-2xl h-[40%] animate-pulse"></div>
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-[2rem] border shadow-sm border-l-[12px] border-l-red-500">
                        <h3 class="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Dikkat Listesi (Acil)</h3>
                        ${ogrenciler.filter(o => o.puan < 40).map(o => `
                            <div class="p-4 bg-red-50 rounded-2xl mb-2 flex justify-between items-center">
                                <div><p class="font-bold text-red-900">${o.ad}</p><p class="text-[10px] text-red-600">Puan: ${o.puan} - Rehbere yönlendirilmesi gerekir!</p></div>
                                <i class="fas fa-exclamation-circle text-red-500"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${tab === 'degerlendirme' && isTeacher ? `
                <h2 class="text-3xl font-black mb-10 tracking-tighter uppercase">Akıllı Değerlendirme (5 Kriter)</h2>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                        <form action="/ekle" method="POST" class="space-y-4">
                            <input type="text" name="ad" placeholder="Öğrenci Adı" class="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                            <div class="space-y-4 font-bold text-[10px] text-slate-400 uppercase">
                                <div><label>1. Disiplin</label><input type="range" class="w-full accent-indigo-600"></div>
                                <div><label>2. Sosyal Uyum</label><input type="range" class="w-full accent-indigo-600"></div>
                                <div><label>3. Akademik Başarı</label><input type="range" class="w-full accent-indigo-600"></div>
                                <div><label>4. Devamsızlık</label><input type="range" class="w-full accent-indigo-600"></div>
                                <div><label>5. Aile Durumu</label><input type="range" class="w-full accent-indigo-600"></div>
                            </div>
                            <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl">ANALİZİ TAMAMLA</button>
                        </form>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-center justify-center">
                        <div class="w-48 h-48 rounded-full border-[16px] border-slate-50 flex flex-col items-center justify-center">
                            <span class="text-6xl font-black text-indigo-600 tracking-tighter">0</span>
                        </div>
                        <p class="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Karar Puanı</p>
                    </div>
                    <div class="bg-indigo-900 p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-center">
                        <i class="fas fa-microchip text-4xl mb-6 opacity-30"></i>
                        <h4 class="text-xl font-bold mb-4">Bulanık Mantık Çıktısı</h4>
                        <p class="text-sm opacity-60 leading-relaxed">Sistem, girdiğiniz 5 parametreyi okul standartlarına göre analiz eder ve yönlendirme kararını anlık olarak üretir.</p>
                    </div>
                </div>
            ` : ''}

            ${tab === 'profil' ? `
                <div class="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] border shadow-sm text-center">
                    <div class="relative inline-block mb-10">
                        <img id="uImg" src="${ogrenciler[0].foto}" class="w-44 h-44 rounded-full border-[10px] border-slate-50 object-cover shadow-2xl">
                        <button onclick="document.getElementById('fInp').click()" class="absolute bottom-2 right-2 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition"><i class="fas fa-camera"></i></button>
                        <input type="file" id="fInp" class="hidden" accept="image/*" onchange="handleUImg(event)">
                    </div>
                    <div id="uAlert" class="hidden mb-6 p-4 bg-red-100 text-red-600 rounded-2xl font-bold text-xs uppercase tracking-widest">Sadece yüzünüzün net olduğu bir fotoğraf seçiniz!</div>
                    <h2 class="text-4xl font-black text-slate-800 tracking-tighter">${ogrenciler[0].ad}</h2>
                    <p class="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">${ogrenciler[0].sinif} / No: ${ogrenciler[0].numara}</p>
                    <div class="mt-12 grid grid-cols-2 gap-6">
                        <div class="p-6 bg-slate-50 rounded-3xl border"><p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Durum</p><p class="font-bold text-lg text-indigo-600 uppercase italic">${ogrenciler[0].durum}</p></div>
                        <div class="p-6 bg-slate-50 rounded-3xl border opacity-50"><p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Kişisel Bilgi</p><p class="font-bold text-sm">Değiştirilemez</p></div>
                    </div>
                </div>
            ` : ''}

            ${tab === 'okullar' ? `<div class="bg-indigo-600 p-12 rounded-[3rem] text-white shadow-2xl flex flex-col items-center justify-center text-center"> <i class="fas fa-school text-6xl mb-6 opacity-30"></i> <h2 class="text-4xl font-black uppercase tracking-tighter">Okul İstatistikleri</h2> <p class="mt-4 opacity-70">Bu bölüm tüm üyelerimiz için şeffaf bilgi paylaşımı amacıyla açıktır.</p></div>` : ''}
        </main>

        <script>
            function handleUImg(e) {
                const img = document.getElementById('uImg');
                const alrt = document.getElementById('uAlert');
                const file = e.target.files[0];
                if(file) {
                    alrt.classList.remove('hidden');
                    setTimeout(() => {
                        alrt.classList.add('hidden');
                        img.src = URL.createObjectURL(file);
                    }, 2500);
                }
            }
        </script>
    </body>
    </html>`);
});

// LOGIC ROUTES
app.post("/send-code", (req, res) => {
    geciciKod = Math.floor(100000 + Math.random() * 900000).toString();
    const role = req.body.loginRole || 'student';
    res.redirect(`/?page=login&role=${role}&step=2`);
});

app.post("/verify-code", (req, res) => {
    const role = req.body.verifyRole || 'student';
    res.redirect(`/?page=dashboard&role=${role}&tab=${role === 'teacher' ? 'ozet' : 'profil'}`);
});

app.post("/register-check", (req, res) => {
    const { type, yas } = req.body;
    const finalRole = (type === 'teacher' && parseInt(yas) >= 25) ? 'teacher' : 'student';
    res.redirect(`/?page=dashboard&role=${finalRole}&tab=${finalRole === 'teacher' ? 'ozet' : 'profil'}`);
});

export default app;
