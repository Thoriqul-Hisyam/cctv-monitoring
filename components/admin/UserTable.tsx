"use client";

import { Edit, Trash2, User, Shield, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteUser } from "@/actions/user";

type UserWithRole = {
    id: number;
    username: string;
    name: string | null;
    email: string | null;
    isActive: boolean;
    memberships: {
        role: {
            name: string;
            slug: string;
        };
        group: {
            name: string;
        };
    }[];
};

export default function UserTable({ data }: { data: any[] }) {
  // Cast data safely
  const users = data as UserWithRole[];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEdit = (id: number) => {
    router.push(`/admin/users/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      startTransition(async () => {
        try {
          await deleteUser(id);
        } catch (error) {
          alert("Gagal menghapus user");
          console.error(error);
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 border-b border-slate-100">
        <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daftar Pengguna</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Kelola data pengguna dan hak akses</p>
        </div>
        <button
          onClick={() => router.push("/admin/users/create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold text-sm active:scale-[0.98]"
        >
          <User className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">User Info</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Role / Jabatan</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Organisasi</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">Aksi</th>
            </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
            {users.length === 0 && (
                <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <User className="w-12 h-12 mb-2 opacity-10" />
                        <p className="font-medium">Belum ada user terdaftar</p>
                    </div>
                </td>
                </tr>
            )}

            {users.map((user) => {
                // Get primary role (first membership)
                const primaryMembership = user.memberships[0];
                const roleName = primaryMembership?.role.name || "No Role";
                const groupName = primaryMembership?.group.name || "-";
                
                return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border-2 border-white shadow-sm">
                            <span className="font-bold text-xs">{user.username.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{user.name || user.username}</p>
                            <p className="text-[10px] font-medium text-slate-500">@{user.username}</p>
                        </div>
                    </div>
                </td>

                <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                        <Shield className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{roleName}</span>
                    </div>
                </td>

                <td className="px-6 py-4 text-center">
                    <p className="text-xs font-semibold text-slate-600">{groupName}</p>
                </td>

                <td className="px-6 py-4 text-center">
                    {user.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" />
                        Aktif
                    </span>
                    ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                        <XCircle className="w-3 h-3" />
                        Nonaktif
                    </span>
                    )}
                </td>

                <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                    <button
                        onClick={() => handleEdit(user.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit User"
                    >
                        <Edit size={16} />
                    </button>

                    <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                        title="Hapus User"
                        disabled={isPending}
                    >
                        <Trash2 size={16} />
                    </button>
                    </div>
                </td>
                </tr>
            )})}
            </tbody>
        </table>
      </div>
    </div>
  );
}
