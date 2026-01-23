"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser } from "@/actions/user";
import { User, Lock, Mail, Shield, CheckCircle, ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

function FloatingInput({
  label,
  required,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: any }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-[18px] text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
        <Icon size={16} />
      </div>
      <input
        {...props}
        required={required}
        placeholder=" "
        className="peer w-full h-[56px] pl-11 pr-4 pt-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-transparent"
      />
      <label className="absolute left-11 top-2 text-[8px] font-black text-slate-400 uppercase tracking-widest transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-[20px] peer-focus:text-[8px] peer-focus:top-2 peer-focus:text-blue-600 pointer-events-none">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
}

export default function UserForm({ mode, data }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const currentRole = data?.memberships?.[0]?.role?.slug || "viewer";

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
        try {
            if (mode === "create") {
                await createUser(formData);
                toast({ title: "Berhasil", description: "Pengguna baru telah didaftarkan." });
            } else {
                await updateUser(data.id, formData);
                toast({ title: "Berhasil", description: "Data pengguna telah diperbarui." });
            }
            router.push("/admin/users");
            router.refresh(); 
        } catch (err: any) {
            setError(err.message);
            toast({ variant: "destructive", title: "Gagal", description: err.message });
        }
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-slide-up">
      <button 
        onClick={() => router.back()}
        type="button"
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={14} />
        Kembali ke Daftar
      </button>

      <div className="glass bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 p-6 sm:p-10 border border-white">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            {mode === "create" ? "Tambah Akun" : "Edit Profil"}
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">
            Informasi Kredensial & Hak Akses
          </p>
        </div>

        {error && (
            <div className="p-4 mb-8 bg-red-50 text-red-600 rounded-[20px] text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
            </div>
        )}

        <form action={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 opacity-50">
                Data Identitas
            </h3>
            <div className="grid grid-cols-1 gap-4">
                <FloatingInput
                    label="Username"
                    name="username"
                    icon={User}
                    defaultValue={data?.username}
                    required
                    disabled={mode === 'edit'}
                />
                <FloatingInput
                    label="Nama Lengkap"
                    name="name"
                    icon={User}
                    defaultValue={data?.name}
                    required
                />
                <FloatingInput
                    label="Alamat Email"
                    name="email"
                    type="email"
                    icon={Mail}
                    defaultValue={data?.email}
                />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 opacity-50">
                Keamanan & Akses
            </h3>
            <div className="grid grid-cols-1 gap-4">
                <FloatingInput
                    label={mode === "create" ? "Password" : "Password Baru (Opsional)"}
                    name="password"
                    type="password"
                    icon={Lock}
                    required={mode === "create"}
                />
            </div>
            
            <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={14} className="text-blue-600" /> Pilih Level Akses
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ROLES.map((role) => (
                        <label 
                            key={role.slug} 
                            className="group relative flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-50 cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:bg-blue-600 has-[:checked]:border-blue-600 has-[:checked]:shadow-xl has-[:checked]:shadow-blue-200"
                        >
                            <input 
                                type="radio" 
                                name="role" 
                                value={role.slug} 
                                defaultChecked={role.slug === currentRole}
                                className="hidden"
                            />
                            <div className="flex-1">
                                <span className="block text-xs font-black uppercase tracking-tight text-slate-900 group-has-[:checked]:text-white">
                                    {role.name}
                                </span>
                                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest group-has-[:checked]:text-blue-100 mt-1">
                                    {role.desc}
                                </span>
                            </div>
                            <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-has-[:checked]:border-white group-has-[:checked]:bg-white flex items-center justify-center transition-all">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-has-[:checked]:opacity-100 transition-opacity" />
                            </div>
                        </label>
                    ))}
                </div>
            </div>
          </div>

          {mode === 'edit' && (
              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-green-50 hover:border-green-200 transition-all">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-has-[:checked]:text-green-600 group-has-[:checked]:shadow-sm">
                        <CheckCircle size={16} />
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-green-700">Status Akun Aktif</span>
                  </div>
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    value="true" 
                    defaultChecked={data?.isActive}
                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" 
                  />
              </label>
          )}

          <div className="flex pt-4">
            <button
                type="submit"
                disabled={isPending}
                className="w-full h-[56px] flex items-center justify-center gap-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 hover:shadow-blue-200 disabled:opacity-50 touch-scale"
            >
                {isPending ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                    </div>
                ) : (
                    <>
                        <CheckCircle size={18} />
                        Konfirmasi Data
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
