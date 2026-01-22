import { getUserWithMemberships } from "@/lib/auth";
import { getGroupById } from "@/actions/group";
import GroupForm from "@/components/admin/GroupForm";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getUserWithMemberships();

  if (!user) {
    redirect("/login");
  }



  // 1. Check if System Super Admin
  const isSystemSuperAdmin = user.memberships.some(m => 
    (m.groupSlug === 'default' || m.groupId === 1) && 
    m.roleName.toLowerCase().includes('super')
  );

  // 2. Check if Group Super Admin (Any group)
  const groupSuperAdminMembership = user.memberships.find(m => 
    m.roleName.toLowerCase().includes('super')
  );
  
  const isGroupSuperAdmin = !!groupSuperAdminMembership;

  if (!isSystemSuperAdmin && !isGroupSuperAdmin) {
     return (
        <div className="p-8">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                You do not have permission to access these settings. Only Super Admins can access this page.
            </div>
        </div>
    );
  }

  // Determine target group
  let targetGroupId = 1; // Default for System Super Admin

  if (isSystemSuperAdmin) {
      targetGroupId = 1;
  } else if (isGroupSuperAdmin && groupSuperAdminMembership) {
      // If not System Super Admin, but is Group Super Admin, limit to their group
      targetGroupId = groupSuperAdminMembership.groupId;
  }

  // Fetch the group details
  const group = await getGroupById(targetGroupId);

  if (!group) {
      return (
        <div className="p-8">
            <div className="bg-amber-50 text-amber-600 p-4 rounded-xl border border-amber-100">
                Managed group (ID: {targetGroupId}) not found.
            </div>
        </div>
    );
  }

  return (
    <div className="p-6">
        <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your organization profile and configuration.</p>
        </div>
        
        <GroupForm mode="edit" data={group} isSettings={true} />
    </div>
  );
}
