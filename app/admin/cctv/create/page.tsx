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
  const isSuperAdmin = user.memberships.some(m => 
        m.roleName.toLowerCase().includes('admin') || 
        m.roleName.toLowerCase().includes('super')
  );
  const userRole = isSuperAdmin ? "admin" : "user";
  
  // Get Available Groups
  let groups: { id: number; name: string }[] = [];
  if (isSuperAdmin) {
      groups = await prisma.group.findMany({ select: { id: true, name: true } });
  } else {
      groups = user.memberships.map(m => ({ id: m.groupId, name: m.groupName || `Group ${m.groupId}` }));
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
