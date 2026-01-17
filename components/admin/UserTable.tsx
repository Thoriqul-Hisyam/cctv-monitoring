import { Users, Edit, Trash2 } from "lucide-react";

export default function UserTable() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 border-b border-slate-100">
        <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daftar Pengguna</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Kelola akun operator dan administrator</p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold text-sm"
        >
          <Users className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Nama Pengguna</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Role</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Level Akses</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Users className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-900">admin01</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">Administrator</td>
                    <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold">FULL ACCESS</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-green-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Aktif
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                             <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <Edit size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
}
