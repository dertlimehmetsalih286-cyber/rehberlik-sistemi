import React from "react";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst Menü / Navbar (İsteğe Bağlı) */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Rehberlik Sistemi</span>
          </div>
          <div className="flex gap-4">
            <button className="text-sm font-medium text-gray-600 hover:text-blue-600">Admin Paneli</button>
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300"></div>
          </div>
        </div>
      </nav>

      {/* Ana İçerik: Dashboard Bileşeni */}
      <main>
        <Dashboard />
      </main>

      {/* Alt Bilgi */}
      <footer className="py-6 border-t border-gray-200 bg-white">
        <p className="text-center text-gray-400 text-sm">
          © 2026 Rehberlik Karar Destek Sistemi - Tüm Hakları Saklıdır.
        </p>
      </footer>
    </div>
  );
}

export default App;
