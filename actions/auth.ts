"use server";

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { signSession, clearSession, type Session } from "@/lib/auth";

export async function login(input: unknown): Promise<{ redirect: string }> {
  const body = input as { username?: string; password?: string };
  if (!body?.username || !body?.password)
    throw new Error("Username dan password wajib diisi.");

  const user = await prisma.user.findUnique({
    where: { username: body.username },
  });
  if (!user) throw new Error("Akun tidak ditemukan.");

  const valid = await compare(body.password, user.password);
  if (!valid) throw new Error("Username atau password salah.");

  const session: Session = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };
  await signSession(session);

  return { redirect: "/admin" };
}

export async function logout() {
  await clearSession();
}
