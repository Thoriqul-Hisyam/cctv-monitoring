import { ReactNode } from "react";

export const dynamic = "force-dynamic";

import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
