"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGroup, updateGroup } from "@/actions/group";
import { Building2, AlignLeft, Fingerprint, Globe, CheckCircle } from "lucide-react";

type GroupFormProps = {
  mode: "create" | "edit";
  data?: any;
};

export default function GroupForm({ mode, data }: GroupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(data?.slug || "");

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
        try {
            if (mode === "create") {
                await createGroup(formData);
            } else {
                await updateGroup(data.id, formData);
            }
            router.push("/admin/groups");
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
            {mode === "create" ? "Buat Grup Baru" : "Edit Grup"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Grup digunakan untuk mengelompokkan CCTV dan User dalam satu organisasi unit.
          </p>
        </div>

        {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
            </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          {/* Name & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Nama Grup</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building2 size={16} />
                    </div>
                    <input
                        type="text"
                        name="name"
                        defaultValue={data?.name}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                        placeholder="Kantor Pusat"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Slug (URL)</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Fingerprint size={16} />
                        </div>
                        <input
                            type="text"
                            name="slug"
                            defaultValue={data?.slug}
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            disabled={mode === 'edit'} // Slug immutable on edit
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium disabled:bg-slate-50 disabled:text-slate-500"
                            placeholder="kantor-pusat"
                        />
                    </div>
                    {mode === 'create' && (
                        <button
                            type="button"
                            onClick={() => {
                                const randomSlug = Math.random().toString(36).substring(2, 10);
                                setSlug(randomSlug);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                        >
                            Generate Random
                        </button>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium ml-1">Unique identifier untuk URL akses.</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Deskripsi</label>
             <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                    <AlignLeft size={16} />
                </div>
                <textarea
                    name="description"
                    defaultValue={data?.description}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium resize-none"
                    placeholder="Deskripsi singkat tentang grup ini..."
                />
             </div>
          </div>

          {/* Visibility Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                name="isPublic" 
                defaultChecked={data?.isPublic}
                className="mt-1 rou nded text-blue-600 focus:ring-blue-500" 
              />
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <Globe size={16} className="text-blue-600" />
                      <span className="text-sm font-bold text-slate-900">Grup Publik</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                      Jika aktif, informasi dasar grup ini mungkin dapat dilihat oleh publik. CCTV di dalamnya tetap mengikuti pengaturan masing-masing.
                  </p>
              </div>
          </label>

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
                        Simpan Grup
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
