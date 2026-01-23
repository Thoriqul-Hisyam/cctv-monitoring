"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { buildHikvisionRtsp } from "@/lib/hikvision";
import { getUserWithMemberships, getUserId } from "@/lib/auth";
import { Prisma } from "@prisma/client";

interface GetCctvsFilter {
  publicOnly?: boolean;
  userId?: number; // Maps to createdById
  groupId?: number;
}

// Helper to check for Super Admin
// Helper to check for System Super Admin (Thoriq/Platform Owner)
async function isSystemSuperAdminUser(): Promise<boolean> {
  const user = await getUserWithMemberships();
  if (!user) return false;
  
  // Strictly check for Super Admin role in Default/System Group (ID 1)
  return user.memberships.some(m => 
      (m.groupSlug === 'default' || m.groupId === 1) && 
      m.roleName.toLowerCase().includes('super')
  );
}

// Helper to trigger stream server sync
async function triggerStreamServerSync() {
    try {
        // Fire and forget
        fetch("http://localhost:3001/api/sync", { method: "POST" }).catch(err => console.error("Sync trigger failed:", err));
    } catch (e) {
        // Ignore
    }
}

export async function getCctvs(filter?: GetCctvsFilter) {
  const userId = await getUserId();
  const where: Prisma.CctvWhereInput = {};

  // Public Access
  if (filter?.publicOnly) {
    where.isPublic = true;
    if (filter.userId) where.createdById = filter.userId;
    return prisma.cctv.findMany({ 
      where, 
      orderBy: { createdAt: "desc" }, 
      select: {
        id: true,
        name: true,
        rt: true,
        rw: true,
        wilayah: true,
        kecamatan: true,
        kota: true,
        isActive: true,
        isPublic: true,
        slug: true,
        createdById: true,
        groupId: true,
        group: {
           select: { name: true, slug: true }
        }
      } 
    });
  }

  // Protected Access
  if (!userId) return []; 

  const isSystemSuper = await isSystemSuperAdminUser();

  // If NOT System Super Admin, restrict to own CCTVs OR CCTVs in their groups
  if (!isSystemSuper) {
    const user = await getUserWithMemberships();
    const groupIds = user?.memberships.map(m => m.groupId) || [];
    
    where.OR = [
      { createdById: userId },
      { groupId: { in: groupIds } }
    ];
  } else {
    // System Super Admin can see all, or filter
    if (filter?.userId) {
      where.createdById = filter.userId;
    }
    if (filter?.groupId) {
      where.groupId = filter.groupId;
    }
  }

  return prisma.cctv.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      rt: true,
      rw: true,
      wilayah: true,
      kecamatan: true,
      kota: true,
      isActive: true,
      isPublic: true,
      slug: true,
      createdById: true,
      groupId: true,
      group: {
         select: { name: true, slug: true }
      }
    }
  });
}

export async function getCctvBySlug(slug: string) {
    return prisma.cctv.findUnique({
        where: { slug }
    });
}

