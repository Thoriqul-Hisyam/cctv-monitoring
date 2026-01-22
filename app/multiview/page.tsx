"use client";

import { useSearchParams, useRouter } from "next/navigation";
import  {Suspense} from "react";
import CCTVPlayer from "@/components/CCTVPlayer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function MultiViewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ids = searchParams.get("ids")?.split(",") || [];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-800 hover:text-white">
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg">Multi-View Monitor</h1>
                </div>
                <div className="text-xs font-mono text-slate-400">
                    {ids.length} Screen(s) Active
                </div>
            </div>

            {/* Grid */}
            <div className={`p-4 grid gap-4 h-[calc(100vh-64px)] overflow-y-auto
                ${ids.length === 1 ? 'grid-cols-1' : ''}
                ${ids.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
                ${ids.length >= 3 && ids.length <= 4 ? 'grid-cols-2' : ''}
                ${ids.length > 4 && ids.length <= 9 ? 'grid-cols-3' : ''}
                ${ids.length > 9 ? 'grid-cols-4' : ''}
            `}>
                {ids.map((id) => (
                    <div key={id} className="relative bg-black rounded-xl overflow-hidden border border-slate-800 flex flex-col group">
                        <div className="flex-1 relative">
                            <CCTVPlayer streamName={id} />
                        </div>
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono font-bold">
                            CAM {id}
                        </div>
                    </div>
                ))}
                
                {ids.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center text-slate-500 h-full">
                         <p>No camera selected</p>
                         <Link href="/">
                            <Button variant="link" className="text-blue-400">Back to Home</Button>
                         </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MultiViewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
            <MultiViewContent />
        </Suspense>
    );
}
