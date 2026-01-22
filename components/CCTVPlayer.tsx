"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

// Custom Icon Components
const VolumeX = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
);
const Volume2 = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);
const Maximize = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
);

export default function CCTVPlayer({ streamName }: { streamName: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const lastTapRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPlaying || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    const startHLS = () => {
      setLoading(true);
      setError(null);
      
      const streamUrl = `/stream-proxy/cctv_${streamName}/index.m3u8`;

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 360,
          liveSyncDuration: 300,
          liveMaxLatencyDuration: 360,
          debug: false,
          // Force 720p preference if available, or just standard adaptive logic
          // startLevel: -1 (auto) is usually best unless strict requirement.
          // Requirement: "Force the default video resolution to 720p".
          // If variants exist, we can try to pick level with height 720.
          // But without manifest loaded, we can't know index.
          // We can listen to MANIFEST_PARSED and set currentLevel/startLevel then.
          // Or use capLevelToPlayerSize causing it to pick best fit.
          // I will attempt to check levels in MANIFEST_PARSED.
          manifestLoadingMaxRetry: Infinity,
          levelLoadingMaxRetry: Infinity,
          fragLoadingMaxRetry: 10,
          nudgeMaxRetry: 5,
          nudgeOffset: 0.1,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });

        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            // Attempt to find 720p level
            const levels = data.levels;
            const level720Index = levels.findIndex(l => l.height === 720);
            if (level720Index !== -1) {
                hls!.startLevel = level720Index;
            }
            // else leave auto

            video.play().catch((e) => {
                console.error("Play failed", e);
                setIsMuted(true);
            });
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
            setLoading(false);
            setError(null);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
             // ... error handling ... 
             // (Shortened for brevity matching original logic mostly)
            console.error("Fatal HLS error:", data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                setError("Gagal memuat siaran");
                hls?.destroy();
                setTimeout(() => startHLS(), 2000);
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play().catch(() => setIsMuted(true));
        setLoading(false);
      }
    };

    startHLS();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
      }
    };
  }, [streamName, isPlaying]);

  const handlePlay = () => {
      setIsPlaying(true);
      setIsMuted(false);
  };

  const handleStop = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsPlaying(false);
      setLoading(false);
      setError(null);
      setZoom(1);
  };

  const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (videoRef.current) {
          videoRef.current.muted = !videoRef.current.muted;
          setIsMuted(videoRef.current.muted);
      }
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (containerRef.current) {
          if (!document.fullscreenElement) {
              containerRef.current.requestFullscreen().catch(err => console.log(err));
          } else {
              document.exitFullscreen();
          }
      }
  };

  const handleContainerClick = () => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          toggleFullscreen();
      } else {
           // Single tap logic - show/hide controls
           setShowControls(prev => !prev);
           
           if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
           controlsTimeoutRef.current = setTimeout(() => {
               setShowControls(false);
           }, 3000);
      }
      lastTapRef.current = now;
  };

  const adjustZoom = (e: React.MouseEvent, factor: number) => {
      e.stopPropagation();
      setZoom(prev => Math.min(Math.max(1, prev + factor), 3)); // Limit zoom 1x to 3x
  };

  return (
    <div 
      ref={containerRef}
      className="w-full aspect-video bg-black overflow-hidden relative group select-none"
      onClick={handleContainerClick}
      onMouseLeave={() => setShowControls(false)}
      onMouseEnter={() => setShowControls(true)}
    >
      {/* Loading Overlay */}
      {loading && isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-blue-500 mb-3"></div>
            <p className="text-xs font-bold text-white tracking-wider uppercase">Memuat Siaran...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && isPlaying && !loading && (
           <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20 backdrop-blur-sm pointer-events-auto">
             <div className="flex flex-col items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                 </div>
                 <p className="text-xs font-bold text-white uppercase tracking-tight">{error}</p>
                 <button onClick={(e) => { e.stopPropagation(); hlsRef.current?.startLoad(); setError(null); setLoading(true); }} className="text-xs font-bold text-blue-400 border border-blue-400/30 px-4 py-1.5 rounded-full hover:bg-blue-400/10 transition-colors uppercase tracking-widest">Coba Lagi</button>
             </div>
          </div>
      )}

      {/* Start Overlay */}
      {!isPlaying && (
           <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-20 cursor-pointer group/play overflow-hidden" onClick={handlePlay}>
               <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white"></div>
               <div className="relative flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center group-hover/play:scale-110 group-hover/play:shadow-2xl group-hover/play:shadow-blue-500/40 transition-all duration-300 shadow-xl shadow-blue-500/20">
                        <svg className="w-10 h-10 text-white ml-1.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                   <p className="text-xs font-black text-blue-600 tracking-[0.2em] uppercase">Tonton Live</p>
               </div>
               
               <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-2xl"></div>
               <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 blur-2xl"></div>
          </div>
      )}

      <video
        ref={videoRef}
        muted={isMuted}
        playsInline
        className="w-full h-full object-contain pointer-events-none transition-transform duration-200 ease-out" 
        style={{ transform: `scale(${zoom})` }}
      />

      {/* Controls Overlay */}
      {isPlaying && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-4">
                 <button onClick={handleStop} className="text-white hover:text-red-400 transition hover:scale-110 active:scale-95 flex items-center gap-2">
                     <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-500/20 hover:border-red-500/40">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                     </div>
                  </button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500 border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                     </span>
                     <span className="text-[10px] font-black text-white tracking-widest uppercase">LIVE</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Zoom Controls */}
                <div className="flex items-center bg-white/10 backdrop-blur rounded-lg border border-white/20 overflow-hidden">
                    <button onClick={(e) => adjustZoom(e, -0.2)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20">-</button>
                    <span className="text-[10px] font-bold text-white w-8 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={(e) => adjustZoom(e, 0.2)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20">+</button>
                </div>

                <button onClick={toggleMute} className="text-white hover:text-blue-400 transition hover:scale-110 active:scale-95">
                    {isMuted ? <VolumeX /> : <Volume2 />}
                </button>
                <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition hover:scale-110 active:scale-95">
                    <Maximize />
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
