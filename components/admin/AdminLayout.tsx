"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Dashboard from "./Dashboard";
import CCTVTable from "./CCTVTable";
import UserTable from "./UserTable";
import { useRouter } from "next/navigation";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const router = useRouter();

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <Dashboard />;
      case "cctv":
        router.push("/admin/cctv");
        return null;
      case "users":
        return <UserTable />;
      case "settings":
        return (
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-600">Pengaturan sistem</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        open={sidebarOpen}
        active={activeMenu}
        onChange={setActiveMenu}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
