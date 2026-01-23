"use client";
import { logout } from "@/lib/auth";
import { Menu, X, Bell, LogOut } from "lucide-react";

export default function Header({
  sidebarOpen,
  toggleSidebar,
}: {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex justify-between items-center supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center gap-4">
        
        <div className="block">
            <h2 className="text-sm font-bold text-slate-800">Panel Administrasi</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Sistem Monitoring</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-bold"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </form>
      </div>
    </header>
  );
}