/* ======================
   CREATE CCTV
====================== */
export async function createCctv(formData: FormData) {
  const ipAddress = formData.get("ipAddress") as string;
  const port = Number(formData.get("port") || 554);
  const username = formData.get("username") as string | null;
  const password = formData.get("password") as string | null;
  const channel = Number(formData.get("channel") || 102);

  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const isSystemSuper = await isSystemSuperAdminUser();
  const isPublicInput = formData.get("isPublic") === "on";
  
  // Only System Super Admin can mark as Public? Or Org Admin too? 
  // User request: "only organization B...". Usually public is a sensitive flag.
  // Let's allow Org Admin to set public for their own group if needed, 
  // BUT previous logic was "isSuper ? isPublicInput : false". 
  // Let's stick to System Super Admin for Public for now to be safe, or allow Org Admin.
  // Given "Multi-tenant", maybe Org B wants public CCTVs. 
  // Let's allow if they are Admin.
  
  const user = await getUserWithMemberships();
  
  // Group Assignment Logic
  const groupIdInput = formData.get("groupId");
  let groupId: number | null = null;
  let hasAdminAccessToGroup = false;

  if (groupIdInput) {
      groupId = Number(groupIdInput);
      hasAdminAccessToGroup = isSystemSuper || (user?.memberships.some(m => 
        m.groupId === groupId && (m.roleName.toLowerCase().includes('admin') || m.roleName.toLowerCase().includes('operator'))
      ) ?? false);
      
      if (!hasAdminAccessToGroup) throw new Error("Forbidden: No access to this group");
  } else {
      // Fallback: Pick their first admin OR operator group
      const firstAccessGroup = user?.memberships.find(m => 
          m.roleName.toLowerCase().includes('admin') || m.roleName.toLowerCase().includes('operator')
      );
      groupId = firstAccessGroup?.groupId ?? null;
      hasAdminAccessToGroup = !!firstAccessGroup;
  }
  
  // STRICT: If not System Super Admin and no Group Admin/Operator access, DENY.
  if (!isSystemSuper && !hasAdminAccessToGroup) {
      throw new Error("Forbidden: You must be an Admin or Operator to create a CCTV");
  }
  
  // Allow public if System Super OR Admin of the target group
  const isPublic = hasAdminAccessToGroup ? isPublicInput : false;
  const slug = crypto.randomUUID();

  const streamUrl = buildHikvisionRtsp({
    ipAddress,
    port,
    username,
    password,
    channel,
  });

  await prisma.cctv.create({
    data: {
      name: formData.get("name") as string,

      rt: formData.get("rt") as string,
      rw: formData.get("rw") as string,
      wilayah: formData.get("wilayah") as string,
      kecamatan: formData.get("kecamatan") as string,
      kota: formData.get("kota") as string,
      latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
      longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,

      ipAddress,
      port,
      username,
      password,
      channel,
      streamUrl,
      
      slug,
      isActive: formData.get("isActive") === "true",
      isPublic,
      createdById: userId,
      groupId: groupId,
      updatedAt: new Date(),
    },
  });

  triggerStreamServerSync();
  revalidatePath("/cctv");
  revalidatePath("/admin/cctv");
}

/* ======================
   UPDATE CCTV
====================== */
/* ======================
   UPDATE CCTV
====================== */
export async function updateCctv(id: number, formData: FormData) {
  const ipAddress = formData.get("ipAddress") as string;
  const port = Number(formData.get("port") || 554);
  const username = formData.get("username") as string | null;
  const password = formData.get("password") as string | null;
  const channel = Number(formData.get("channel") || 102);
  
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const currentCctv = await prisma.cctv.findUnique({ where: { id } });
  if (!currentCctv) throw new Error("Not Found");

  // Permission Logic: Super Admin OR Owner OR Admin of the CCTV's Group
  const currentUser = await getUserWithMemberships();
  
  // 1. System Super Admin (Thoriq) - Can edit anything
  const isSystemSuperAdmin = currentUser?.memberships.some(m => 
      (m.groupSlug === 'default' || m.groupId === 1) && 
      m.roleName.toLowerCase().includes('super')
  ) || false;

  // 2. Owner - Can edit own creation (Scope: usually within their group, but ownership is strong)
  const isOwner = currentCctv.createdById === userId;

  // 3. Group Admin OR Operator - Can edit ONLY if they are Admin/Operator of the CCTV's assigned ID
  const isCCTVGroupManager = currentCctv.groupId ? currentUser?.memberships.some(m => 
      m.groupId === currentCctv.groupId && (m.roleName.toLowerCase().includes('admin') || m.roleName.toLowerCase().includes('operator'))
  ) : false;

  if (!isSystemSuperAdmin && !isOwner && !isCCTVGroupManager) {
     throw new Error("Forbidden: You do not have permission to edit this CCTV");
  }

  const isPublicInput = formData.get("isPublic") === "on";
  // Only Super/Group Admin can change isPublic. Owner? Maybe. Let's allow admins.
  const canManageVisibility = isSystemSuperAdmin || isCCTVGroupManager;
  const isPublic = canManageVisibility ? isPublicInput : currentCctv.isPublic;

  const streamUrl = buildHikvisionRtsp({
    ipAddress,
    port,
    username,
    password,
    channel,
  });

  // Group Assignment Logic
  const groupIdInput = formData.get("groupId");
  let groupId = currentCctv.groupId;

  if (groupIdInput) {
      const newGroupId = Number(groupIdInput);
      // Only Super Admin or Admin of TARGET group can assign
      // If I am Admin of Group A, I can assign to Group A.
      // Can I move from Group A to Group B? Only if I am Admin of BOTH (or Super).
      
      const canAssignToTarget = isSystemSuperAdmin || currentUser?.memberships.some(m => 
          m.groupId === newGroupId && m.roleName.toLowerCase().includes('admin')
      );

      if (!canAssignToTarget) {
         throw new Error("Forbidden: No admin access to target group");
      }
      
      groupId = newGroupId;
  }

  await prisma.cctv.update({
    where: { id },
    data: {
      name: formData.get("name") as string,

      rt: formData.get("rt") as string,
      rw: formData.get("rw") as string,
      wilayah: formData.get("wilayah") as string,
      kecamatan: formData.get("kecamatan") as string,
      kota: formData.get("kota") as string,
      latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
      longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,

      ipAddress,
      port,
      username,
      password,
      channel,
      streamUrl,

      isActive: formData.get("isActive") === "true",
      isPublic,
      groupId: groupId,
      updatedAt: new Date(),
    },
  });

  triggerStreamServerSync();
  revalidatePath("/cctv");
  revalidatePath("/admin/cctv");
}

