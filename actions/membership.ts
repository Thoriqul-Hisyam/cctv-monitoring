"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserWithMemberships } from "@/lib/auth";

async function requireAdmin() {
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");
    
    // Check if super admin or admin of ANY group? 
    // Ideally check if admin of the specific group.
    // For MVP, we check global admin or super admin role presence.
    const isAdmin = currentUser.memberships.some(m => 
        m.roleName.toLowerCase().includes('admin') || 
        m.roleName.toLowerCase().includes('super')
    );

    if (!isAdmin) throw new Error("Forbidden");
    return currentUser;
}

/* ======================
   ADD MEMBER
====================== */
export async function addMember(formData: FormData) {
    await requireAdmin();

    const groupId = Number(formData.get("groupId"));
    const userId = Number(formData.get("userId"));
    const roleSlug = formData.get("roleSlug") as string;

    if (!groupId || !userId || !roleSlug) throw new Error("Data tidak lengkap");

    // Find Role ID
    const role = await prisma.role.findFirst({
        where: { 
            groupId, 
            slug: roleSlug 
        }
    });

    if (!role) throw new Error("Role tidak ditemukan di grup ini");

    // Check if already member
    const existing = await prisma.userGroup.findUnique({
        where: {
            userId_groupId: { userId, groupId }
        }
    });

    if (existing) throw new Error("User sudah menjadi anggota grup ini");

    await prisma.userGroup.create({
        data: {
            userId,
            groupId,
            roleId: role.id
        }
    });

    revalidatePath(`/admin/groups/${groupId}/members`);
    revalidatePath("/admin/users");
}

/* ======================
   REMOVE MEMBER
====================== */
export async function removeMember(groupId: number, userId: number) {
    await requireAdmin();

    await prisma.userGroup.delete({
        where: {
            userId_groupId: { userId, groupId }
        }
    });

    revalidatePath(`/admin/groups/${groupId}/members`);
    revalidatePath("/admin/users");
}

/* ======================
   GET GROUP MEMBERS
====================== */
export async function getGroupMembers(groupId: number) {
    // Permission: Admin or Member of group?
    // For admin panel, we require admin.
    await requireAdmin();

    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            members: {
                include: {
                    user: true,
                    role: true
                },
                orderBy: { joinedAt: 'desc' }
            },
            roles: true // Need roles for "Edit" or "Add" dropdown
        }
    });

    if (!group) throw new Error("Grup tidak ditemukan");

    return group;
}
