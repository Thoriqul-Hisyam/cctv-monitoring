"use client";

import { Edit, Trash2, User, Shield, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteUser } from "@/actions/user";
import { useToast } from "@/components/ui/use-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

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

export default function UserTable({ data }: { data: UserWithRole[] }) {
  // Cast data safely
  const users = data;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    router.push(`/admin/users/${id}/edit`);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    
    startTransition(async () => {
      try {
        await deleteUser(deleteId);
        toast({
          title: "User dihapus",
          description: "Data pengguna telah berhasil dihapus dari sistem.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Gagal menghapus user",
          description: "Terjadi kesalahan saat menghapus data pengguna.",
        });
        console.error(error);
      } finally {
        setDeleteId(null);
      }
    });
  };

  return (
    <>
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

      {/* Table & Cards */}
      <div className="overflow-x-auto hidden lg:block">
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
                        onClick={() => setDeleteId(user.id)}
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

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
        {users.map((user) => {
            const primaryMembership = user.memberships[0];
            const roleName = primaryMembership?.role.name || "No Role";
            const groupName = primaryMembership?.group.name || "-";

            return (
                <div key={user.id} className="glass rounded-2xl p-5 space-y-4 animate-slide-up bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-blue-100">
                                {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">{user.name || user.username}</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                    @{user.username}
                                </p>
                            </div>
                        </div>
                        {user.isActive ? (
                            <div className="bg-green-50 p-1.5 rounded-lg border border-green-100">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                        ) : (
                            <div className="bg-red-50 p-1.5 rounded-lg border border-red-100">
                                <XCircle className="w-4 h-4 text-red-500" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                            <Shield className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{roleName}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-black text-[8px] uppercase tracking-widest">
                            {groupName}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                            onClick={() => handleEdit(user.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-[10px] uppercase tracking-wider touch-scale"
                        >
                            <Edit size={14} />
                            Edit Profile
                        </button>
                        <button
                            onClick={() => setDeleteId(user.id)}
                            disabled={isPending}
                            className="p-3 bg-red-50 text-red-600 rounded-xl touch-scale disabled:opacity-30"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>

    <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
                <AlertDialogTitle className="font-black text-xl">Hapus Pengguna?</AlertDialogTitle>
                <AlertDialogDescription className="font-medium text-slate-500">
                    Tindakan ini akan menghapus akses pengguna secara permanen. Data yang sudah dihapus tidak dapat dikembalikan.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl font-bold">Batal</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={confirmDelete} 
                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                    {isPending ? "Menghapus..." : "Ya, Hapus User"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
