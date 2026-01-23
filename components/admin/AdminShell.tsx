"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import MobileNav from "@/components/admin/MobileNav";

export default function AdminShell({
  children,
  isSystemSuperAdmin = false,
  isGroupSuperAdmin = false,
  canManageUsers = false,
}: {
  children: React.ReactNode;
  isSystemSuperAdmin?: boolean;
  isGroupSuperAdmin?: boolean;
  canManageUsers?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
          open={sidebarOpen} 
          isSystemSuperAdmin={isSystemSuperAdmin} 
          isGroupSuperAdmin={isGroupSuperAdmin}
          canManageUsers={canManageUsers}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-8 safe-pt pb-20 lg:pb-8 flex flex-col">
          {children}
        </main>
      </div>

      <MobileNav 
        isSystemSuperAdmin={isSystemSuperAdmin}
        isGroupSuperAdmin={isGroupSuperAdmin}
        canManageUsers={canManageUsers}
      />
    </div>
  );
}
