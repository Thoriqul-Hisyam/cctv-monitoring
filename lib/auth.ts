"use server";

export type Session = {
  sub: string | number;
  username: string;
  role: string;
};

export async function readSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      sub: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function login(prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { error: "Username dan password harus diisi" };
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { error: "Username atau password salah" };
    }

    // Verifikasi password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return { error: "Username atau password salah" };
    }

    // Buat JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Terjadi kesalahan saat login" };
  }

  redirect("/admin");
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth-token");
  } catch (error) {
    console.error("Logout error:", error);
  }

  redirect("/login");
}

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
      role: string;
    };

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
