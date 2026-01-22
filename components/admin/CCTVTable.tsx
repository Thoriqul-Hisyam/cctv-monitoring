"use client";

import { Edit, Trash2, Camera, Link as LinkIcon, Lock, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteCctv } from "@/actions/cctv";

type CCTV = {
  id: number;
  name: string;
  rt: string | null;
  rw: string | null;
  wilayah: string | null;
  kecamatan: string | null;
  kota: string | null;
  isActive: boolean;
  isPublic: boolean;
  slug?: string | null;
  group?: { name: string; slug: string } | null;
  createdById?: number | null;
  [key: string]: any; // Allow additional fields
};

export default function CCTVTable({ data, canManage }: { data: CCTV[], canManage: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEdit = (id: number) => {
    router.push(`/admin/cctv/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus CCTV ini?")) {
      startTransition(async () => {
        try {
          await deleteCctv(id);
        } catch (error) {
          alert("Gagal menghapus data");
          console.error(error);
        }
      });
    }
  };

  const handleCopyLink = (slug: string, groupSlug?: string | null) => {
    // If has group, use group url
    const path = groupSlug ? `/group/${groupSlug}/${slug}` : `/cctv/${slug}`;
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    alert("Share Link copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 border-b border-slate-100">
        <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daftar CCTV</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Kelola data kamera di seluruh wilayah</p>
        </div>
        {canManage && (
          <button
            onClick={() => router.push("/admin/cctv/create")}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold text-sm active:scale-[0.98]"
          >
            <Camera className="w-4 h-4" />
            <span>Tambah CCTV Baru</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Nama Kamera</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Organisasi</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Alamat (RT/RW)</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Wilayah</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Aksi</th>
            </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
            {data.length === 0 && (
                <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <Camera className="w-12 h-12 mb-2 opacity-10" />
                        <p className="font-medium">Belum ada data CCTV terdaftar</p>
                    </div>
                </td>
                </tr>
            )}

            {data.map((cctv) => (
                <tr key={cctv.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Camera className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 flex items-center gap-2">
                                {cctv.name}
                                {cctv.isPublic ? (
                                    <span title="Public"><Globe className="w-3 h-3 text-green-500" /></span>
                                ) : (
                                    <span title="Private"><Lock className="w-3 h-3 text-slate-400" /></span>
                                )}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500">{cctv.kota}</p>
                        </div>
                    </div>
                </td>

                <td className="px-6 py-4 text-left">
                    {cctv.group ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            {cctv.group.name}
                        </span>
                    ) : (
                         <span className="text-slate-400 text-[10px] italic">No Group</span>
                    )}
                </td>

                <td className="px-6 py-4 text-center">
                    <span className="text-slate-600 font-medium">{cctv.rt} / {cctv.rw}</span>
                </td>

                <td className="px-6 py-4 text-center">
                    <p className="text-slate-600 font-bold">{cctv.kecamatan}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{cctv.wilayah}</p>
                </td>

                <td className="px-6 py-4 text-center">
                    {cctv.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Aktif
                    </span>
                    ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Nonaktif
                    </span>
                    )}
                </td>

                <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                    
                    {cctv.slug && (
                        <button
                            onClick={() => handleCopyLink(cctv.slug!, cctv.group?.slug)}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Copy Share Link"
                        >
                            <LinkIcon size={18} />
                        </button>
                    )}

                    {canManage && (
                        <>
                            <button
                                onClick={() => handleEdit(cctv.id)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit Data"
                            >
                                <Edit size={18} />
                            </button>

                            <button
                                onClick={() => handleDelete(cctv.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                                title="Hapus Data"
                                disabled={isPending}
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
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
