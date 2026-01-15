"use client";

import { useTransition } from "react";
import { createCctv, updateCctv } from "@/actions/cctv";

type Props = {
  mode: "create" | "edit";
  data?: any;
};

export default function CctvForm({ mode, data }: Props) {
  const [isPending, startTransition] = useTransition();

  const action = async (formData: FormData) => {
    startTransition(async () => {
      if (mode === "create") {
        await createCctv(formData);
      } else {
        await updateCctv(data.id, formData);
      }
    });
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

      {/* Status Section */}
      {/* <div className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          ⚙️ Status
        </h3>

        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={data?.isActive ?? true}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-900">CCTV Aktif</span>
        </label>
      </div> */}

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
