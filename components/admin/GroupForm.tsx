"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGroup, updateGroup } from "@/actions/group";
import { Building2, AlignLeft, Fingerprint, Globe, CheckCircle, ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type GroupFormProps = {
  mode: "create" | "edit";
  data?: any; // Keep any for Prisma model
  isSettings?: boolean;
};

function FloatingInput({
  label,
  required,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ElementType }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-[18px] text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
        <Icon size={16} />
      </div>
      <input
        {...props}
        required={required}
        placeholder=" "
        className="peer w-full h-[56px] pl-11 pr-4 pt-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all placeholder-transparent"
      />
      <label className="absolute left-11 top-2 text-[8px] font-black text-slate-400 uppercase tracking-widest transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-[20px] peer-focus:text-[8px] peer-focus:top-2 peer-focus:text-indigo-600 pointer-events-none">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
}

export default function GroupForm({ mode, data, isSettings = false }: GroupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(data?.slug || "");

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
        try {
            if (mode === "create") {
                await createGroup(formData);
                toast({ title: "Berhasil", description: "Grup baru telah dibuat." });
            } else {
                await updateGroup(data.id, formData);
                toast({ title: "Berhasil", description: "Pengaturan grup diperbarui." });
            }
            
            if (isSettings) {
                router.refresh();
            } else {
                router.push("/admin/groups");
                router.refresh();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
            toast({ variant: "destructive", title: "Gagal", description: message });
        }
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-slide-up">
      {!isSettings && (
        <button 
            onClick={() => router.back()}
            type="button"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
        >
            <ChevronLeft size={14} />
            Kembali ke Daftar
        </button>
      )}

      <div className="glass bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 p-6 sm:p-10 border border-white">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            {mode === "create" ? "Buat Grup" : "Edit Grup"}
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">
            Organisasi & Unit Kerja
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
                Informasi Dasar
            </h3>
            <div className="grid grid-cols-1 gap-4">
                <FloatingInput
                    label="Nama Grup / Unit"
                    name="name"
                    icon={Building2}
                    defaultValue={data?.name}
                    required
                />
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <FloatingInput
                            label="Slug (URL)"
                            name="slug"
                            icon={Fingerprint}
                            value={slug}
                            onChange={(e: any) => setSlug(e.target.value)}
                            required
                            disabled={mode === 'edit' && data?.slug === 'default'}
                        />
                    </div>
                    {mode === 'create' && (
                        <button
                            type="button"
                            onClick={() => {
                                const randomSlug = Math.random().toString(36).substring(2, 10);
                                setSlug(randomSlug);
                            }}
                            className="h-[56px] px-6 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                            Random
                        </button>
                    )}
                </div>
            </div>
          </div>

          <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-50">
                  Deskripsi & Publikasi
              </h3>
              <div className="relative group">
                <div className="absolute left-4 top-[18px] text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <AlignLeft size={16} />
                </div>
                <textarea
                    name="description"
                    defaultValue={data?.description}
                    placeholder=" "
                    rows={4}
                    className="peer w-full pl-11 pr-4 pt-6 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all placeholder-transparent resize-none"
                />
                <label className="absolute left-11 top-2 text-[8px] font-black text-slate-400 uppercase tracking-widest transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-[20px] peer-focus:text-[8px] peer-focus:top-2 peer-focus:text-indigo-600 pointer-events-none">
                    Deskripsi Organisasi
                </label>
              </div>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-blue-50 hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-has-[:checked]:text-blue-600 group-has-[:checked]:shadow-sm">
                        <Globe size={16} />
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-blue-700">Dapat Diakses Publik</span>
                  </div>
                  <input 
                    type="checkbox" 
                    name="isPublic" 
                    value="true" 
                    defaultChecked={data?.isPublic}
                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" 
                  />
              </label>
          </div>

          <div className="flex pt-4">
            <button
                type="submit"
                disabled={isPending}
                className="w-full h-[56px] flex items-center justify-center gap-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200 disabled:opacity-50 touch-scale"
            >
                {isPending ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Menyimpan...</span>
                    </div>
                ) : (
                    <>
                        <CheckCircle size={18} />
                        Simpan Pengaturan
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
