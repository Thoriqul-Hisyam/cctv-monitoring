// "use client";

// import { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";

// export default function CCTVPlayer({ streamName }: { streamName: string }) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const hlsRef = useRef<Hls | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [streamInfo, setStreamInfo] = useState<string>("");
//   const [hlsUrl, setHlsUrl] = useState<string>("");

//   useEffect(() => {
//     if (!videoRef.current) return;

//     const video = videoRef.current;
//     let hls: Hls | null = null;
//     let retryTimeout: NodeJS.Timeout;

//     const startHLS = () => {
//       setLoading(true);
//       setError(null);
//       setStreamInfo("Initializing...");

//       // Build HLS URL - gunakan localhost untuk testing dulu
//       const streamUrl = `http://localhost:8888/cctv_${streamName}/index.m3u8`;
//       setHlsUrl(streamUrl);

//       console.log("🎥 Loading HLS from:", streamUrl);

//       // Check if HLS is supported
//       if (Hls.isSupported()) {
//         console.log("✅ HLS.js is supported");

//         hls = new Hls({
//           enableWorker: true,
//           lowLatencyMode: true,
//           backBufferLength: 90,
//           debug: false, // Set true untuk debugging
//         });

//         hlsRef.current = hls;

//         // Load source
//         hls.loadSource(streamUrl);
//         hls.attachMedia(video);

//         // Manifest parsed
//         hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
//           console.log("✅ Manifest parsed:", data);
//           setStreamInfo("Starting playback...");

//           video
//             .play()
//             .then(() => {
//               console.log("✅ Video playing");
//               setLoading(false);
//               setStreamInfo("Live");
//             })
//             .catch((err) => {
//               console.warn("⚠️ Autoplay blocked:", err);
//               setStreamInfo("Click to play");
//               setLoading(false);
//             });
//         });

//         // Fragment loaded
//         hls.on(Hls.Events.FRAG_LOADED, () => {
//           if (loading) {
//             console.log("✅ First fragment loaded");
//             setLoading(false);
//             setStreamInfo("Live");
//           }
//         });

//         // Error handling
//         hls.on(Hls.Events.ERROR, (event, data) => {
//           console.error("❌ HLS error event:", event);
//           console.error("❌ HLS error data:", data);
//           console.error("❌ Error type:", data.type);
//           console.error("❌ Error details:", data.details);
//           console.error("❌ Fatal:", data.fatal);

//           if (data.fatal) {
//             switch (data.type) {
//               case Hls.ErrorTypes.NETWORK_ERROR:
//                 console.log("🔄 Network error, attempting recovery...");
//                 setError(
//                   `Network error: ${data.details}. Retrying in 3 seconds...`
//                 );

//                 // Retry after 3 seconds
//                 retryTimeout = setTimeout(() => {
//                   console.log("🔄 Retrying HLS connection...");
//                   hls?.startLoad();
//                 }, 3000);
//                 break;

//               case Hls.ErrorTypes.MEDIA_ERROR:
//                 console.log("🔄 Media error, attempting recovery...");
//                 setError("Media error. Trying to recover...");
//                 hls?.recoverMediaError();
//                 break;

//               default:
//                 console.log("❌ Fatal error, cannot recover");
//                 setError(
//                   `Fatal error: ${
//                     data.details || "Unknown error"
//                   }. Stream may not be available.`
//                 );
//                 setLoading(false);
//                 hls?.destroy();
//                 break;
//             }
//           } else {
//             // Non-fatal error
//             console.warn("⚠️ Non-fatal error:", data.details);
//           }
//         });

//         // Level loaded
//         hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
//           console.log("✅ Level loaded:", data.details);
//         });
//       } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//         // Native HLS support (Safari)
//         console.log("✅ Using native HLS support");
//         video.src = streamUrl;

//         video.addEventListener("loadedmetadata", () => {
//           console.log("✅ Metadata loaded");
//           setStreamInfo("Starting playback...");
//           video
//             .play()
//             .then(() => {
//               console.log("✅ Playing");
//               setLoading(false);
//               setStreamInfo("Live");
//             })
//             .catch((err) => {
//               console.warn("⚠️ Autoplay blocked:", err);
//               setStreamInfo("Click to play");
//               setLoading(false);
//             });
//         });

//         video.addEventListener("error", (e) => {
//           console.error("❌ Video error:", e);
//           console.error("❌ Video error code:", video.error?.code);
//           console.error("❌ Video error message:", video.error?.message);

