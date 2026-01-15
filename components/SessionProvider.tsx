"use client";
import { createContext, useContext } from "react";
import type { Session } from "@/lib/auth"; // tipe dari server

export type AppSession = {
  username: string;
  role: string;
} | null;

const SessionCtx = createContext<AppSession>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: AppSession;
  children: React.ReactNode;
}) {
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  return useContext(SessionCtx);
}

// helper untuk convert server session ke AppSession
export function mapServerSession(session: Session | null): AppSession {
  if (!session) return null;
  return {
    username: session.username,
    role: session.role,
  };
}
