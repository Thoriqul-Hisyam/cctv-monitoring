"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { buildHikvisionRtsp } from "@/lib/hikvision";

export async function getCctvs() {
  return prisma.cctv.findMany({
    orderBy: { createdAt: "desc" },
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

      ipAddress,
      port,
      username,
      password,
      channel,
      streamUrl,

      isActive: formData.get("isActive") === "true",
    },
  });

  revalidatePath("/cctv");
}

/* ======================
   UPDATE CCTV
====================== */
export async function updateCctv(id: number, formData: FormData) {
  const ipAddress = formData.get("ipAddress") as string;
  const port = Number(formData.get("port") || 554);
  const username = formData.get("username") as string | null;
  const password = formData.get("password") as string | null;
  const channel = Number(formData.get("channel") || 102);

  const streamUrl = buildHikvisionRtsp({
    ipAddress,
    port,
    username,
    password,
    channel,
  });

  await prisma.cctv.update({
    where: { id },
    data: {
      name: formData.get("name") as string,

      rt: formData.get("rt") as string,
      rw: formData.get("rw") as string,
      wilayah: formData.get("wilayah") as string,
      kecamatan: formData.get("kecamatan") as string,
      kota: formData.get("kota") as string,

      ipAddress,
      port,
      username,
      password,
      channel,
      streamUrl,

      isActive: formData.get("isActive") === "true",
    },
  });

  revalidatePath("/cctv");
}

/* ======================
   DELETE CCTV
====================== */
export async function deleteCctv(id: number) {
  await prisma.cctv.delete({
    where: { id },
  });

  revalidatePath("/cctv");
}
