"use client";

import { useTransition, useState } from "react";
import { createCctv, updateCctv, regenerateCctvSlug } from "@/actions/cctv";
import dynamic from "next/dynamic";
import { MapPin, Globe, Lock, Network, Building2, Save, Trash2, RefreshCw, X, Check } from "lucide-react";
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

const LocationPicker = dynamic(() => import("./LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Memuat Peta...</div>
});

type Props = {
  mode: "create" | "edit";
  data?: any;
  userRole: string;
  groups: { id: number; name: string; slug: string }[];
};

export default function CctvForm({ mode, data, userRole, groups }: Props) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [showMap, setShowMap] = useState(false);
  const [showRegenAlert, setShowRegenAlert] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number | null; lng: number | null }>({
      lat: data?.latitude ?? null,
      lng: data?.longitude ?? null,
  });

  const action = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createCctv(formData);
          toast({ title: "Berhasil", description: "CCTV berhasil ditambahkan." });
        } else {
          await updateCctv(data.id, formData);
          toast({ title: "Berhasil", description: "CCTV berhasil diperbarui." });
        }
      } catch (e) {
        toast({ title: "Gagal", variant: "destructive", description: "Terjadi kesalahan sistem." });
      }
    });
  };

  const handleRegenerateSlug = async () => {
    startTransition(async () => {
        try {
            await regenerateCctvSlug(data.id);
            toast({ title: "Slug Diperbarui", description: "Link berbagi baru telah dibuat." });
        } catch (e) {
            toast({ title: "Gagal", variant: "destructive", description: "Gagal memperbarui slug." });
        } finally {
            setShowRegenAlert(false);
        }
    });
  };

  return (
    <>
    <form action={action} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Card */}
      <div className="glass bg-white rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === "create" ? "Tambah CCTV" : "Edit CCTV"}
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {mode === "create" ? "Registrasi Kamera Baru" : "Informasi CCTV " + data?.name}
          </p>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-200 touch-scale disabled:opacity-50"
        >
          {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isPending ? "Proses..." : "Simpan Data"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up [animation-delay:100ms]">
        {/* Lokasi Section */}
        <div className="glass bg-white rounded-3xl p-6 lg:p-8 space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
            <MapPin className="w-3 h-3 text-blue-600" /> Informasi Wilayah
          </h3>

          <FloatingInput name="name" label="Nama Lokasi / Jalan" defaultValue={data?.name} required />

          <div className="grid grid-cols-2 gap-4">
            <FloatingInput name="rt" label="RT" defaultValue={data?.rt} required />
            <FloatingInput name="rw" label="RW" defaultValue={data?.rw} required />
          </div>

          <FloatingInput name="wilayah" label="Kelurahan / Desa" defaultValue={data?.wilayah} required />
          <FloatingInput name="kecamatan" label="Kecamatan" defaultValue={data?.kecamatan} required />
          <FloatingInput name="kota" label="Kota / Kabupaten" defaultValue={data?.kota} required />
          
          <div className="pt-2">
            <button
                type="button"
                onClick={() => setShowMap(true)}
                className={`w-full py-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all touch-scale ${
                    selectedLocation.lat 
                    ? "border-green-200 bg-green-50/50 text-green-700" 
                    : "border-slate-200 bg-slate-50/50 text-slate-400 hover:border-blue-300 hover:bg-blue-50"
                }`}
            >
                {selectedLocation.lat ? (
                    <>
                        <Check className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Titik Koordinat Terpasang</span>
                    </>
                ) : (
                    <>
                        <MapPin className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pin Lokasi di Peta</span>
                    </>
                )}
            </button>
            <input type="hidden" name="latitude" value={selectedLocation.lat ?? ""} />
            <input type="hidden" name="longitude" value={selectedLocation.lng ?? ""} />
          </div>
        </div>

        <div className="space-y-6">
            {/* Network Section */}
            <div className="glass bg-white rounded-3xl p-6 lg:p-8 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <Network className="w-3 h-3 text-blue-600" /> Konfigurasi Streaming
                </h3>

                <FloatingInput
                    name="ipAddress"
                    label="Alamat RTSP"
                    defaultValue={data?.ipAddress}
                    placeholder="rtsp://user:pass@ip:port/cam"
                    required
                />
            </div>

            {/* Group Selection */}
            <div className="glass bg-white rounded-3xl p-6 lg:p-8 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <Building2 className="w-3 h-3 text-blue-600" /> Organisasi
                </h3>
                
                {groups.length > 1 ? (
                    <div className="relative group">
                        <select
                            name="groupId"
                            defaultValue={data?.groupId ?? ""}
                            className="peer w-full h-[52px] px-4 pt-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
                            required
                        >
                            <option value="" disabled>Pilih Organisasi</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <label className="absolute left-4 top-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            Pilih Group
                        </label>
                    </div>
                ) : groups.length === 1 ? (
                    <div className="px-4 py-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">{groups[0].name}</span>
                        <input type="hidden" name="groupId" value={data?.groupId ?? groups[0].id} />
                        <Check className="w-4 h-4 text-green-500" />
                    </div>
                ) : null}
            </div>

            {/* Visibility */}
            {userRole === "admin" && (
                <div className="glass bg-white rounded-3xl p-6 lg:p-8 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                        👁️ Visibilitas
                    </h3>
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors touch-scale">
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Publikasikan</span>
                            <span className="text-[10px] font-bold text-slate-500">Muncul di landing page utama</span>
                        </div>
                        <input
                            type="checkbox"
                            name="isPublic"
                            defaultChecked={data?.isPublic ?? false}
                            className="w-5 h-5 accent-blue-600 rounded-lg cursor-pointer"
                        />
                    </label>
                </div>
            )}
        </div>
      </div>

      {/* Shareable Link */}
      {data?.slug && (
        <div className="glass bg-slate-900 rounded-3xl p-8 text-white space-y-6 animate-slide-up [animation-delay:200ms]">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                🔗 Link Berbagi
            </h3>
            <button
                type="button"
                onClick={() => setShowRegenAlert(true)}
                className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors"
                disabled={isPending}
            >
                Regenerate Link
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
             <div className="flex-1 p-4 bg-white/10 rounded-2xl text-xs font-mono break-all text-slate-300 flex items-center">
                {typeof window !== 'undefined' 
                    ? `${window.location.origin}${data.groupId ? `/group/${groups.find(g => g.id === data.groupId)?.slug || '...'}` : '/cctv'}/${data.slug}` 
                    : `/${data.slug}`}
             </div>
             <button
               type="button"
               onClick={() => {
                   const url = `${window.location.origin}${data.groupId ? `/group/${groups.find(g => g.id === data.groupId)?.slug || '...'}` : '/cctv'}/${data.slug}`;
                   navigator.clipboard.writeText(url);
                   toast({ title: "Tersalin", description: "Link telah dicopy ke clipboard." });
               }}
               className="bg-white text-slate-950 font-black text-xs uppercase tracking-widest px-8 h-[52px] rounded-2xl touch-scale shrink-0"
             >
               Copy Link
             </button>
          </div>
        </div>
      )}
    </form>

    {/* Map Modal */}
    {showMap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowMap(false)} />
            <div className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-slate-900 uppercase tracking-tight">Pin Lokasi</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Tentukan koordinat presisi</p>
                    </div>
                    <button onClick={() => setShowMap(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1">
                    <LocationPicker 
                        latitude={selectedLocation.lat} 
                        longitude={selectedLocation.lng} 
                        onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })} 
                    />
                </div>
                <div className="p-6 border-t border-slate-100">
                    <button 
                        onClick={() => setShowMap(false)}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs touch-scale"
                    >
                        Selesai Memilih
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* Regen Alert */}
    <AlertDialog open={showRegenAlert} onOpenChange={setShowRegenAlert}>
        <AlertDialogContent className="rounded-[32px]">
            <AlertDialogHeader>
                <AlertDialogTitle className="font-black tracking-tight text-xl">Regenerate Link?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 font-medium">
                    Link lama tidak akan dapat diakses lagi. Pastikan Anda sudah siap membagikan link yang baru.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-2xl border-2 font-bold uppercase tracking-widest text-[10px] h-12">Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegenerateSlug} className="rounded-2xl bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px] h-12 text-white">Ya, Regenerate</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

/* ---------- Floating Input Component ---------- */

function FloatingInput({
  label,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="relative group">
      <input
        {...props}
        required={required}
        placeholder=" "
        className="peer w-full h-[52px] px-4 pt-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all placeholder-transparent"
      />
      <label className="absolute left-4 top-2 text-[8px] font-black text-slate-400 uppercase tracking-widest transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:text-[8px] peer-focus:top-2 peer-focus:text-blue-600 pointer-events-none">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
}
