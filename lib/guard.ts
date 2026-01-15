import { readSession } from "@/lib/auth";

export async function requirePermission(...need: string[]) {
  const session = await readSession();
  if (!session) throw new Error("Unauthorized");

  return session;
}
