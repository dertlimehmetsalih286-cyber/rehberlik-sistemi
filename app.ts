import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// VERİ YAPISI (Örnek verilerle birlikte)
let ogrenciler = [
    { id: 1, ad: "Mehmet Salih", okul: "Şehit Mehmet Acubucu İmamhatip Lisesi", numara: "101", sinif: "10-A", puan: 50, durum: "Gözlem" }
];

let okullar = [
    { ad: "Şehit Mehmet Acubucu İmamhatip Lisesi", ogrenciSayisi: 1, ortalama: 50.0 }
];

app.get("/", (req, res) => {
    // URL'den hangi sekmede olduğumuzu anlıyoruz (Varsayılan: ozet)
    const tab = req.query.tab || 'ozet';

    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <title>Rehberlik Karar Destek Sistemi</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            .tab-active { background-color: #1e293b; color: white !important; }
            input[type="range"] { accent-color: #4f46e5; }
        </style>
    </head>
    <body class="bg-slate-50 font-sans flex min-h-screen">

        <aside class="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
            <div class="p-6 border-b border-slate-100 cursor-pointer" onclick="window.location.href='/'">
                <div class="flex items-center space-x-4">
                    <div class="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
                        <i class="fas fa-book-open text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="font-bold text-slate-800 text-lg leading-tight">Rehberlik</h1>
                        <p class="text-xs text-slate-400 font-medium">Karar Destek</p>
                    </div>
                </div>
            </div>

            <nav class="p-4 space-y-2">
                <a href="/?tab=ozet" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 ${tab === 'ozet' ? 'tab-active' : ''}">
                    <i class="fas fa-th-large w-5 text-center"></i><span class="font-semibold text-sm">Özet</span>
                </a>
                <a href="/?tab=degerlendirme" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 ${tab === 'degerlendirme' ? 'tab-active' : ''}">
                    <i class="fas fa-sliders-h w-5 text-center"></i><span class="font-semibold text-sm">Değerlendirme</span>
                </a>
                <a href="/?tab=ogrenciler" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 ${tab === 'ogrenciler' ? 'tab-active' : ''}">
                    <i class="fas fa-user-graduate w-5 text-center"></i><span class="font-semibold text-sm">Öğrenciler</span>
                </a>
                <a href="/?tab=okullar" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 ${tab === 'okullar' ? 'tab-active' : ''}">
                    <i class="fas fa-school w-5 text-center"></i><span class="font-semibold text-sm">Okullar</span>
                </a>
            </nav>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            
            ${tab === 'ozet' ? `
                <header class="mb-10">
                    <h2 class="text-4xl font-extrabold text-slate-800">Rehberlik Özeti</h2>
                    <p class="text-slate-500 mt-2">Genel durum ve değerlendirme aktiviteleri.</p>
                </header>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="bg-white p-6 rounded-2xl border shadow-sm"><p class="text-xs font-bold text-slate-400 uppercase">Toplam Öğrenci</p><p class="text-3xl font-black">${ogrenciler.length}</p></div>
                    <div class="bg-white p-6 rounded-2xl border shadow-sm"><p class="text-xs font-bold text-slate-400 uppercase">Okul Sayısı</p><p class="text-3xl font-black">${okullar.length}</p></div>
                    <div class="bg-white p-6 rounded-2xl border shadow-sm"><p class="text-xs font-bold text-slate-400 uppercase">Ortalama Puan</p><p class="text-3xl font-black text-indigo-600">50.0</p></div>
                </div>
            ` : ''}

            ${tab === 'degerlendirme' ? `
                <header class="mb-10">
                    <h2 class="text-4xl font-extrabold text-slate-800">Değerlendirme</h2>
                    <p class="text-slate-500 mt-2">Öğrenci davranışlarını değerlendirin ve sonucu görün.</p>
                </header>
                <form action="/ekle" method="POST" class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div class="space-y-6">
                        <div class="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
                            <h3 class="font-bold text-lg mb-4">Öğrenci Bilgisi</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <input type="text" name="ad" placeholder="Ad Soyad" required class="p-3 bg-slate-50 border rounded-xl">
                                <input type="text" name="sinif" placeholder="Sınıf (Örn: 9-A)" required class="p-3 bg-slate-50 border rounded-xl">
                                <input type="text" name="okul" placeholder="Okul Adı" required class="p-3 bg-slate-50 border rounded-xl">
                                <input type="text" name="numara" placeholder="Öğrenci No" required class="p-3 bg-slate-50 border rounded-xl">
                            </div>
                        </div>
                        <div class="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
                            <h3 class="font-bold text-lg">Gözlem Kriterleri (0-10)</h3>
                            <div><label class="block text-xs font-bold mb-2">Disiplin Geçmişi</label><input type="range" name="disiplin" min="0" max="10" class="w-full"></div>
                            <div><label class="block text-xs font-bold mb-2">Sosyal İzolasyon</label><input type="range" name="sosyal" min="0" max="10" class="w-full"></div>
                            <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl">YENİ ÖĞRENCİ OLARAK KAYDET</button>
                        </div>
                    </div>
                    <div class="bg-indigo-50 p-8 rounded-3xl border-2 border-indigo-100 flex flex-col justify-center items-center text-center">
                        <div class="bg-white p-10 rounded-full shadow-xl mb-6"><p class="text-5xl font-black text-indigo-600">50</p><p class="text-xs font-bold text-slate-400">Karar Puanı</p></div>
                        <h4 class="text-xl font-bold text-indigo-800">Gözlem Önerilir</h4>
                        <p class="text-indigo-600 mt-4 text-sm">Öğrenciyi sosyal ortamda yakından gözlemleyin.</p>
                    </div>
                </form>
            ` : ''}

            ${tab === 'ogrenciler' ? `
                <header class="mb-10 flex justify-between items-center">
                    <div><h2 class="text-4xl font-extrabold text-slate-800">Öğrenciler</h2><p class="text-slate-500 mt-2">Kayıtlı öğrenciler ve geçmişleri.</p></div>
                    <button onclick="window.location.href='/?tab=degerlendirme'" class="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">+ Yeni Öğrenci</button>
                </header>
                <div class="bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase"><tr class="border-b">
                            <th class="p-5">Öğrenci / Sınıf</th><th class="p-5">Okul</th><th class="p-5">Durum</th><th class="p-5 text-right">Puan</th>
                        </tr></thead>
                        <tbody class="divide-y">
                            ${ogrenciler.map(o => `
                                <tr>
                                    <td class="p-5"><div class="font-bold">${o.ad}</div><div class="text-xs text-slate-400">${o.sinif}</div></td>
                                    <td class="p-5 text-sm text-slate-500">${o.okul}</td>
                                    <td class="p-5"><span class="px-3 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">${o.durum}</span></td>
                                    <td class="p-5 text-right font-black text-indigo-600">${o.puan}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}

            ${tab === 'okullar' ? `
                <header class="mb-10">
                    <h2 class="text-4xl font-extrabold text-slate-800">Okullar</h2>
                    <p class="text-slate-500 mt-2">Kayıtlı okulların başarı ve yönlendirme sıralaması.</p>
                </header>
                <div class="space-y-4">
                    ${okullar.map(okul => `
                        <div class="bg-white p-8 rounded-3xl border shadow-sm flex justify-between items-center">
                            <div>
                                <h3 class="text-xl font-bold flex items-center">${okul.ad} <i class="fas fa-award text-orange-400 ml-2"></i></h3>
                                <p class="text-sm text-slate-400 mt-1">${okul.ogrenciSayisi} Öğrenci Kayıtlı</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs font-bold text-slate-400 uppercase">Ortalama Puan</p>
                                <p class="text-3xl font-black text-indigo-600">${okul.ortalama}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

        </main>
    </body>
    </html>
    `);
});

// YENİ ÖĞRENCİ EKLEME (Değerlendirme Sekmesinden)
app.post("/ekle", (req, res) => {
    const { ad, sinif, okul, numara, disiplin, sosyal } = req.body;
    
    // Basit Karar Mantığı
    const ortalama = (parseInt(disiplin) + parseInt(sosyal)) * 5; 
    const durum = ortalama > 70 ? "Yönlendir" : (ortalama > 30 ? "Gözlem" : "Sorun Yok");

    ogrenciler.push({
        id: Date.now(),
        ad, sinif, okul, numara,
        puan: ortalama,
        durum: durum
    });

    // Okul listesini güncelle
    let okulVarMi = okullar.find(o => o.ad === okul);
    if (okulVarMi) {
        okulVarMi.ogrenciSayisi++;
    } else {
        okullar.push({ ad: okul, ogrenciSayisi: 1, ortalama: ortalama });
    }

    res.redirect("/?tab=ogrenciler");
});

export default app;
