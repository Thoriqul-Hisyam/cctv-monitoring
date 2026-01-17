import StatsCard from "@/components/admin/StatsCard";
import {
  LayoutDashboard,
  Camera,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Video,
  Bell,
  Search,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

const dashboardStats = [
  { label: "Total CCTV", value: "24", change: "+2", color: "blue" },
  { label: "Online", value: "22", change: "+1", color: "green" },
  { label: "Offline", value: "2", change: "-1", color: "red" },
  { label: "Total Users", value: "8", change: "+0", color: "purple" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Dashboard Admin</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Monitor status dan statistik sistem secara real-time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <div className={`w-8 h-8 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                <div className={`w-2 h-2 rounded-full bg-${stat.color}-600`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                </p>
                <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        stat.change.startsWith("+")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                    {stat.change}
                </div>
            </div>
            <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-tighter">vs kemarin</p>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ChevronDown className="w-5 h-5 text-blue-600 rotate-[-90deg]" />
            Aksi Cepat
          </h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 border border-transparent rounded-2xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                    <span className="block text-sm font-bold text-slate-900">Tambah CCTV Baru</span>
                    <span className="text-[10px] text-slate-500 font-medium">Registrasi perangkat baru ke sistem</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-green-50 hover:border-green-100 border border-transparent rounded-2xl transition-all group">
               <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-600 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                    <span className="block text-sm font-bold text-slate-900">Tambah User Baru</span>
                    <span className="text-[10px] text-slate-500 font-medium">Kelola hak akses operator</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-purple-50 hover:border-purple-100 border border-transparent rounded-2xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                    <span className="block text-sm font-bold text-slate-900">Live Monitoring</span>
                    <span className="text-[10px] text-slate-500 font-medium">Lihat semua tayangan kamera</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Aktivitas Terkini
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4 group cursor-default">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 ring-4 ring-orange-50" />
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  CCTV Offline Detected
                </p>
                <p className="text-xs font-semibold text-slate-400 tracking-tight">
                  Main Lobby • 2 Menit yang lalu
                </p>
              </div>
            </div>

             <div className="flex items-start gap-4 group cursor-default">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 ring-4 ring-blue-50" />
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  New User Login
                </p>
                <p className="text-xs font-semibold text-slate-400 tracking-tight">
                  operator1 • 5 Menit yang lalu
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 group cursor-default">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 ring-4 ring-green-50" />
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  CCTV Baru Ditambahkan
                </p>
                <p className="text-xs font-semibold text-slate-400 tracking-tight">
                  Parking Area B • 1 Jam yang lalu
                </p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-8 py-3 text-xs font-extrabold text-slate-400 hover:text-blue-600 border-2 border-dashed border-slate-100 hover:border-blue-100 rounded-2xl transition-all uppercase tracking-widest">
            Lihat Semua Aktivitas
          </button>
        </div>
      </div>
    </div>
  );
}
