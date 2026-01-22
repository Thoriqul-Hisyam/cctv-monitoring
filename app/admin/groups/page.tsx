import { getGroups } from "@/actions/group";
import GroupTable from "@/components/admin/GroupTable";
import { getUserWithMemberships } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
    const groups = await getGroups();
    const currentUser = await getUserWithMemberships();
    
    // Check if System Super Admin (Default Group Super Admin)
    const canCreate = currentUser?.memberships.some(m => 
        (m.groupSlug === 'default' || m.groupId === 1) && 
        m.roleName.toLowerCase().includes('super')
    ) ?? false;

    return <GroupTable data={groups} canCreate={canCreate} />;
}
