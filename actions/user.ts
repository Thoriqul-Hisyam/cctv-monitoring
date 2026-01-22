"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getUserWithMemberships, requireAuth } from "@/lib/auth";

/* ======================
   GET USERS
====================== */
export async function getUsers() {
    // Permission check
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");

    // Check if SYSTEM Super Admin (Thoriq)
    const isSystemSuperAdmin = currentUser.memberships.some(m => 
        (m.groupSlug === 'default' || m.groupId === 1) && 
        m.roleName.toLowerCase().includes('super')
    );

    const where: any = {};

    if (!isSystemSuperAdmin) {
        // Basic Admin check: Must be Admin (or Org Super Admin) of SOME group
        const adminGroups = currentUser.memberships
            .filter(m => m.roleName.toLowerCase().includes('admin') || m.roleName.toLowerCase().includes('super')) // Include 'super' here as they are admins of their group
            .map(m => m.groupId);
        
        if (adminGroups.length === 0) throw new Error("Forbidden");

        // Only show users who are members of my Admin/Super Groups
        where.memberships = {
            some: {
                groupId: { in: adminGroups }
            }
        };
    }

    // Get all users with their memberships
    return prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            memberships: {
                include: {
                    group: true,
                    role: true
                }
            }
        }
    });
}

/* ======================
   GET USER BY ID
====================== */
export async function getUserById(id: number) {
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");
    
    // Check if admin or self
    const isAdmin = currentUser.memberships.some(m => 
        m.roleName.toLowerCase().includes('admin') || 
        m.roleName.toLowerCase().includes('super')
    );

    if (!isAdmin && currentUser.id !== id) throw new Error("Forbidden");

    return prisma.user.findUnique({
        where: { id },
        include: {
            memberships: {
                include: {
                    group: true,
                    role: true
                }
            }
        }
    });
}

/* ======================
   CREATE USER
====================== */
export async function createUser(formData: FormData) {
    // 1. Auth & Permission Check
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");
    
    // Determine context
    // System Super Admin (Thoriq) -> Can create in ANY group (via selection or default).
    const isSystemSuperAdmin = currentUser.memberships.some(m => 
        (m.groupSlug === 'default' || m.groupId === 1) && 
        m.roleName.toLowerCase().includes('super')
    );
    
    // Find groups where user is Admin (for Org Admins)
    const adminGroupIds = currentUser.memberships
        .filter(m => m.roleName.toLowerCase().includes('admin'))
        .map(m => m.groupId);

    if (!isSystemSuperAdmin && adminGroupIds.length === 0) throw new Error("Forbidden");

    // 2. Validate Input
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const roleSlug = formData.get("role") as string;
    
    // Allow selecting group IF System Super Admin
    let targetGroupId: number = 0;
    
    if (isSystemSuperAdmin) {
        const formGroupId = formData.get("groupId");
        if (formGroupId) {
             targetGroupId = Number(formGroupId);
        } else {
             // Fallback to default
             const defGroup = await prisma.group.findFirst({ where: { slug: "default" } });
             if (defGroup) targetGroupId = defGroup.id;
        }
    } else {
        // Regular Group Admin -> Assign to their group
        targetGroupId = adminGroupIds[0];
    }
    
    if (!targetGroupId) throw new Error("Target Group undetermined");

    if (!username || !password || !name) {
        throw new Error("Data tidak lengkap");
    }

    // 3. Logic
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find Role ID based on slug within TARGET GROUP
    // Note: Roles need to share slugs across groups for this to work elegantly via templates
    // or we look up by slug & groupId.
    const role = await prisma.role.findFirst({
        where: { 
            groupId: targetGroupId,
            slug: roleSlug 
        }
    });

    if (!role) throw new Error(`Role '${roleSlug}' not available in the target group`);

    // Create User and Membership
    await prisma.$transaction(async (tx) => {
        // Reuse existing user if email matches? Or strict uniqueness?
        // Check username uniqueness
        const existing = await tx.user.findUnique({ where: { username } });
        if (existing) throw new Error("Username already taken");

        const user = await tx.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                email,
                isActive: true
            }
        });

        await tx.userGroup.create({
            data: {
                userId: user.id,
                groupId: targetGroupId,
                roleId: role.id
            }
        });
    });

    revalidatePath("/admin/users");
}

/* ======================
   UPDATE USER
====================== */
export async function updateUser(id: number, formData: FormData) {
    // 1. Auth & Permission Check
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");
    
    const isAdmin = currentUser.memberships.some(m => 
        m.roleName.toLowerCase().includes('admin') || 
        m.roleName.toLowerCase().includes('super')
    );
    if (!isAdmin) throw new Error("Forbidden");

    // 2. Validate Input
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const roleSlug = formData.get("role") as string;
    const isActive = formData.get("isActive") === "true";

    // 3. Prepare Update Data
    const updateData: any = {
        name,
        email,
        isActive
    };

    if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 10);
    }

    // 4. Update
    await prisma.$transaction(async (tx) => {
        // Update basic info
        await tx.user.update({
            where: { id },
            data: updateData
        });

        // Determine Target Group for Role Update
        // Logic: 
        // 1. If System Super Admin -> Update in User's existing first group (or Default if none).
        // 2. If Group Admin -> Update in the group they manage.

        const isSystemSuper = currentUser.memberships.some(m => 
            (m.groupSlug === 'default' || m.groupId === 1) && 
            m.roleName.toLowerCase().includes('super')
        );

        const targetUserMemberships = await tx.userGroup.findMany({
            where: { userId: id }
        });

        let targetGroupId: number | null = null;

        if (isSystemSuper) {
            // Pick first existing group or Default
            if (targetUserMemberships.length > 0) {
                targetGroupId = targetUserMemberships[0].groupId;
            } else {
                 const defGroup = await tx.group.findFirst({ where: { slug: "default" } });
                 targetGroupId = defGroup?.id ?? null;
            }
        } else {
            // Find intersection between Admin's managed groups and User's memberships
            const adminGroupIds = currentUser.memberships
                .filter(m => m.roleName.toLowerCase().includes('admin'))
                .map(m => m.groupId);
            
            const commonGroup = targetUserMemberships.find(m => adminGroupIds.includes(m.groupId));
            targetGroupId = commonGroup?.groupId ?? null;
        }

        if (targetGroupId && roleSlug) {
            // Find Role ID in target group
            const role = await tx.role.findFirst({
                where: { groupId: targetGroupId, slug: roleSlug }
            });

            if (role) {
                // Upsert membership
                await tx.userGroup.upsert({
                    where: { userId_groupId: { userId: id, groupId: targetGroupId } },
                    update: { roleId: role.id },
                    create: {
                        userId: id,
                        groupId: targetGroupId,
                        roleId: role.id
                    }
                });
            }
        }
    });

    revalidatePath("/admin/users");
}

/* ======================
   DELETE USER
====================== */
export async function deleteUser(id: number) {
    const currentUser = await getUserWithMemberships();
    if (!currentUser) throw new Error("Unauthorized");
    
    // Prevent self-delete
    if (currentUser.id === id) throw new Error("Cannot delete yourself");

    const isAdmin = currentUser.memberships.some(m => 
        m.roleName.toLowerCase().includes('admin') || 
        m.roleName.toLowerCase().includes('super')
    );
    if (!isAdmin) throw new Error("Forbidden");

    await prisma.user.delete({
        where: { id }
    });

    revalidatePath("/admin/users");
}
