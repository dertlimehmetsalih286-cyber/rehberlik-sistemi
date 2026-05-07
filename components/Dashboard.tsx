import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"; // Eğer ui klasörün yoksa burayı "./Card" yapabilirsin
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, FileText, Activity, AlertCircle } from "lucide-react";

// Ekran görüntündeki verilerin birebir aynısı
const stats = [
  { title: "Toplam Öğrenci", value: "12", icon: Users, color: "text-blue-600" },
  { title: "Değerlendirme", value: "15", icon: FileText, color: "text-green-600" },
  { title: "Ortalama Puan", value: "55.0", icon: Activity, color: "text-purple-600" },
  { title: "Dikkat Gereken", value: "3", icon: AlertCircle, color: "text-red-600" },
];

const decisionData = [
  { name: "Gerekmiyor", value: 5, color: "#22c55e" }, // Yeşil
  { name: "Gözlem", value: 1, color: "#f97316" },    // Turuncu
  { name: "Yönlendir", value: 3, color: "#ef4444" },  // Kırmızı
];

const Dashboard = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Rehberlik Özeti</h1>
        <p className="text-gray-500">Genel öğrenci durumu ve değerlendirme aktiviteleri.</p>
      </div>

      {/* Üst İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-sm border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grafikler Bölümü */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Karar Dağılımı Grafiği */}
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle className="text-lg">Karar Dağılımı</CardTitle>
            <p className="text-xs text-gray-400 font-normal">Tüm değerlendirmelerin sonuç dağılımı</p>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decisionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sınıf Bazlı Dağılım (Placeholder) */}
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle className="text-lg">Sınıflara Göre Dağılım</CardTitle>
            <p className="text-xs text-gray-400 font-normal">Sınıf bazlı öğrenci sayıları ve yönlendirmeler</p>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             <div className="text-center">
               <Activity className="h-12 w-12 text-gray-200 mx-auto mb-2" />
               <p className="text-gray-400 text-sm">Sınıf verileri grafikleniyor...</p>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400">
        Fuzzy Logic Engine v1.0
      </div>
    </div>
  );
};

export default Dashboard;