//           let errorMsg = "Failed to load stream";
//           if (video.error) {
//             switch (video.error.code) {
//               case MediaError.MEDIA_ERR_NETWORK:
//                 errorMsg = "Network error loading stream";
//                 break;
//               case MediaError.MEDIA_ERR_DECODE:
//                 errorMsg = "Error decoding stream";
//                 break;
//               case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
//                 errorMsg = "Stream format not supported";
//                 break;
//               default:
//                 errorMsg = video.error.message || "Unknown error";
//             }
//           }

//           setError(errorMsg);
//           setLoading(false);
//         });
//       } else {
//         console.error("❌ HLS is not supported in this browser");
//         setError("HLS is not supported in this browser");
//         setLoading(false);
//       }
//     };

//     // Add small delay before starting
//     const initTimeout = setTimeout(() => {
//       startHLS();
//     }, 100);

//     // Cleanup
//     return () => {
//       clearTimeout(initTimeout);
//       clearTimeout(retryTimeout);

//       if (hlsRef.current) {
//         console.log("🧹 Cleaning up HLS");
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }

//       if (videoRef.current) {
//         videoRef.current.removeAttribute("src");
//         videoRef.current.load();
//       }
//     };
//   }, [streamName]);

//   if (error) {
//     return (
//       <div className="w-full aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center">
//         <div className="text-center p-4 max-w-md">
//           <p className="text-red-500 mb-2">⚠️ Stream Error</p>
//           <p className="text-sm text-gray-400 mb-4">{error}</p>

//           <div className="flex gap-2 justify-center mb-4">
//             <button
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
//             >
//               Retry
//             </button>
//             <a
//               href={hlsUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
//             >
//               Test URL
//             </a>
//           </div>

//           <details className="text-left bg-zinc-900 rounded p-3">
//             <summary className="text-xs text-gray-500 cursor-pointer mb-2">
//               Debug Info
//             </summary>
//             <div className="text-xs text-gray-400 space-y-2">
//               <div>
//                 <strong>Stream URL:</strong>
//                 <br />
//                 <code className="text-blue-400 break-all">{hlsUrl}</code>
//               </div>
//               <div>
//                 <strong>Stream Name:</strong> cctv_{streamName}
//               </div>
//               <div>
//                 <strong>HLS Supported:</strong>{" "}
//                 {Hls.isSupported() ? "Yes" : "No"}
//               </div>
//             </div>
//           </details>

//           <details className="text-left bg-zinc-900 rounded p-3 mt-2">
//             <summary className="text-xs text-gray-500 cursor-pointer mb-2">
//               Troubleshooting Steps
//             </summary>
//             <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
//               <li>
//                 Check MediaMTX is running:
//                 <pre className="text-[10px] bg-zinc-800 p-2 mt-1 rounded">
//                   .\mediamtx.exe
//                 </pre>
//               </li>
//               <li>
//                 Test HLS endpoint directly:
//                 <br />
//                 <a
//                   href={hlsUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-400 text-[10px] break-all hover:underline"
//                 >
//                   {hlsUrl}
//                 </a>
//               </li>
//               <li>
//                 Check MediaMTX config:
//                 <pre className="text-[10px] bg-zinc-800 p-2 mt-1 rounded overflow-x-auto">
//                   {`hls: yes
// hlsAddress: :8888
// hlsAlwaysRemux: yes`}
//                 </pre>
//               </li>
//               <li>Verify stream source is available and publishing</li>
//               <li>Check browser console for detailed errors (F12)</li>
//             </ol>
//           </details>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full aspect-video bg-black rounded-md overflow-hidden relative">
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
//             <p className="text-white text-sm">Loading stream...</p>
//             <p className="text-gray-400 text-xs mt-1">{streamInfo}</p>
//             <p className="text-gray-500 text-[10px] mt-2 max-w-xs break-all">
//               {hlsUrl}
//             </p>
//           </div>
//         </div>
//       )}
//       {!loading && streamInfo && (
//         <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-[10px] text-green-400 z-20 flex items-center gap-1">
//           <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
//           {streamInfo}
//         </div>
//       )}
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         controls
//         className="w-full h-full object-cover"
//       />
//     </div>
//   );
// }
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
      console.log("🎥 Loading HLS from:", streamUrl);

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
          console.warn(`HLS Error: ${data.details}`, data);
          
          if (data.fatal) {
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
                hls?.destroy();
                setTimeout(() => startHLS(), 1000);
                break;
            }
          } else {
             // Non-fatal errors
             if (data.details === 'bufferStalledError') {
                 console.log("Buffer stalled, nudging video...");
                 // Small nudge to help stuck buffer
                 if (video.paused) video.play().catch(() => {});
                 else video.currentTime += 0.1;
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
      className="w-full aspect-video bg-black rounded-md overflow-hidden relative group"
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
