"use client";

import { Edit, Trash2, Building2, Users, Globe, Lock, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteGroup } from "@/actions/group";

type GroupWithCounts = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    isPublic: boolean;
    _count: {
        members: number;
        cctvs: number;
    };
};

export default function GroupTable({ data, canCreate = false }: { data: any[], canCreate?: boolean }) {
  const groups = data as GroupWithCounts[];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEdit = (id: number) => {
    router.push(`/admin/groups/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus grup ini? Semua data terkait mungkin akan terpengaruh.")) {
      startTransition(async () => {
        try {
          await deleteGroup(id);
        } catch (error: any) {
          alert(error.message || "Gagal menghapus grup");
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 border-b border-slate-100">
        <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daftar Organisasi</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Kelola grup dan unit kerja</p>
        </div>
        {canCreate && (
            <button
              onClick={() => router.push("/admin/groups/create")}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold text-sm active:scale-[0.98]"
            >
              <Building2 className="w-4 h-4" />
              <span>Tambah Grup Baru</span>
            </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Nama Grup</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Slug & Deskripsi</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Statistik</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Visibilitas</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Aksi</th>
            </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
            {groups.length === 0 && (
                <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <Building2 className="w-12 h-12 mb-2 opacity-10" />
                        <p className="font-medium">Belum ada grup terdaftar</p>
                    </div>
                </td>
                </tr>
            )}

            {groups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{group.name}</p>
                            <p className="text-[10px] font-medium text-slate-500">ID: {group.id}</p>
                        </div>
                    </div>
                </td>

                <td className="px-6 py-4 text-center">
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{group.slug}</span>
                    {group.description && (
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate mx-auto">{group.description}</p>
                    )}
                </td>

                <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-600" title="Jumlah Member">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{group._count.members}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600" title="Jumlah CCTV">
                            <Camera className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{group._count.cctvs}</span>
                        </div>
                    </div>
                </td>

                <td className="px-6 py-4 text-center">
                    {group.isPublic ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-green-100">
                        <Globe className="w-3 h-3" />
                        Publik
                    </span>
                    ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                        <Lock className="w-3 h-3" />
                        Privat
                    </span>
                    )}
                </td>

                <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                    <button
                        onClick={() => handleEdit(group.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Grup"
                    >
                        <Edit size={16} />
                    </button>

                    <button
                        onClick={() => router.push(`/admin/groups/${group.id}/members`)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Kelola Anggota"
                    >
                        <Users size={16} />
                    </button>

                    {canCreate && (
                        <button
                            onClick={() => handleDelete(group.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                            title="Hapus Grup"
                            disabled={isPending || group.slug === "default"}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
