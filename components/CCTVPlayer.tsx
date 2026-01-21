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
  const [loading, setLoading] = useState(false); // Valid definition
  const [isPlaying, setIsPlaying] = useState(false); // Track play state
  const [isMuted, setIsMuted] = useState(false); // Default unmuted if user clicks play, but let's see. AutoPlay usually requires mute. Manual play doesn't.

  // Low latency mode - effectively live
  
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
          lowLatencyMode: false, // Delay requested, disable low latency
          backBufferLength: 360, // 6 minutes back buffer
          liveSyncDuration: 300, // 5 minutes (300 seconds) delay constant
          liveMaxLatencyDuration: 360, // Max 6 minutes
          debug: false,
          // Advanced recovery config
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

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
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
            console.error("Fatal HLS error:", data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Fatal network error, trying to recover...");
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Fatal media error, trying to recover...");
                hls?.recoverMediaError();
                break;
              default:
                console.log("Unrecoverable error, destroying and restarting...");
                setError("Gagal memuat siaran (Fatal)");
                hls?.destroy();
                // Short delay before restart
                setTimeout(() => startHLS(), 2000);
                break;
            }
          } else {
             // Non-fatal errors
             if (data.details === 'bufferStalledError') {
                 // Nudge slightly more if stalled
                 if (!video.paused) {
                    video.currentTime = video.currentTime + 0.5;
                    video.play().catch(() => {});
                 }
             }
             if (data.details === 'levelLoadingTimeOutError' || data.details === 'manifestLoadingTimeOutError') {
                console.warn("Loading timeout, retrying...");
                hls?.startLoad();
             }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        video.src = streamUrl;
        video.play().catch(() => setIsMuted(true));
        setLoading(false); // Native often doesn't give fine-grained loading events easily without helpers, but this is ok
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
          videoRef.current.removeAttribute('src'); // Stop native HLS
          videoRef.current.load();
      }
    };
  }, [streamName, isPlaying]);

  const handlePlay = () => {
      setIsPlaying(true);
      setIsMuted(false); // Unmute on manual play
  };

  const handleStop = () => {
      setIsPlaying(false);
      setLoading(false);
      setError(null);
  };

  const toggleMute = () => {
      if (videoRef.current) {
          videoRef.current.muted = !videoRef.current.muted;
          setIsMuted(videoRef.current.muted);
      }
  };

  const toggleFullscreen = () => {
      if (containerRef.current) {
          if (!document.fullscreenElement) {
              containerRef.current.requestFullscreen().catch(err => console.log(err));
          } else {
              document.exitFullscreen();
          }
      }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full aspect-video bg-black overflow-hidden relative group"
    >
      {/* Loading Overlay */}
      {loading && isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-blue-500 mb-3"></div>
            <p className="text-xs font-bold text-white tracking-wider uppercase">Memuat Siaran...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && isPlaying && !loading && (
           <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20 backdrop-blur-sm">
             <div className="flex flex-col items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                 </div>
                 <p className="text-xs font-bold text-white uppercase tracking-tight">{error}</p>
                 <button onClick={() => { hlsRef.current?.startLoad(); setError(null); setLoading(true); }} className="text-xs font-bold text-blue-400 border border-blue-400/30 px-4 py-1.5 rounded-full hover:bg-blue-400/10 transition-colors uppercase tracking-widest">Coba Lagi</button>
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
               
               {/* Decorative background elements */}
               <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-2xl"></div>
               <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 blur-2xl"></div>
          </div>
      )}

      <video
        ref={videoRef}
        muted={isMuted}
        playsInline
        className="w-full h-full object-contain pointer-events-none" 
      />

      {/* Custom Minimal Controls Overlay */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between z-30">
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
