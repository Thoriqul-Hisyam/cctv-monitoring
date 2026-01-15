export default function CCTVTable() {
  return (
    <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-700">
          <tr>
            <th className="p-2 text-left">Nama</th>
            <th className="p-2">RT/RW</th>
            <th className="p-2">Wilayah</th>
            <th className="p-2">Kecamatan</th>
            <th className="p-2">Kota</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-zinc-700">
            <td className="p-2">Simpang Utama</td>
            <td className="p-2 text-center">05 / 02</td>
            <td className="p-2 text-center">Merdeka</td>
            <td className="p-2 text-center">Sukamaju</td>
            <td className="p-2 text-center">Bandung</td>
            <td className="p-2 text-center text-green-500">Aktif</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
