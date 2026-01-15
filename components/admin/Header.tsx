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
    <header className="bg-white border-b px-6 py-4 flex justify-between">
      <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded">
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-gray-100 rounded">
          <Bell />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <form action={logout}>
          <button
            type="submit"
            className="p-2 text-red-600 hover:bg-gray-100 rounded"
          >
            <LogOut />
          </button>
        </form>
      </div>
    </header>
  );
}
