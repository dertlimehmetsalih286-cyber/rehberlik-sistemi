import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, FileText, Activity, AlertCircle } from "lucide-react";

// Ekran görüntündeki örnek veriler
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

export default function Dashboard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Rehberlik Özeti</h1>
      <p className="text-gray-500 mb-8">Genel öğrenci durumu ve değerlendirme aktiviteleri.</p>

      {/* Üst Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grafikler Bölümü */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Karar Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decisionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sınıflara Göre Dağılım</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             {/* Buraya Sınıf Bazlı Grafik Gelecek */}
             <p className="text-center text-gray-400 pt-20">Sınıf verileri yükleniyor...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
