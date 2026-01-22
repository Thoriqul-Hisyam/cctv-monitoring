"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// ============================================
// TYPES
// ============================================
export type UserPermissions = {
  userId: number;
  groupId: number;
  roleId: number;
  roleName: string;
  permissions: string[];
};

export type GroupMembership = {
  groupId: number;
  groupName: string;
  groupSlug: string;
  roleId: number;
  roleName: string;
  permissions: string[];
};

// ============================================
// GET USER PERMISSIONS IN A GROUP
// ============================================
export async function getUserPermissionsInGroup(
  userId: number,
  groupId: number
): Promise<UserPermissions | null> {
  const membership = await prisma.userGroup.findUnique({
    where: { userId_groupId: { userId, groupId } },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!membership) return null;

  return {
    userId,
    groupId,
    roleId: membership.roleId,
    roleName: membership.role.name,
    permissions: membership.role.permissions.map((rp) => rp.permission.slug),
  };
}

// ============================================
// GET ALL USER MEMBERSHIPS
// ============================================
export async function getUserMemberships(userId: number): Promise<GroupMembership[]> {
  const memberships = await prisma.userGroup.findMany({
    where: { userId },
    include: {
      group: true,
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  return memberships.map((m) => ({
    groupId: m.groupId,
    groupName: m.group.name,
    groupSlug: m.group.slug,
    roleId: m.roleId,
    roleName: m.role.name,
    permissions: m.role.permissions.map((rp) => rp.permission.slug),
  }));
}

// ============================================
// CHECK PERMISSION
// ============================================
export async function hasPermission(
  userId: number,
  groupId: number,
  permissionSlug: string
): Promise<boolean> {
  const permissions = await getUserPermissionsInGroup(userId, groupId);
  if (!permissions) return false;
  return permissions.permissions.includes(permissionSlug);
}

// ============================================
// CHECK MULTIPLE PERMISSIONS (ANY)
// ============================================
export async function hasAnyPermission(
  userId: number,
  groupId: number,
  permissionSlugs: string[]
): Promise<boolean> {
  const permissions = await getUserPermissionsInGroup(userId, groupId);
  if (!permissions) return false;
  return permissionSlugs.some((slug) => permissions.permissions.includes(slug));
}

// ============================================
// CHECK MULTIPLE PERMISSIONS (ALL)
// ============================================
export async function hasAllPermissions(
  userId: number,
  groupId: number,
  permissionSlugs: string[]
): Promise<boolean> {
  const permissions = await getUserPermissionsInGroup(userId, groupId);
  if (!permissions) return false;
  return permissionSlugs.every((slug) => permissions.permissions.includes(slug));
}

// ============================================
// CHECK GROUP MEMBERSHIP
// ============================================
export async function isGroupMember(userId: number, groupId: number): Promise<boolean> {
  const membership = await prisma.userGroup.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  return !!membership;
}

// ============================================
// REQUIRE PERMISSION (throws if not authorized)
// ============================================
export async function requirePermission(
  groupId: number,
  permissionSlug: string
): Promise<{ userId: number; permissions: UserPermissions }> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized: Not logged in");
  }

  const permissions = await getUserPermissionsInGroup(user.id, groupId);
  if (!permissions) {
    throw new Error("Forbidden: Not a member of this group");
  }

  if (!permissions.permissions.includes(permissionSlug)) {
    throw new Error(`Forbidden: Missing permission '${permissionSlug}'`);
  }

  return { userId: user.id, permissions };
}

// ============================================
// CAN ACCESS CCTV
// ============================================
export async function canAccessCctv(
  userId: number | null,
  cctvId: number
): Promise<{ allowed: boolean; reason: string }> {
  const cctv = await prisma.cctv.findUnique({
    where: { id: cctvId },
    include: { group: true },
  });

  if (!cctv) {
    return { allowed: false, reason: "CCTV not found" };
  }

  // Public CCTV - anyone can access
  if (cctv.isPublic) {
    return { allowed: true, reason: "Public CCTV" };
  }

  // Private CCTV requires login
  if (!userId) {
    return { allowed: false, reason: "Authentication required" };
  }

  // Check if user is member of the group
  if (cctv.groupId) {
    const isMember = await isGroupMember(userId, cctv.groupId);
    if (isMember) {
      return { allowed: true, reason: "Group member" };
    }
  }

  // Check if user created this CCTV
  if (cctv.createdById === userId) {
    return { allowed: true, reason: "CCTV creator" };
  }

  return { allowed: false, reason: "Access denied" };
}

// ============================================
// CAN ACCESS CCTV BY SLUG (Public via slug)
// ============================================
export async function canAccessCctvBySlug(
  slug: string
): Promise<{ allowed: boolean; cctv: any | null; reason: string }> {
  const cctv = await prisma.cctv.findUnique({
    where: { slug },
    include: { group: true },
  });

  if (!cctv) {
    return { allowed: false, cctv: null, reason: "CCTV not found" };
  }

  // Access via valid slug is always allowed (unlisted access)
  return { allowed: true, cctv, reason: "Valid slug access" };
}

// ============================================
// GET ACCESSIBLE GROUPS FOR USER
// ============================================
export async function getAccessibleGroups(userId: number | null) {
  // Public groups are always visible
  const publicGroups = await prisma.group.findMany({
    where: { isPublic: true },
  });

  if (!userId) {
    return publicGroups;
  }

  // Get groups where user is a member
  const memberGroups = await prisma.group.findMany({
    where: {
      members: { some: { userId } },
    },
  });

  // Combine and deduplicate
  const allGroups = [...publicGroups, ...memberGroups];
  const uniqueGroups = allGroups.filter(
    (group, index, self) => index === self.findIndex((g) => g.id === group.id)
  );

  return uniqueGroups;
}

// ============================================
// GET ACCESSIBLE CCTVs FOR USER IN GROUP
// ============================================
export async function getAccessibleCctvs(userId: number | null, groupId: number) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    return [];
  }

  // If group is public or user is member, show all CCTVs
  let showAll = group.isPublic;
  
  if (userId && !showAll) {
    showAll = await isGroupMember(userId, groupId);
  }

  if (showAll) {
    // Members see all CCTVs in the group
    return prisma.cctv.findMany({
      where: { groupId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  // Non-members only see public CCTVs
  return prisma.cctv.findMany({
    where: { groupId, isActive: true, isPublic: true },
    orderBy: { name: "asc" },
  });
}

// ============================================
// REGENERATE CCTV SLUG
// ============================================
export async function regenerateCctvSlug(cctvId: number): Promise<string> {
  const newSlug = crypto.randomUUID();
  
  await prisma.cctv.update({
    where: { id: cctvId },
    data: { slug: newSlug },
  });

  return newSlug;
}

// ============================================
// PERMISSION CONSTANTS
// ============================================
export const PERMISSIONS = {
  VIEW_CCTV: "view_cctv",
  MANAGE_CCTV: "manage_cctv",
  VIEW_PRIVATE_CCTV: "view_private_cctv",
  STREAM_CCTV: "stream_cctv",
  VIEW_USER: "view_user",
  MANAGE_USER: "manage_user",
  INVITE_USER: "invite_user",
  VIEW_ROLE: "view_role",
  MANAGE_ROLE: "manage_role",
  VIEW_GROUP: "view_group",
  MANAGE_GROUP: "manage_group",
  DELETE_GROUP: "delete_group",
} as const;
