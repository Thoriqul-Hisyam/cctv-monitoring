"use server";

import { prisma } from "@/lib/prisma";
import { getUserWithMemberships } from "@/lib/auth";

export async function getDashboardStats() {
    const user = await getUserWithMemberships();
    if (!user) throw new Error("Unauthorized");

    // Check permissions
    const isSystemSuperAdmin = user.memberships.some(m => 
        (m.groupSlug === 'default' || m.groupId === 1) && 
        m.roleName.toLowerCase().includes('super')
    );

    const managedGroupIds = user.memberships
        .filter(m => m.roleName.toLowerCase().includes('admin') || m.roleName.toLowerCase().includes('super'))
        .map(m => m.groupId);

    const cctvWhere: any = {};
    const userWhere: any = {};

    if (!isSystemSuperAdmin) {
        // CCTV: Only in managed groups OR created by user
        cctvWhere.OR = [
            { createdById: user.id },
            { groupId: { in: managedGroupIds } }
        ];

        // User: Only members of managed groups
        userWhere.memberships = {
            some: {
                groupId: { in: managedGroupIds }
            }
        };
    }

    const [totalCctv, onlineCctv, offlineCctv, totalUsers] = await Promise.all([
        prisma.cctv.count({ where: cctvWhere }),
        prisma.cctv.count({ where: { ...cctvWhere, isActive: true } }),
        prisma.cctv.count({ where: { ...cctvWhere, isActive: false } }),
        prisma.user.count({ where: userWhere })
    ]);

    // Format for UI
    return [
        { label: "Total CCTV", value: totalCctv.toString(), change: "+0", color: "blue" },
        { label: "Online", value: onlineCctv.toString(), change: "+0", color: "green" },
        { label: "Offline", value: offlineCctv.toString(), change: "+0", color: "red" },
        { label: "Total Users", value: totalUsers.toString(), change: "+0", color: "purple" }
    ];
}

export async function getRecentActivities() {
    const user = await getUserWithMemberships();
    if (!user) return [];

    const isSystemSuperAdmin = user.memberships.some(m => 
        (m.groupSlug === 'default' || m.groupId === 1) && 
        m.roleName.toLowerCase().includes('super')
    );

    const managedGroupIds = user.memberships
        .filter(m => m.roleName.toLowerCase().includes('admin') || m.roleName.toLowerCase().includes('super'))
        .map(m => m.groupId);

    const cctvWhere: any = {};
    if (!isSystemSuperAdmin) {
        cctvWhere.OR = [
            { createdById: user.id },
            { groupId: { in: managedGroupIds } }
        ];
    }

    // Since we don't have an activity log table, let's fetch NEWEST CCTVs & USERS
    const [newCctvs, newUsers] = await Promise.all([
        prisma.cctv.findMany({
            where: cctvWhere,
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { name: true, createdAt: true, group: { select: { name: true } } }
        }),
        prisma.user.findMany({
            where: !isSystemSuperAdmin ? {
                memberships: { some: { groupId: { in: managedGroupIds } } }
            } : {},
            orderBy: { createdAt: "desc" },
            take: 2,
            select: { name: true, username: true, createdAt: true }
        })
    ]);

    const activities = [
        ...newCctvs.map(c => ({
            type: "cctv",
            title: "CCTV Baru Ditambahkan",
            description: `${c.name} • ${c.group?.name || "No Group"}`,
            time: c.createdAt,
            color: "green"
        })),
        ...newUsers.map(u => ({
            type: "user",
            title: "User Baru Terdaftar",
            description: `${u.name || u.username} • @${u.username}`,
            time: u.createdAt,
            color: "blue"
        }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

    return activities;
}
