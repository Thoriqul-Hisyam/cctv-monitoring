import { getUserWithMemberships } from "@/lib/auth";
import CctvForm from "@/components/admin/CCTVForm";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CreatePage() {
  const user = await getUserWithMemberships();
  
  if (!user) {
    redirect("/login");
  }

  // Determine User Role (Admin global check)
  const isAnyAdmin = user.memberships.some(m => 
        m.roleName.toLowerCase().includes('admin') || 
        m.roleName.toLowerCase().includes('super')
  );
  const userRole = isAnyAdmin ? "admin" : "user";
  
  // 1. System Super Admin check for Group Selection
  const isSystemSuperAdmin = user.memberships.some(m => 
        (m.groupSlug === 'default' || m.groupId === 1) && 
        m.roleName.toLowerCase().includes('super')
  );

  // Get Available Groups
  let groups: { id: number; name: string; slug: string }[] = [];
  if (isSystemSuperAdmin) {
      groups = await prisma.group.findMany({ select: { id: true, name: true, slug: true } });
  } else {
      // Get all groups where user has admin or operator role
      const accessibleMemberships = user.memberships.filter(m => 
          m.roleName.toLowerCase().includes('admin') || 
          m.roleName.toLowerCase().includes('operator')
      );
      
      const groupIds = accessibleMemberships.map(m => m.groupId);
      if (groupIds.length > 0) {
          groups = await prisma.group.findMany({
              where: { id: { in: groupIds } },
              select: { id: true, name: true, slug: true }
          });
      }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah CCTV</h1>
        <p className="text-gray-600">Buat data CCTV baru.</p>
      </div>

      <CctvForm mode="create" userRole={userRole} groups={groups} />
    </div>
  );
}
