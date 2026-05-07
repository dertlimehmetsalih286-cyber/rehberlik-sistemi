import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, FileText, Activity, AlertCircle } from "lucide-react";

// Dashboard verileri
const stats = [
  { title: "Toplam Öğrenci", value: "12", icon: Users, color: "text-blue-600" },
  { title: "Değerlendirme", value: "15", icon: FileText, color: "text-green-600" },
  { title: "Ortalama Puan", value: "55.0", icon: Activity, color: "text-purple-600" },
  { title: "Dikkat Gereken", value: "3", icon: AlertCircle, color: "text-red-600" },
];

const decisionData = [
  { name: "Gerekmiyor", value: 5, color: "#22c55e" },
  { name: "Gözlem", value: 1, color: "#f97316" },
  { name: "Yönlendir", value: 3, color: "#ef4444" },
];

function App() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Rehberlik Özeti</h1>
        <p className="text-gray-500 mb-8">Genel öğrenci durumu ve değerlendirme aktiviteleri.</p>

        {/* Üst İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          ))}
        </div>

        {/* Grafikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Karar Dağılımı</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={decisionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {decisionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4 w-full">Sınıflara Göre Dağılım</h2>
            <div className="h-[300px] flex items-center justify-center">
               <p className="text-gray-400">Sınıf verileri senkronize ediliyor...</p>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-400">
          Fuzzy Logic Engine v1.0
        </footer>
      </div>
    </div>
  );
}

export default App;
