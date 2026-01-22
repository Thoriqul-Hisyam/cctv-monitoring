"use client";

import { useTransition, useState } from "react";
import { createCctv, updateCctv, regenerateCctvSlug } from "@/actions/cctv";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
});

type Props = {
  mode: "create" | "edit";
  data?: any;
  userRole: string;
  groups: { id: number; name: string; slug: string }[];
};

export default function CctvForm({ mode, data, userRole, groups }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number | null; lng: number | null }>({
      lat: data?.latitude ?? null,
      lng: data?.longitude ?? null,
  });

  const action = async (formData: FormData) => {
    startTransition(async () => {
      if (mode === "create") {
        await createCctv(formData);
      } else {
        await updateCctv(data.id, formData);
      }
    });
  };

  const handleRegenerateSlug = async () => {
    if (confirm("Apakah Anda yakin ingin me-regenerate slug? Link lama tidak akan berfungsi lagi.")) {
        startTransition(async () => {
             await regenerateCctvSlug(data.id);
             alert("Slug berhasil diperbarui!");
        });
    }
  };

  return (
    <form action={action} className="space-y-8 bg-white rounded-lg shadow p-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {mode === "create" ? "Tambah CCTV Baru" : "Edit CCTV"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {mode === "create"
            ? "Tambahkan lokasi CCTV baru ke sistem"
            : "Perbarui informasi CCTV"}
        </p>
      </div>

      {/* Lokasi Section */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          📍 Informasi Lokasi
        </h3>

        <Input name="name" label="Nama Lokasi" defaultValue={data?.name} />

        <div className="grid grid-cols-2 gap-6">
          <Input name="rt" label="RT" defaultValue={data?.rt} />
          <Input name="rw" label="RW" defaultValue={data?.rw} />
        </div>

        <Input name="wilayah" label="Wilayah" defaultValue={data?.wilayah} />
        <Input
          name="kecamatan"
          label="Kecamatan"
          defaultValue={data?.kecamatan}
        />
        <Input name="kota" label="Kota" defaultValue={data?.kota} />
        
        {/* Interactive Location Picker */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pilih Titik Lokasi</label>
            <LocationPicker 
                latitude={selectedLocation.lat} 
                longitude={selectedLocation.lng} 
                onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })} 
            />
            {/* Hidden Inputs for Form Submission */}
            <input type="hidden" name="latitude" value={selectedLocation.lat ?? ""} />
            <input type="hidden" name="longitude" value={selectedLocation.lng ?? ""} />
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Network Configuration Section */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          🌐 Konfigurasi Network
        </h3>

        <Input
          name="ipAddress"
          label="RTSP"
          defaultValue={data?.ipAddress}
          placeholder="rtsp://xxxx:xxx@192.8.8.8.8:554/cam1"
        />
        {/* <Input
          name="port"
          label="Port"
          type="number"
          defaultValue={data?.port ?? 554}
          placeholder="554"
        />
        <Input name="username" label="Username" defaultValue={data?.username} />
        <Input
          name="password"
          label="Password"
          type="password"
          defaultValue={data?.password}
        /> */}

        {/* <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Channel
          </label>
          <select
            name="channel"
            defaultValue={data?.channel ?? 102}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value={101}>HD (101)</option>
            <option value={102}>SD (102)</option>
          </select>
        </div> */}
      </div>

      <hr className="border-gray-200" />
      
      {/* Group Selection */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            🏢 Organisasi / Grup
        </h3>
        
        {groups.length > 1 ? (
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Grup
              </label>
              <select
                  name="groupId"
                  defaultValue={data?.groupId ?? ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                  <option value="" disabled>-- Pilih Grup --</option>
                  {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                  CCTV ini akan menjadi milik grup yang dipilih.
              </p>
          </div>
        ) : groups.length === 1 ? (
          <input type="hidden" name="groupId" value={data?.groupId ?? groups[0].id} />
        ) : null}
      </div>

      <hr className="border-gray-200" />

      {/* Visibility: Only for Admin */}
      {userRole === "admin" && (
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            👁️ Visibilitas
          </h3>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="isPublic"
              defaultChecked={data?.isPublic ?? false}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-900">
              Tampilkan ke Publik (Landing Page)
            </span>
          </label>
        </div>
      )}

      {/* Shareable Link (For Everyone) */}
      {data?.slug && (
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            🔗 Link Berbagi (Shareable Link)
          </h3>
          <div className="flex gap-2">
             <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono break-all">
                {typeof window !== 'undefined' 
                    ? `${window.location.origin}${data.groupId ? `/group/${groups.find(g => g.id === data.groupId)?.slug || '...'}` : '/cctv'}/${data.slug}` 
                    : `/${data.slug}`}
             </div>
             <button
               type="button"
               onClick={() => {
                   const url = `${window.location.origin}/cctv/${data.slug}`;
                   navigator.clipboard.writeText(url);
                   alert("Link disalin!");
               }}
               className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 rounded-lg transition-colors text-sm"
             >
               Salin
             </button>
             
             <button
               type="button"
               disabled={isPending}
               onClick={handleRegenerateSlug}
               className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 rounded-lg transition-colors text-sm border border-red-200"
             >
               Regenerate
             </button>
          </div>
          <p className="text-xs text-gray-500">
             Gunakan link ini untuk membagikan CCTV kepada orang lain secara spesifik.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? mode === "create"
              ? "Menyimpan..."
              : "Mengupdate..."
            : mode === "create"
            ? "Simpan CCTV"
            : "Update CCTV"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Input Component ---------- */

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
      />
    </div>
  );
}
