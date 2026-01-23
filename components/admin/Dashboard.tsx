import {
  Camera,
  Users,
  Video,
  Bell,
  Activity,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface StatItem {
    label: string;
    value: string;
    change: string;
    color: string;
}

interface ActivityItem {
    type: string;
    title: string;
    description: string;
    time: Date;
    color: string;
}

const ICON_MAP: Record<string, any> = {
    "Total CCTV": Camera,
    "Online": Activity,
    "Offline": Bell,
    "Total Users": Users,
};

const COLOR_MAP: Record<string, { bg: string, text: string, hoverBg: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", hoverBg: "group-hover:bg-blue-600" },
    green: { bg: "bg-green-50", text: "text-green-600", hoverBg: "group-hover:bg-green-600" },
    red: { bg: "bg-red-50", text: "text-red-600", hoverBg: "group-hover:bg-red-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", hoverBg: "group-hover:bg-purple-600" },
};

export default function Dashboard({ stats, activities }: { stats: StatItem[], activities: ActivityItem[] }) {
    // Relative time helper
    const getRelativeTime = (date: Date) => {
        const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (diff < 60) return "Baru saja";
        if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
        return date.toLocaleDateString();
    };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Ikhtisar Sistem & Statistik Monitoring
            </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sistem Stabil</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
            const Icon = ICON_MAP[stat.label] || Activity;
            const colors = COLOR_MAP[stat.color] || COLOR_MAP.blue;
            return (
          <div key={index} className="glass bg-white rounded-[32px] p-6 shadow-xl shadow-slate-100/50 hover:shadow-2xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${colors.bg} ${colors.text} ${colors.hoverBg} group-hover:text-white transition-all`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tight px-2 py-1 rounded-lg ${stat.change.startsWith("+") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                    {stat.label.includes("CCTV") ? "Kamera" : "Orang"}
                </p>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass bg-white rounded-[32px] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-2 border-blue-600 pb-1">
                Aksi Cepat
            </h2>
          </div>
          <div className="space-y-3">
            <Link href="/admin/cctv/create" className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all touch-scale group">
              <div className="flex items-center gap-4">
                <Camera className="w-5 h-5 text-blue-600 group-hover:text-blue-400" />
                <span className="text-xs font-black uppercase tracking-tight">Tambah CCTV</span>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-30" />
            </Link>
            <Link href="/admin/users/create" className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all touch-scale group">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 text-indigo-600 group-hover:text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-tight">Registrasi User</span>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-30" />
            </Link>
            <Link href="/" className="w-full flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl transition-all touch-scale shadow-xl shadow-slate-200">
              <div className="flex items-center gap-4">
                <Video className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-black uppercase tracking-tight">Monitoring</span>
              </div>
              <Activity className="w-4 h-4 text-green-500" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 glass bg-white rounded-[32px] p-8 space-y-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Aktivitas Terbaru
          </h2>
          <div className="space-y-4">
            {activities.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50 rounded-[20px] border border-dashed">
                    Belum ada aktivitas
                </div>
            ) : activities.map((activity, idx) => {
                const Icon = activity.type === 'cctv' ? Camera : Users;
                return (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${COLOR_MAP[activity.color]?.bg || 'bg-slate-100'} flex items-center justify-center ${COLOR_MAP[activity.color]?.text || 'text-slate-600'}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{activity.title}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{activity.description}</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 sm:mt-0">
                        {getRelativeTime(activity.time)}
                    </span>
                    </div>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
