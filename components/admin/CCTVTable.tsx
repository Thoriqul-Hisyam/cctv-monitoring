"use client";

import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteCctv } from "@/actions/cctv";

type CCTV = {
  id: number;
  name: string;
  rt: string;
  rw: string;
  wilayah: string;
  kecamatan: string;
  kota: string;
  isActive: boolean;
};

export default function CCTVTable({ data }: { data: CCTV[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEdit = (id: number) => {
    router.push(`/admin/cctv/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus CCTV ini?")) {
      startTransition(async () => {
        try {
          await deleteCctv(id);
        } catch (error) {
          alert("Gagal menghapus data");
          console.error(error);
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-gray-800">Daftar CCTV</h2>
        <button
          onClick={() => router.push("/admin/cctv/create")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Tambah CCTV
        </button>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">Nama</th>
            <th className="px-4 py-3 text-center">RT / RW</th>
            <th className="px-4 py-3 text-center">Wilayah</th>
            <th className="px-4 py-3 text-center">Kecamatan</th>
            <th className="px-4 py-3 text-center">Kota</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                Belum ada data CCTV
              </td>
            </tr>
          )}

          {data.map((cctv) => (
            <tr key={cctv.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-900">
                {cctv.name}
              </td>

              <td className="px-4 py-3 text-center">
                {cctv.rt} / {cctv.rw}
              </td>

              <td className="px-4 py-3 text-center">{cctv.wilayah}</td>
              <td className="px-4 py-3 text-center">{cctv.kecamatan}</td>
              <td className="px-4 py-3 text-center">{cctv.kota}</td>

              <td className="px-4 py-3 text-center">
                {cctv.isActive ? (
                  <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-red-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Nonaktif
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleEdit(cctv.id)}
                    className="text-gray-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(cctv.id)} // Panggil fungsi handleDelete
                    className="text-gray-500 hover:text-red-600 disabled:text-gray-300"
                    title="Hapus"
                    disabled={isPending} // Disable saat proses hapus
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
