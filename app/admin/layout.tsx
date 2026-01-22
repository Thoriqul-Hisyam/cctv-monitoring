import { ReactNode } from "react";

export const dynamic = "force-dynamic";

import { getUserWithMemberships } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUserWithMemberships();

  if (!user) {
    redirect("/login");
  }

  // Check if System Super Admin (Default Group Super Admin)
  const isSystemSuperAdmin = user.memberships.some(m => 
      (m.groupSlug === 'default' || m.groupId === 1) && 
      m.roleName.toLowerCase().includes('super')
  );

  // Check if Group Super Admin (Super Admin of ANY group)
  const isGroupSuperAdmin = user.memberships.some(m => 
      m.roleName.toLowerCase().includes('super')
  );

  // Check if User manager (System Super OR Any Group Admin) - Operator/Viewer CANNOT manage users
  const canManageUsers = isSystemSuperAdmin || user.memberships.some(m => 
      m.roleName.toLowerCase().includes('admin')
  );

  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AdminShell 
            isSystemSuperAdmin={isSystemSuperAdmin}
            isGroupSuperAdmin={isGroupSuperAdmin}
            canManageUsers={canManageUsers}
        >
            {children}
        </AdminShell>
      </body>
    </html>
  );
}
