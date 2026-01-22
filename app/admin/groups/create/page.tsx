import GroupForm from "@/components/admin/GroupForm";
import { getUserWithMemberships } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateGroupPage() {
    const currentUser = await getUserWithMemberships();
    
    // Strict Access Control: Only System Super Admin
    const canCreate = currentUser?.memberships.some(m => 
        (m.groupSlug === 'default' || m.groupId === 1) && 
        m.roleName.toLowerCase().includes('super')
    ) ?? false;

    if (!canCreate) {
        redirect("/admin/groups");
    }

    return <GroupForm mode="create" />;
}
