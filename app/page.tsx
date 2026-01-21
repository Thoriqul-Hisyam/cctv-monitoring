import { getCctvs } from "@/actions/cctv";
import CCTVCard from "@/components/CCTVCard";
import { type Cctv } from "@prisma/client";

export const dynamic = "force-dynamic"; // Ensure fresh data

export default async function Home() {
  const cctvs = await getCctvs();

  // Grouping Logic: Kota -> Kecamatan -> Cctv[]
  const groupedCctvs = cctvs.reduce((acc, cctv) => {
    const kota = cctv.kota || "Lainnya";
    const kecamatan = cctv.kecamatan || "Umum";

    if (!acc[kota]) acc[kota] = {};
    if (!acc[kota][kecamatan]) acc[kota][kecamatan] = [];

    acc[kota][kecamatan].push(cctv);
    return acc;
  }, {} as Record<string, Record<string, Cctv[]>>);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 pb-20">
      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                 </div>
                 <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900">MINS CCTV</h1>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">CCTV Masyarakat</p>
                 </div>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-blue-700 font-semibold">{cctvs.length} Kamera Online</span>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        {Object.entries(groupedCctvs).map(([kota, kecamatans]) => (
          <div key={kota} className="relative">
             {/* Kota Header */}
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">{kota}</h2>
                <div className="h-1 flex-1 bg-gradient-to-r from-blue-100 to-transparent rounded-full"></div>
            </div>

            <div className="space-y-12 pl-2">
              {Object.entries(kecamatans).map(([kecamatan, locationCctvs]) => (
                <div key={kecamatan} className="group/kecamatan">
                   {/* Kecamatan Sub-header */}
                   <div className="flex items-center gap-3 mb-5">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover/kecamatan:text-blue-600 transition-colors">
                            {kecamatan}
                        </h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                            {locationCctvs.length} UNIT
                        </span>
                   </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locationCctvs.map((cctv) => (
                      <CCTVCard
                        key={cctv.id}
                        title={cctv.name || `CCTV ${cctv.id}`}
                        streamName={String(cctv.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {cctvs.length === 0 && (
             <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <p className="font-medium">Belum ada kamera CCTV aktif.</p>
             </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 mt-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </div>
                    <span className="font-bold text-slate-900">MINS CCTV</span>
                </div>
                <p className="text-center max-w-2xl">© 2026 MINS. Tayangan CCTV ini bersifat publik untuk keamanan bersama. Pantau lingkungan kita untuk masa depan yang lebih aman.</p>
                <div className="flex items-center gap-8 font-medium">
                    <span className="hover:text-blue-600 cursor-pointer transition-colors">Tentang Kami</span>
                    <span className="hover:text-blue-600 cursor-pointer transition-colors">Kebijakan Privasi</span>
                    <span className="hover:text-blue-600 cursor-pointer transition-colors">Bantuan</span>
                </div>
            </div>
      </footer>
    </main>
  );
}
