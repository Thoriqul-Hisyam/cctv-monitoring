"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default function AdminShell({
  children,
  isSystemSuperAdmin = false,
  canManageUsers = false,
}: {
  children: React.ReactNode;
  isSystemSuperAdmin?: boolean;
  canManageUsers?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
          open={sidebarOpen} 
          isSystemSuperAdmin={isSystemSuperAdmin} 
          canManageUsers={canManageUsers}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
