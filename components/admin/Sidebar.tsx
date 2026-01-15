"use client";
import { LayoutDashboard, Camera, Users, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  { id: "cctv", label: "Master CCTV", icon: Camera, path: "/admin/cctv" },
  { id: "users", label: "Master User", icon: Users, path: "/admin/users" },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

export default function Sidebar({ open }: { open: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } transition-all bg-gray-900 text-white flex flex-col`}
    >
      <div className="p-4 border-b border-gray-800">
        {open && <span className="ml-3 text-xl font-bold">CCTV MINS</span>}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.path === "/admin"
              ? pathname === "/admin"
              : pathname === item.path || pathname.startsWith(item.path + "/");

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center px-4 py-3 rounded-lg ${
                isActive ? "bg-blue-600" : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              {open && <span className="ml-3">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