/* ======================
   DELETE CCTV
====================== */
export async function deleteCctv(id: number) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const currentCctv = await prisma.cctv.findUnique({ where: { id } });
  if (!currentCctv) throw new Error("Not Found");

  // Permission Logic: Super Admin OR Owner OR Admin of the CCTV's Group
  const currentUser = await getUserWithMemberships();
  const isSuper = currentUser?.memberships.some(m => m.roleName.toLowerCase().includes('super')) || false;
  const isOwner = currentCctv.createdById === userId;
  const isGroupManager = currentCctv.groupId ? currentUser?.memberships.some(m => 
      m.groupId === currentCctv.groupId && (m.roleName.toLowerCase().includes('admin') || m.roleName.toLowerCase().includes('operator'))
  ) : false;

  if (!isSuper && !isOwner && !isGroupManager) {
     throw new Error("Forbidden");
  }

  await prisma.cctv.delete({
    where: { id },
  });

  triggerStreamServerSync();
  revalidatePath("/cctv");
  revalidatePath("/admin/cctv");
}

/* ======================
   REGENERATE SLUG
   (Admin/Owner Only)
====================== */
export async function regenerateCctvSlug(id: number) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const currentCctv = await prisma.cctv.findUnique({ where: { id } });
  if (!currentCctv) throw new Error("Not Found");

  // Permission Logic: Same as Update
  const currentUser = await getUserWithMemberships();
  
  const isSystemSuperAdmin = currentUser?.memberships.some(m => 
      (m.groupSlug === 'default' || m.groupId === 1) && 
      m.roleName.toLowerCase().includes('super')
  ) || false;

  const isOwner = currentCctv.createdById === userId;

  const isCCTVGroupManager = currentCctv.groupId ? currentUser?.memberships.some(m => 
      m.groupId === currentCctv.groupId && (m.roleName.toLowerCase().includes('admin') || m.roleName.toLowerCase().includes('operator'))
  ) : false;

  if (!isSystemSuperAdmin && !isOwner && !isCCTVGroupManager) {
     throw new Error("Forbidden: You do not have permission to regenerate slug for this CCTV");
  }

  const newSlug = crypto.randomUUID();

  await prisma.cctv.update({
    where: { id },
    data: {
      slug: newSlug,
      updatedAt: new Date(),
    },
  });

  triggerStreamServerSync();
  revalidatePath("/cctv");
  revalidatePath("/admin/cctv");
  revalidatePath(`/admin/cctv/${id}/edit`);
}

/* ======================
   TOGGLE ACTIVE STATUS
   (Admin/Operator/Owner)
====================== */
export async function toggleCCTVActive(id: number, isActive: boolean) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const currentCctv = await prisma.cctv.findUnique({ where: { id } });
  if (!currentCctv) throw new Error("Not Found");

  // Permission Logic: Same as Update
  const currentUser = await getUserWithMemberships();
  
  const isSystemSuperAdmin = currentUser?.memberships.some(m => 
      (m.groupSlug === 'default' || m.groupId === 1) && 
      m.roleName.toLowerCase().includes('super')
  ) || false;

  const isOwner = currentCctv.createdById === userId;

  const isCCTVGroupManager = currentCctv.groupId ? currentUser?.memberships.some(m => 
      m.groupId === currentCctv.groupId && (m.roleName.toLowerCase().includes('admin') || m.roleName.toLowerCase().includes('operator'))
  ) : false;

  if (!isSystemSuperAdmin && !isOwner && !isCCTVGroupManager) {
     throw new Error("Forbidden: You do not have permission to change status for this CCTV");
  }

  await prisma.cctv.update({
    where: { id },
    data: {
      isActive,
      updatedAt: new Date(),
    },
  });

  triggerStreamServerSync();
  revalidatePath("/cctv");
  revalidatePath("/");
  revalidatePath("/admin/cctv");
}
