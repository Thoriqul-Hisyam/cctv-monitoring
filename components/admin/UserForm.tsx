"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser } from "@/actions/user";
import { User, Lock, Mail, Shield, CheckCircle } from "lucide-react";

type UserFormProps = {
  mode: "create" | "edit";
  data?: any;
};

const ROLES = [
    { slug: "super_admin", name: "Super Admin", desc: "Akses penuh ke semua fitur" },
    { slug: "admin", name: "Admin", desc: "Kelola CCTV & User" },
    { slug: "operator", name: "Operator", desc: "Kelola CCTV saja" },
    { slug: "viewer", name: "Viewer", desc: "Hanya bisa melihat" },
];

export default function UserForm({ mode, data }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Primary Role (from first membership if edit)
  const currentRole = data?.memberships?.[0]?.role?.slug || "viewer";

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
        try {
            if (mode === "create") {
                await createUser(formData);
            } else {
                await updateUser(data.id, formData);
            }
            router.push("/admin/users");
            router.refresh(); 
        } catch (err: any) {
            setError(err.message);
        }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === "create" ? "Tambah User Baru" : "Edit User"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Isi formulir berikut untuk {mode === "create" ? "menambahkan" : "memperbarui"} data pengguna.
          </p>
        </div>

        {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
            </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          {/* Username & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Username</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={16} />
                    </div>
                    <input
                        type="text"
                        name="username"
                        defaultValue={data?.username}
                        required
                        disabled={mode === 'edit'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium disabled:bg-slate-50 disabled:text-slate-500"
                        placeholder="john_doe"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Nama Lengkap</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={16} />
                    </div>
                    <input
                        type="text"
                        name="name"
                        defaultValue={data?.name}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                        placeholder="John Doe"
                    />
                </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Email (Opsional)</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                </div>
                <input
                    type="email"
                    name="email"
                    defaultValue={data?.email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                    placeholder="john@example.com"
                />
             </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Shield size={14} /> Pilih Role
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ROLES.map((role) => (
                    <label 
                        key={role.slug} 
                        className="relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200 has-[:checked]:ring-1 has-[:checked]:ring-blue-200"
                    >
                        <input 
                            type="radio" 
                            name="role" 
                            value={role.slug} 
                            defaultChecked={role.slug === currentRole}
                            className="mt-1"
                        />
                        <div>
                            <span className="block text-sm font-bold text-slate-900">{role.name}</span>
                            <span className="block text-[10px] text-slate-500 font-medium">{role.desc}</span>
                        </div>
                    </label>
                ))}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
             <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                {mode === "create" ? "Password" : "Password Baru (Kosongkan jika tidak diubah)"}
             </label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                </div>
                <input
                    type="password"
                    name="password"
                    required={mode === "create"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                />
             </div>
          </div>

          {/* Status Checkbox (Edit only) */}
          {mode === 'edit' && (
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    value="true" 
                    defaultChecked={data?.isActive}
                    className="rounded text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-sm font-bold text-slate-700">Akun Aktif</span>
              </label>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
             <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
            >
                Batal
            </button>
            <button
                type="submit"
                disabled={isPending}
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70"
            >
                {isPending ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <CheckCircle size={18} />
                        Simpan Data
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
