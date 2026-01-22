"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserWithMemberships } from "@/lib/auth";

/* ======================
   HELPERS
====================== */
/* ======================
   HELPERS
====================== */
const DEFAULT_ROLES = [
  { name: "Super Admin", slug: "super_admin", isSystem: true, description: "Full access to group resources" },
  { name: "Admin", slug: "admin", isSystem: false, description: "Manage CCTVs and Users" },
  { name: "Operator", slug: "operator", isSystem: false, description: "Manage CCTVs only" },
  { name: "Viewer", slug: "viewer", isSystem: false, description: "View access only" },
];

// Strictly checks for System Super Admin (e.g. Thoriq)
// Must have 'super_admin' role in the System Group (ID: 1, slug: 'default')
async function requireSuperAdmin() {
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");
    
    // Find membership in Default Group (we assume ID 1 or slug 'default')
    // Ideally we query the default group, but let's check slug 'default' if preserved.
    // Or just check if they have 'super_admin' in a group with slug 'default'.
    
    const isSystemSuperAdmin = currentUser.memberships.some(m => 
        (m.groupSlug === 'default' || m.groupId === 1) && 
        m.roleName.toLowerCase().includes('super')
    );

    if (!isSystemSuperAdmin) throw new Error("Forbidden: Only System Super Admin can perform this action");
    return currentUser;
}

// Checks for Admin access to a specific group (or Super Admin)
async function requireGroupAdmin(groupId?: number) {
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");

    const isSuper = currentUser.memberships.some(m => 
        m.roleName.toLowerCase().includes('super')
    );

    if (isSuper) return currentUser;

    if (!groupId) throw new Error("Forbidden: Group ID required for admin check");

    const isGroupAdmin = currentUser.memberships.some(m => 
        m.groupId === groupId && m.roleName.toLowerCase().includes('admin')
    );

    if (!isGroupAdmin) throw new Error("Forbidden: You are not an admin of this group");
    return currentUser;
}

/* ======================
   GET GROUPS
====================== */
export async function getGroups() {
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");

    // Strictly check for System Super Admin (e.g. Thoriq)
    // Must have 'super_admin' role in the System Group (ID: 1, slug: 'default')
    const isSystemSuperAdmin = currentUser.memberships.some(m => 
        (m.groupSlug === 'default' || m.groupId === 1) && 
        m.roleName.toLowerCase().includes('super')
    );

    const where: any = {};

    if (!isSystemSuperAdmin) {
        // Show groups where user is a member
        // For Organization Admin, they will see their own group(s).
        const groupIds = currentUser.memberships.map(m => m.groupId);
        where.id = { in: groupIds };
    }

    return prisma.group.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { 
                    members: true,
                    cctvs: true
                }
            }
        }
    });
}

export async function getGroupById(id: number) {
    // Both Super Admin and Group Members should be able to see details?
    // Let's restrict to Members/Admins.
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");
    
    const isSuper = currentUser.memberships.some(m => m.roleName.toLowerCase().includes('super'));
    const isMember = currentUser.memberships.some(m => m.groupId === id);

    if (!isSuper && !isMember) throw new Error("Forbidden");

    return prisma.group.findUnique({
        where: { id },
        include: {
            members: {
                include: {
                    user: true,
                    role: true
                }
            },
            roles: true,
            cctvs: true
        }
    });
}

/* ======================
   CREATE GROUP
   (Strictly Super Admin Only)
====================== */
export async function createGroup(formData: FormData) {
    await requireSuperAdmin();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "on";

    if (!name || !slug) throw new Error("Nama dan Slug wajib diisi");

    // Check slug uniqueness
    const existing = await prisma.group.findUnique({ where: { slug } });
    if (existing) throw new Error("Slug sudah digunakan");

    await prisma.$transaction(async (tx) => {
        // 1. Create Group
        const group = await tx.group.create({
            data: {
                name,
                slug,
                description,
                isPublic
            }
        });

        // 2. Create Default Roles
        for (const role of DEFAULT_ROLES) {
            await tx.role.create({
                data: {
                    groupId: group.id,
                    name: role.name,
                    slug: role.slug,
                    description: role.description,
                    isSystem: role.isSystem
                }
            });
        }
    });

    revalidatePath("/admin/groups");
}

/* ======================
   UPDATE GROUP
   (Super Admin OR Group Admin)
====================== */
export async function updateGroup(id: number, formData: FormData) {
    // Allow Group Admin to update their own group
    await requireGroupAdmin(id);

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "on";

    // 1. Get current group data
    const currentGroup = await prisma.group.findUnique({
        where: { id }
    });

    if (!currentGroup) {
        throw new Error("Group not found");
    }

    // 2. Prepare update data
    const updateData: any = {
        name,
        description,
        isPublic
    };

    // 3. Handle Slug Update
    if (slug && slug !== currentGroup.slug) {
        // Prevent changing default group's slug
        if (currentGroup.slug === 'default') {
             // We just ignore the slug change or throw error. 
             // Throwing error is safer to let user know why it didn't change if they tried.
             // But for UX, if the form was hacked to enable it, we just ignore it.
             // Let's silently ignore to prevent breaking if client sent it.
        } else {
             // Check uniqueness
             const existing = await prisma.group.findUnique({
                 where: { slug }
             });
             if (existing) {
                 throw new Error("Slug already taken");
             }
             updateData.slug = slug;
        }
    }

    await prisma.group.update({
        where: { id },
        data: updateData
    });

    revalidatePath("/admin/groups");
    revalidatePath("/admin/settings"); // Revalidate settings page too
}

/* ======================
   DELETE GROUP
   (Strictly Super Admin Only)
====================== */
export async function deleteGroup(id: number) {
    await requireSuperAdmin();

    // Check if default group (slug 'default') - protect it
    const group = await prisma.group.findUnique({ where: { id } });
    if (group?.slug === "default") {
        throw new Error("Grup default tidak boleh dihapus");
    }

    await prisma.group.delete({
        where: { id }
    });

    revalidatePath("/admin/groups");
}
