import { getGroupMembers } from "@/actions/membership";
import { getUsers } from "@/actions/user";
import GroupMembersClient from "@/components/admin/GroupMembers";
import { notFound } from "next/navigation";

export default async function MembersPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const groupId = Number(resolvedParams.id);
    
    // Parallel fetch
    const [group, allUsers] = await Promise.all([
        getGroupMembers(groupId),
        getUsers() // Warning: fetching ALL users might be heavy in prod, implemented for MVP
    ]);

    if(!group) return notFound();

    // Filter potential "new members" (users not yet in this group)
    // Actually simpler to let the client component or select box filter?
    // Let's pass all users for now or filter.
    // Filter users who are NOT in the group already to keep dropdown clean?
    
    const memberIds = new Set(group.members.map((m: any) => m.user.id));
    const availableUsers = allUsers.filter((u: any) => !memberIds.has(u.id));

    return (
        <div className="max-w-4xl mx-auto py-6">
            <GroupMembersClient group={group} availableUsers={availableUsers} />
        </div>
    );
}
