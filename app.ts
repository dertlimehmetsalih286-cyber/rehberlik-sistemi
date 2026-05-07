import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// ÖRNEK VERİLER
let ogrenciler = [
    { ad: "Mehmet Salih", numara: "101", puan: 85 },
    { ad: "Zeynep", numara: "102", puan: 45 }
];

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <title>Rehberlik Karar Destek</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            .sidebar-transition { transition: all 0.3s ease-in-out; }
            .submenu-active { display: block !important; }
        </style>
    </head>
    <body class="bg-slate-50 font-sans flex min-h-screen">

        <aside class="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
            <div class="p-6 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition" onclick="toggleMenu()">
                <div class="flex items-center space-x-4">
                    <div class="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
                        <i class="fas fa-book-open text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="font-bold text-slate-800 text-lg leading-tight">Rehberlik</h1>
                        <p class="text-xs text-slate-400 font-medium">Karar Destek</p>
                    </div>
                    <i class="fas fa-chevron-down ml-auto text-slate-300 text-xs" id="menuArrow"></i>
                </div>
            </div>

            <nav class="p-4 space-y-2 hidden" id="subMenus">
                <a href="#" class="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 text-white shadow-md">
                    <i class="fas fa-th-large w-5 text-center"></i>
                    <span class="font-semibold text-sm">Özet</span>
                </a>
                <a href="#" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition">
                    <i class="fas fa-sliders-h w-5 text-center"></i>
                    <span class="font-semibold text-sm">Değerlendirme</span>
                </a>
                <a href="#" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition">
                    <i class="fas fa-user-graduate w-5 text-center"></i>
                    <span class="font-semibold text-sm">Öğrenciler</span>
                </a>
                <a href="#" class="flex items-center space-x-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition">
                    <i class="fas fa-school w-5 text-center"></i>
                    <span class="font-semibold text-sm">Okullar</span>
                </a>
            </nav>

            <div class="mt-auto p-6 border-t border-slate-50">
                <p class="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Fuzzy Engine v1.0</p>
            </div>
        </aside>

        <main class="flex-1 p-10 overflow-y-auto">
            <header class="mb-10">
                <h2 class="text-4xl font-extrabold text-slate-800 tracking-tight">Rehberlik Özeti</h2>
                <p class="text-slate-500 mt-2 text-lg">Genel öğrenci durumu ve değerlendirme aktiviteleri.</p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div class="text-slate-400 text-xs font-bold uppercase mb-2">Toplam Öğrenci</div>
                    <div class="text-3xl font-black text-slate-800">${ogrenciler.length}</div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div class="text-slate-400 text-xs font-bold uppercase mb-2">Değerlendirme</div>
                    <div class="text-3xl font-black text-slate-800">15</div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div class="text-slate-400 text-xs font-bold uppercase mb-2">Ortalama Puan</div>
                    <div class="text-3xl font-black text-indigo-600">55.0</div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div class="text-slate-400 text-xs font-bold uppercase mb-2 text-red-400">Dikkat Gereken</div>
                    <div class="text-3xl font-black text-red-600">3</div>
                </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <section class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 class="text-xl font-bold mb-6 text-slate-800">Hızlı Kayıt</h3>
                    <form action="/ekle" method="POST" class="space-y-5">
                        <input type="text" name="ad" placeholder="Öğrenci Adı" required class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        <input type="text" name="numara" placeholder="Okul Numarası" required class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        <input type="number" name="puan" placeholder="Puan (0-100)" required class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        <button class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition">KAYDET</button>
                    </form>
                </section>

                <section class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase">
                            <tr>
                                <th class="p-5">Öğrenci</th>
                                <th class="p-5">Puan</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${ogrenciler.map(o => `
                                <tr>
                                    <td class="p-5">
                                        <div class="font-bold text-slate-700">${o.ad}</div>
                                        <div class="text-xs text-slate-400">${o.numara}</div>
                                    </td>
                                    <td class="p-5 font-black text-indigo-600">${o.puan}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>
            </div>
        </main>

        <script>
            function toggleMenu() {
                const sub = document.getElementById('subMenus');
                const arrow = document.getElementById('menuArrow');
                sub.classList.toggle('hidden');
                arrow.classList.toggle('rotate-180');
            }
        </script>
    </body>
    </html>
  `);
});

app.post("/ekle", (req, res) => {
    const { ad, numara, puan } = req.body;
    ogrenciler.push({ ad, numara, puan: parseInt(puan) });
    res.redirect("/");
});

export default app;
