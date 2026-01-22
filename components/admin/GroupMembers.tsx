"use client";

import { useState, useTransition } from "react";
import { addMember, removeMember } from "@/actions/membership"; // You need to export removeMember
import { User, Trash2, Plus, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

// Types
type GroupData = {
    id: number;
    name: string;
    members: {
        user: { id: number; username: string; name: string | null; email: string | null };
        role: { id: number; name: string; slug: string };
        joinedAt: Date;
    }[];
    roles: { id: number; name: string; slug: string }[];
};

type UserOption = {
    id: number;
    username: string;
    name: string | null;
};

export default function GroupMembersClient({ 
    group, 
    availableUsers 
}: { 
    group: GroupData;
    availableUsers: UserOption[];
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isAdding, setIsAdding] = useState(false);

    const handleRemove = async (userId: number) => {
        if(!confirm("Hapus user dari grup ini?")) return;
        
        startTransition(async () => {
            try {
                await removeMember(group.id, userId);
                router.refresh();
            } catch(e) {
                alert("Gagal menghapus member");
            }
        });
    };

    const handleAdd = async (formData: FormData) => {
        startTransition(async () => {
            try {
                await addMember(formData);
                setIsAdding(false);
                router.refresh();
            } catch(e: any) {
                alert(e.message);
            }
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-xl font-bold text-slate-800">Anggota Grup: {group.name}</h2>
                   <p className="text-sm text-slate-500">Kelola akses user ke grup ini</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition"
                >
                    <Plus size={16} /> {isAdding ? "Batal" : "Tambah Member"}
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                    <form action={handleAdd} className="flex gap-3 items-end">
                        <input type="hidden" name="groupId" value={group.id} />
                        
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Pilih User</label>
                            <select name="userId" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm">
                                <option value="">-- Pilih User --</option>
                                {availableUsers.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name || u.username} (@{u.username})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                             <select name="roleSlug" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm">
                                {group.roles.map(r => (
                                    <option key={r.id} value={r.slug}>{r.name}</option>
                                ))}
                             </select>
                        </div>

                        <button 
                            disabled={isPending}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 disabled:opacity-50"
                        >
                            {isPending ? "Simpan..." : "Tambahkan"}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 text-xs">User</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 text-xs">Role</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 text-xs">Bergabung</th>
                            <th className="px-6 py-3 text-center font-bold text-slate-500 text-xs">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {group.members.map(m => (
                            <tr key={m.user.id}>
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                            {m.user.username.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{m.user.name}</p>
                                            <p className="text-xs text-slate-500">@{m.user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        <Shield size={10} />
                                        {m.role.name}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-500 text-xs">
                                    {new Date(m.joinedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-3 text-center">
                                    <button 
                                        onClick={() => handleRemove(m.user.id)}
                                        className="text-slate-400 hover:text-red-600 transition"
                                        title="Keluarkan"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {group.members.length === 0 && (
                    <div className="p-8 text-center text-slate-400">Belum ada anggota di grup ini.</div>
                )}
            </div>
        </div>
    );
}
