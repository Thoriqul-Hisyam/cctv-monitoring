export default function StatsCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-600 shadow-blue-200",
    green: "bg-green-500 shadow-green-200",
    red: "bg-red-500 shadow-red-200",
    purple: "bg-purple-600 shadow-purple-200",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`w-2 h-2 rounded-full ${colorMap[color] || 'bg-slate-300'} animate-pulse`} />
      </div>
      <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      <div className="mt-4 flex items-center gap-2">
         <div className={`h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden`}>
            <div className={`h-full w-2/3 rounded-full ${colorMap[color] || 'bg-slate-300'}`} />
         </div>
         <span className="text-[10px] font-bold text-slate-400">AKTIF</span>
      </div>
    </div>
  );
}
