import Link from "next/link";
import CCTVPlayer from "./CCTVPlayer";

export default function CCTVCard({
  title,
  streamName,
  slug,
  groupSlug,
}: {
  title: string;
  streamName: string;
  slug?: string | null;
  groupSlug?: string | null;
}) {
  const href = slug 
    ? groupSlug 
      ? `/group/${groupSlug}/${slug}`
      : `/cctv/${slug}` 
    : undefined;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-xl hover:border-blue-300">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-5 bg-gradient-to-b from-white/95 to-transparent opacity-100 transition-opacity pointer-events-none">
        <div className="flex items-center justify-between">
           
             <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 tracking-wider">LIVE</span>
            </div>
            
            {/* Share Link Icon */}
            {href && (
              <Link href={href} className="pointer-events-auto p-1.5 bg-white/50 backdrop-blur rounded-full hover:bg-white text-slate-500 hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </Link>
            )}
        </div>
      </div>

      {/* Video Container */}
      <div className="aspect-video bg-slate-900 relative">
        {streamName ? (
          <CCTVPlayer streamName={streamName} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-50">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Offline</span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-4 bg-white">
        {href ? (
            <Link href={href} className="block">
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {title}
                </h4>
            </Link>
        ) : (
            <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {title}
            </h4>
        )}
      </div>
      
      {/* Bottom info strip */}
      <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}
